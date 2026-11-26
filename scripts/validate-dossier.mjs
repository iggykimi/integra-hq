#!/usr/bin/env node
/**
 * Zero-dependency integrity validator for the Integra HQ dossier,
 * JSON Schema contracts, DAG plans, mock event streams, and synthetic fixtures.
 *
 * Run: node scripts/validate-dossier.mjs
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failures.push({ name, message: err instanceof Error ? err.message : String(err) });
    console.error(`  [FAIL] ${name}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function readJson(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

function walkFiles(dir, predicate, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, predicate, acc);
    } else if (predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}

function daysBetween(startIso, endIso) {
  const ms = Date.parse(`${endIso}T00:00:00Z`) - Date.parse(`${startIso}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

function validatePlanDag(plan, allowedAgents, label) {
  assert.equal(typeof plan.objective, 'string', `${label}: objective must be string`);
  assert.ok(plan.objective.length >= 1 && plan.objective.length <= 300, `${label}: objective length out of range`);
  assert.ok(Array.isArray(plan.assumptions) && plan.assumptions.length <= 10, `${label}: invalid assumptions`);
  assert.ok(Array.isArray(plan.tasks) && plan.tasks.length >= 1 && plan.tasks.length <= 8, `${label}: tasks must be 1..8`);

  const idSet = new Set();
  const idPattern = /^[a-zA-Z0-9_-]{1,40}$/;

  for (const task of plan.tasks) {
    assert.ok(idPattern.test(task.id), `${label}: invalid task id "${task.id}"`);
    assert.ok(!idSet.has(task.id), `${label}: duplicate task id "${task.id}"`);
    idSet.add(task.id);
    assert.ok(allowedAgents.has(task.agent), `${label}: disallowed agent "${task.agent}"`);
    assert.ok(typeof task.instruction === 'string' && task.instruction.length >= 1 && task.instruction.length <= 1500, `${label}: invalid instruction on ${task.id}`);
    assert.ok(Array.isArray(task.dependsOn), `${label}: dependsOn must be array on ${task.id}`);
    assert.equal(new Set(task.dependsOn).size, task.dependsOn.length, `${label}: duplicate dependsOn on ${task.id}`);
    if ('requiresApproval' in task) {
      assert.equal(typeof task.requiresApproval, 'boolean', `${label}: requiresApproval must be boolean`);
    }
  }

  for (const task of plan.tasks) {
    for (const dep of task.dependsOn) {
      assert.ok(idSet.has(dep), `${label}: task "${task.id}" depends on unknown task "${dep}"`);
      assert.notEqual(dep, task.id, `${label}: task "${task.id}" depends on itself`);
    }
  }

  // Kahn's topological sort to prove acyclic DAG
  const inDegree = new Map();
  const dependents = new Map();
  for (const task of plan.tasks) {
    inDegree.set(task.id, task.dependsOn.length);
    dependents.set(task.id, []);
  }
  for (const task of plan.tasks) {
    for (const dep of task.dependsOn) {
      dependents.get(dep).push(task.id);
    }
  }
  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift();
    visited += 1;
    for (const next of dependents.get(current)) {
      const nextDeg = inDegree.get(next) - 1;
      inDegree.set(next, nextDeg);
      if (nextDeg === 0) queue.push(next);
    }
  }
  assert.equal(visited, plan.tasks.length, `${label}: cycle detected in task DAG`);
}

console.log('Running Integra HQ dossier & contract checks...\n');

// 1. All JSON files parse cleanly
const jsonFiles = walkFiles(ROOT, (f) => f.endsWith('.json'));
check(`All ${jsonFiles.length} repository JSON files parse cleanly`, () => {
  assert.ok(jsonFiles.length >= 15, 'Expected at least 15 JSON files');
  for (const file of jsonFiles) {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  }
});

// 2. JSON Schemas in 07_CONTRATOS/
const schemaFiles = walkFiles(path.join(ROOT, '07_CONTRATOS'), (f) => f.endsWith('.schema.json'));
const expectedSchemas = [
  'account_brief.schema.json',
  'architecture.schema.json',
  'billing_report.schema.json',
  'briefing.schema.json',
  'event.schema.json',
  'offer.schema.json',
  'plan.schema.json',
  'presentation.schema.json',
  'project_plan.schema.json',
];
check('All 9 P0 JSON Schemas exist with Draft 2020-12 and strict root additionalProperties', () => {
  const names = schemaFiles.map((f) => path.basename(f)).sort();
  assert.deepEqual(names, expectedSchemas);
  for (const file of schemaFiles) {
    const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema', `${path.basename(file)} wrong $schema`);
    assert.equal(schema.additionalProperties, false, `${path.basename(file)} missing root additionalProperties: false`);
  }
});

// 3. Agent registry coherence
const agentsDoc = readJson('04_AGENTES/agents.json');
const planSchema = readJson('07_CONTRATOS/plan.schema.json');
const eventSchema = readJson('07_CONTRATOS/event.schema.json');
const allowedSpecialists = new Set(planSchema.properties.tasks.items.properties.agent.enum);
const allowedEventAgents = new Set(eventSchema.properties.agent_id.enum);
const allowedEventTypes = new Set(eventSchema.properties.type.enum);

check('Agent registry defines 8 roles, valid prompts, and safe guardrail defaults', () => {
  assert.equal(agentsDoc.agents.length, 8);
  const ids = agentsDoc.agents.map((a) => a.id);
  assert.equal(new Set(ids).size, 8, 'Duplicate agent IDs');
  assert.ok(ids.includes('director'));

  for (const agent of agentsDoc.agents) {
    const promptPath = path.join(ROOT, '04_AGENTES', agent.prompt);
    assert.ok(fs.existsSync(promptPath), `Missing prompt file: ${agent.prompt}`);
    assert.ok(allowedEventAgents.has(agent.id), `Agent ${agent.id} missing in event.schema.json`);
    if (agent.id !== 'director') {
      assert.ok(allowedSpecialists.has(agent.id), `Specialist ${agent.id} missing in plan.schema.json`);
    }
  }

  assert.equal(agentsDoc.defaults.external_email, false);
  assert.equal(agentsDoc.defaults.production_access, false);
  assert.equal(agentsDoc.defaults.human_approval_required, true);
  assert.ok(agentsDoc.defaults.max_tasks_per_run <= 8);
  assert.ok(agentsDoc.defaults.max_concurrent_tasks <= 2);
});

// 4. Plan DAG validation (primary + secondary flows)
const fullPlan = readJson('07_CONTRATOS/fixtures/plan.json');
const archPlan = readJson('07_CONTRATOS/fixtures/plan.architecture-only.json');

check('Primary full-cycle plan DAG is valid, acyclic, and gates delivery/billing behind approved offer', () => {
  validatePlanDag(fullPlan, allowedSpecialists, 'plan.json');
  const offerTask = fullPlan.tasks.find((t) => t.agent === 'offers');
  const deliveryTask = fullPlan.tasks.find((t) => t.agent === 'delivery');
  const billingTask = fullPlan.tasks.find((t) => t.agent === 'billing');
  assert.ok(offerTask && offerTask.requiresApproval === true, 'offers task must require approval');
  assert.ok(deliveryTask && deliveryTask.dependsOn.includes(offerTask.id), 'delivery must depend on offers');
  assert.ok(billingTask && billingTask.dependsOn.includes(offerTask.id), 'billing must depend on offers');
});

check('Secondary architecture-only plan DAG proves variable team selection', () => {
  validatePlanDag(archPlan, allowedSpecialists, 'plan.architecture-only.json');
  const agentsUsed = new Set(archPlan.tasks.map((t) => t.agent));
  assert.deepEqual([...agentsUsed].sort(), ['architect', 'consultant']);
});

// 5. Event trace validation
const mockEvents = readJson('07_CONTRATOS/fixtures/events.mock.json');
check('Mock event stream conforms to event.schema.json, monotonic sequence, HITL pause/resume, and terminal state', () => {
  assert.ok(Array.isArray(mockEvents) && mockEvents.length >= 20);
  const planTaskIds = new Set(fullPlan.tasks.map((t) => t.id));
  const seenEventIds = new Set();
  const requiredKeys = Object.keys(eventSchema.properties).sort();
  let prevTime = -Infinity;

  mockEvents.forEach((ev, idx) => {
    assert.deepEqual(Object.keys(ev).sort(), requiredKeys, `Event ${idx + 1} key mismatch`);
    assert.ok(!seenEventIds.has(ev.event_id), `Duplicate event_id ${ev.event_id}`);
    seenEventIds.add(ev.event_id);
    assert.equal(ev.sequence, idx + 1, `Non-monotonic sequence at ${ev.event_id}`);
    assert.ok(allowedEventTypes.has(ev.type), `Invalid event type ${ev.type}`);
    assert.ok(allowedEventAgents.has(ev.agent_id), `Invalid agent_id ${ev.agent_id}`);
    if (ev.task_id !== null) {
      assert.ok(planTaskIds.has(ev.task_id), `Unknown task_id ${ev.task_id} in ${ev.event_id}`);
    }
    const ts = Date.parse(ev.timestamp);
    assert.ok(!Number.isNaN(ts), `Invalid timestamp in ${ev.event_id}`);
    assert.ok(ts >= prevTime, `Timestamp went backwards at ${ev.event_id}`);
    prevTime = ts;
    assert.equal(ev.payload.synthetic, true, `Event ${ev.event_id} must be flagged synthetic: true`);
  });

  const types = new Set(mockEvents.map((e) => e.type));
  for (const requiredType of [
    'request.received',
    'human.message',
    'plan.created',
    'approval.required',
    'run.paused',
    'approval.resolved',
    'run.resumed',
    'artifact.created',
    'project.completed',
  ]) {
    assert.ok(types.has(requiredType), `Mock stream missing event type ${requiredType}`);
  }
  const last = mockEvents[mockEvents.length - 1];
  assert.ok(['project.completed', 'project.failed', 'project.cancelled'].includes(last.type), 'Stream must end in terminal state');
});

// 6. Synthetic business fixtures cross-consistency
const crm = readJson('07_CONTRATOS/fixtures/data/crm/accounts.json');
const catalog = readJson('07_CONTRATOS/fixtures/data/catalog/services.json');
const portfolio = readJson('07_CONTRATOS/fixtures/data/projects/portfolio.json');
const billing = readJson('07_CONTRATOS/fixtures/data/billing/invoices.json');

check('Synthetic business fixtures are cross-consistent, dated 2026-11-26, and free of real data', () => {
  for (const [name, doc] of [
    ['crm', crm],
    ['catalog', catalog],
    ['portfolio', portfolio],
    ['billing', billing],
  ]) {
    assert.equal(doc.synthetic, true, `${name} must have synthetic: true`);
    assert.equal(doc.as_of, '2026-11-26', `${name} must share fixed as_of 2026-11-26`);
  }

  const accountIds = new Set(crm.accounts.map((a) => a.account_id));
  assert.ok(accountIds.has('ACC-NORTIA-001'));
  for (const acc of crm.accounts) {
    assert.ok(acc.primary_contact.email.endsWith('.example'), 'Use .example domain for synthetic email');
    for (const opp of acc.opportunities) {
      const days = daysBetween(opp.last_contact_date, crm.as_of);
      if (opp.status === 'stale') {
        assert.ok(days >= crm.stale_threshold_days, `Stale opportunity ${opp.id} is only ${days} days old`);
      } else if (opp.status === 'open') {
        assert.ok(days < crm.stale_threshold_days, `Open opportunity ${opp.id} should be marked stale (${days} days)`);
      }
    }
  }

  assert.equal(catalog.validation_status, 'pendiente de validación comercial');
  const serviceMap = new Map(catalog.services.map((s) => [s.service_id, s]));
  for (const svc of catalog.services) {
    assert.ok(svc.price_band_eur.min <= svc.price_band_eur.max, `Invalid band on ${svc.service_id}`);
  }

  for (const tpl of portfolio.phase_templates) {
    const svc = serviceMap.get(tpl.service_id);
    assert.ok(svc, `Portfolio phase ${tpl.phase_id} references unknown service ${tpl.service_id}`);
    assert.equal(tpl.duration_weeks, svc.duration_weeks, `Duration mismatch for ${tpl.service_id}`);
    assert.equal(tpl.estimated_hours, svc.estimated_hours, `Hours mismatch for ${tpl.service_id}`);
  }

  const contractIds = new Set(billing.contracts.map((c) => c.contract_id));
  for (const inv of billing.invoices) {
    assert.ok(accountIds.has(inv.account_id), `Invoice ${inv.invoice_id} unknown account`);
    assert.ok(contractIds.has(inv.contract_id), `Invoice ${inv.invoice_id} unknown contract`);
    const overdueDays = daysBetween(inv.due_date, billing.as_of);
    if (inv.status === 'overdue') {
      assert.ok(overdueDays > 0, `Overdue invoice ${inv.invoice_id} is not past due`);
    }
  }
});

// 7. Director prompt & brand assets sanity + basic secret check
check('Director prompt matches 8-agent scope and official brand SVGs exist', () => {
  const directorPrompt = fs.readFileSync(path.join(ROOT, '04_AGENTES/prompts/director.md'), 'utf8');
  assert.ok(!directorPrompt.includes('Los especialistas son consultant, architect y designer'), 'Outdated 4-agent text found in director.md');
  for (const role of allowedSpecialists) {
    assert.ok(directorPrompt.includes(`\`${role}\``), `director.md missing specialist ${role}`);
  }
  for (const svg of ['logo-integra-color.svg', 'logo-integra-blanco.svg', 'logo-integra-gris.svg']) {
    assert.ok(fs.existsSync(path.join(ROOT, '08_RECURSOS/brand', svg)), `Missing brand asset ${svg}`);
  }
});

check('No obvious API secrets committed in tracked text files', () => {
  const selfPath = path.resolve(ROOT, 'scripts/validate-dossier.mjs');
  const textFiles = walkFiles(ROOT, (f) => /\.(md|json|ts|js|mjs|html|css|csv|example)$/.test(f));
  const secretRegex = /(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|^AZURE_OPENAI_API_KEY=\S+)/m;
  for (const file of textFiles) {
    if (path.resolve(file) === selfPath) continue;
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(!secretRegex.test(content), `Potential secret pattern found in ${path.relative(ROOT, file)}`);
  }
});

check('Key referenced repository paths in README.md and AGENTS.md exist on disk', () => {
  const requiredPaths = [
    '00_PROYECTO/01_RETO_Y_VISION.md',
    '00_PROYECTO/02_ALCANCE_MVP.md',
    '01_INVESTIGACION/05_EMPRESA_AGENTICA_2026.md',
    '03_TECNICA/01_ARQUITECTURA.md',
    '04_AGENTES/02_ESQUEMA_EMPRESA_AGENTICA.md',
    '05_DESARROLLO/01_PLAN.md',
    '06_PROTOTIPO_OFFLINE/index.html',
    '07_CONTRATOS/plan.schema.json',
    '07_CONTRATOS/event.schema.json',
    '08_RECURSOS/brand/README.md',
    'scripts/validate-dossier.mjs',
  ];
  for (const rel of requiredPaths) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `Missing referenced path: ${rel}`);
  }
});

console.log(`\nSummary: ${passed} passed, ${failures.length} failed.`);
if (failures.length > 0) {
  process.exit(1);
}
