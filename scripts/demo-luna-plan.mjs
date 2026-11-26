#!/usr/bin/env node
/**
 * Minimal mock / live smoke demo for Integra HQ (8-agent cycle + Azure OpenAI gpt-6-luna).
 *
 * Usage:
 *   node scripts/demo-luna-plan.mjs                             # mock full cycle (with training)
 *   node scripts/demo-luna-plan.mjs --training=no               # mock full cycle (without training)
 *   node scripts/demo-luna-plan.mjs --scenario=arch             # mock secondary flow (Fabric only)
 *   node scripts/demo-luna-plan.mjs --live                      # live Azure OpenAI gpt-6-luna call
 *   node scripts/demo-luna-plan.mjs --live --scenario=arch      # live secondary flow test
 *
 * Never fabricates live success: if --live is passed without valid Azure OpenAI credentials
 * in environment or local .env, exits with code 1.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function daysBetween(startIso, endIso) {
  return Math.round(
    (Date.parse(`${endIso}T00:00:00Z`) - Date.parse(`${startIso}T00:00:00Z`)) /
      86_400_000
  );
}

function formatEur(n) {
  return `${n.toLocaleString('es-ES', { useGrouping: 'always' })} €`;
}

function validatePlan(plan, allowedAgents) {
  const errors = [];
  if (!plan || typeof plan !== 'object') return ['Plan is not an object'];
  if (typeof plan.objective !== 'string' || plan.objective.length === 0) {
    errors.push('Missing objective');
  }
  if (!Array.isArray(plan.assumptions)) errors.push('assumptions must be an array');
  if (!Array.isArray(plan.tasks) || plan.tasks.length < 1 || plan.tasks.length > 8) {
    errors.push('tasks must contain 1..8 items');
    return errors;
  }

  const ids = new Set();
  for (const t of plan.tasks) {
    if (typeof t.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(t.id)) {
      errors.push(`Invalid task id: ${String(t.id)}`);
    }
    if (ids.has(t.id)) errors.push(`Duplicate task id: ${t.id}`);
    ids.add(t.id);
    if (!allowedAgents.has(t.agent)) errors.push(`Disallowed agent: ${String(t.agent)}`);
    if (!Array.isArray(t.dependsOn)) errors.push(`dependsOn not array on ${t.id}`);
  }

  // Acyclic DAG verification (Kahn)
  const inDeg = new Map();
  const nextMap = new Map();
  for (const t of plan.tasks) {
    inDeg.set(t.id, (t.dependsOn || []).length);
    nextMap.set(t.id, []);
  }
  for (const t of plan.tasks) {
    for (const dep of t.dependsOn || []) {
      if (!ids.has(dep)) {
        errors.push(`Task ${t.id} depends on unknown task ${dep}`);
      } else {
        nextMap.get(dep).push(t.id);
      }
    }
  }
  const q = [...inDeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  let visited = 0;
  while (q.length > 0) {
    const cur = q.shift();
    visited += 1;
    for (const n of nextMap.get(cur) || []) {
      const nd = inDeg.get(n) - 1;
      inDeg.set(n, nd);
      if (nd === 0) q.push(n);
    }
  }
  if (visited !== plan.tasks.length) {
    errors.push('Cycle detected in task DAG');
  }

  const offersTask = plan.tasks.find((t) => t.agent === 'offers');
  if (offersTask && offersTask.requiresApproval !== true) {
    errors.push('offers task must set requiresApproval: true');
  }
  return errors;
}

function runDeterministicBusinessSteps(includeTraining) {
  const crm = readJson('07_CONTRATOS/fixtures/data/crm/accounts.json');
  const catalog = readJson('07_CONTRATOS/fixtures/data/catalog/services.json');
  const portfolio = readJson('07_CONTRATOS/fixtures/data/projects/portfolio.json');
  const billing = readJson('07_CONTRATOS/fixtures/data/billing/invoices.json');

  const account = crm.accounts.find((a) => a.account_id === 'ACC-NORTIA-001');
  const opps = account.opportunities.map((o) => {
    const days = daysBetween(o.last_contact_date, crm.as_of);
    return { ...o, last_contact_days: days, stale: days >= crm.stale_threshold_days };
  });

  const selectedServiceIds = [
    'SRV-DATA-DISC',
    'SRV-DATA-FABRIC-ARCH',
    'SRV-DATA-PBI-IMP',
    ...(includeTraining ? ['SRV-TAL-FORM-DATA'] : []),
  ];
  const selectedServices = catalog.services.filter((s) =>
    selectedServiceIds.includes(s.service_id)
  );
  const minTotal = selectedServices.reduce((acc, s) => acc + s.price_band_eur.min, 0);
  const maxTotal = selectedServices.reduce((acc, s) => acc + s.price_band_eur.max, 0);

  const projectPhases = portfolio.phase_templates.filter((p) =>
    selectedServiceIds.includes(p.service_id)
  );
  const totalHours = projectPhases.reduce((acc, p) => acc + p.estimated_hours, 0);
  const totalWeeks = projectPhases.reduce((acc, p) => acc + p.duration_weeks, 0);

  const aging = { current: 0, days_1_30: 0, days_31_60: 0, days_over_60: 0 };
  for (const inv of billing.invoices) {
    if (inv.status === 'paid') continue;
    const overdue = Math.max(0, daysBetween(inv.due_date, billing.as_of));
    if (overdue === 0) aging.current += inv.amount_eur;
    else if (overdue <= 30) aging.days_1_30 += inv.amount_eur;
    else if (overdue <= 60) aging.days_31_60 += inv.amount_eur;
    else aging.days_over_60 += inv.amount_eur;
  }

  return {
    asOf: crm.as_of,
    accountName: account.legal_name,
    opportunities: opps,
    selectedServiceIds,
    offerBandLabel: `${formatEur(minTotal)} – ${formatEur(maxTotal)} (${catalog.validation_status})`,
    projectHours: totalHours,
    projectWeeks: totalWeeks,
    phaseCount: projectPhases.length,
    aging,
  };
}

async function callAzureOpenAILuna({ scenario, includeTraining, planSchema }) {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
  const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
  const deployment =
    process.env.AZURE_OPENAI_DEPLOYMENT_DIRECTOR ||
    process.env.AZURE_OPENAI_DEPLOYMENT_DEFAULT ||
    'gpt-6-luna';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-04-01-preview';
  const apiMode = (process.env.AZURE_OPENAI_API_MODE || 'chat').toLowerCase();

  if (!endpoint || !apiKey) {
    console.error(
      'ERROR [LIVE]: Faltan AZURE_OPENAI_ENDPOINT o AZURE_OPENAI_API_KEY en el entorno o .env local.'
    );
    console.error('Modo live nunca simula éxito. Configura .env (copiando .env.example) y vuelve a intentarlo.');
    process.exit(1);
  }

  const directorPrompt = fs.readFileSync(
    path.join(ROOT, '04_AGENTES/prompts/director.md'),
    'utf8'
  );

  const userPrompt =
    scenario === 'arch'
      ? 'Diseña únicamente una arquitectura de datos de referencia para Microsoft Fabric para un cliente industrial. No prepares oferta, proyecto, factura ni presentación.'
      : `Nortia Industrial (ACC-NORTIA-001) ha ampliado su proyecto. Decisión humana ya registrada: ${includeTraining ? 'SÍ incluir fase opcional de formación' : 'NO incluir formación'}. Prepara la oportunidad CRM, requisitos, arquitectura SVG, oferta comercial con aprobación humana obligatoria, plan de proyecto, borrador de factura y presentación ejecutiva.`;

  const strictPlanSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['objective', 'assumptions', 'tasks'],
    properties: {
      objective: { type: 'string' },
      assumptions: { type: 'array', items: { type: 'string' } },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'agent', 'instruction', 'dependsOn', 'requiresApproval'],
          properties: {
            id: { type: 'string' },
            agent: {
              type: 'string',
              enum: planSchema.properties.tasks.items.properties.agent.enum,
            },
            instruction: { type: 'string' },
            dependsOn: { type: 'array', items: { type: 'string' } },
            requiresApproval: { type: 'boolean' },
          },
        },
      },
    },
  };

  const startedAt = performance.now();
  let url;
  let body;

  if (apiMode === 'responses') {
    url = `${endpoint}/openai/v1/responses`;
    body = {
      model: deployment,
      input: [
        { role: 'system', content: directorPrompt },
        { role: 'user', content: userPrompt },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'director_plan',
          strict: true,
          schema: strictPlanSchema,
        },
      },
    };
  } else {
    url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    body = {
      messages: [
        { role: 'system', content: directorPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'director_plan',
          strict: true,
          schema: strictPlanSchema,
        },
      },
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const latencyMs = Math.round(performance.now() - startedAt);
  if (!res.ok) {
    const errText = await res.text();
    console.error(`ERROR [LIVE] HTTP ${res.status} (${latencyMs} ms): ${errText.slice(0, 400)}`);
    process.exit(1);
  }

  const data = await res.json();
  const rawText =
    apiMode === 'responses'
      ? data.output_text || data.output?.[0]?.content?.[0]?.text
      : data.choices?.[0]?.message?.content;

  if (!rawText) {
    console.error('ERROR [LIVE]: Respuesta vacía del modelo.');
    process.exit(1);
  }

  const plan = JSON.parse(rawText);
  return {
    deployment,
    apiMode,
    latencyMs,
    usage: data.usage || null,
    plan,
  };
}

async function main() {
  loadDotEnv();
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const scenarioArg = args.find((a) => a.startsWith('--scenario='));
  const scenario = scenarioArg ? scenarioArg.split('=')[1] : 'full';
  const trainingArg = args.find((a) => a.startsWith('--training='));
  const includeTraining = trainingArg ? trainingArg.split('=')[1] !== 'no' : true;

  const planSchema = readJson('07_CONTRATOS/plan.schema.json');
  const allowedAgents = new Set(planSchema.properties.tasks.items.properties.agent.enum);

  console.log('===============================================================');
  console.log(`INTEGRA HQ · SMOKE DEMO (${isLive ? 'LIVE · AZURE OPENAI' : 'MOCK · DATOS SINTÉTICOS'})`);
  console.log(`Escenario: ${scenario} | Formación: ${includeTraining ? 'SÍ' : 'NO'}`);
  console.log('===============================================================\n');

  let plan;
  if (isLive) {
    const liveRes = await callAzureOpenAILuna({ scenario, includeTraining, planSchema });
    plan = liveRes.plan;
    console.log(`Deployment: ${liveRes.deployment} (${liveRes.apiMode})`);
    console.log(`Latencia planificación: ${liveRes.latencyMs} ms`);
    if (liveRes.usage) {
      console.log(`Tokens: ${JSON.stringify(liveRes.usage)}`);
    }
  } else {
    plan =
      scenario === 'arch'
        ? readJson('07_CONTRATOS/fixtures/plan.architecture-only.json')
        : readJson('07_CONTRATOS/fixtures/plan.json');
    if (scenario === 'full' && !includeTraining) {
      plan = {
        ...plan,
        assumptions: plan.assumptions.map((a) =>
          a.includes('Formación') ? 'Formación excluida por decisión humana' : a
        ),
      };
    }
  }

  const errors = validatePlan(plan, allowedAgents);
  console.log(`\nObjetivo: ${plan.objective}`);
  console.log(`Tareas (${plan.tasks.length}):`);
  for (const t of plan.tasks) {
    const deps = t.dependsOn.length ? ` <- [${t.dependsOn.join(', ')}]` : ' (inicio)';
    const gate = t.requiresApproval ? ' [PAUSA: APROBACIÓN HUMANA]' : '';
    console.log(`  - ${t.id} (${t.agent})${deps}${gate}: ${t.instruction}`);
  }

  if (errors.length > 0) {
    console.error('\n[FAIL] Plan rechazado por validador DAG:', errors);
    process.exit(1);
  }
  console.log('\n[PASS] Plan validado: esquema correcto, agentes permitidos, DAG acíclico.');

  if (scenario === 'full') {
    const biz = runDeterministicBusinessSteps(includeTraining);
    console.log(`\n--- Cálculos deterministas sobre fixtures (as_of ${biz.asOf}) ---`);
    console.log(`Cuenta: ${biz.accountName}`);
    for (const o of biz.opportunities) {
      console.log(
        `  · CRM ${o.id}: ${o.status} | último contacto hace ${o.last_contact_days} días (estancada=${o.stale})`
      );
    }
    console.log(`  · Oferta BORRADOR (${biz.selectedServiceIds.join(', ')}): ${biz.offerBandLabel}`);
    console.log('  · Checkpoint: [run.paused] Esperando aprobación humana -> [approval.resolved: approve] -> [run.resumed]');
    console.log(`  · Plan de proyecto determinista: ${biz.phaseCount} fases, ${biz.projectWeeks} semanas, ${biz.projectHours} h`);
    console.log(
      `  · Facturación BORRADOR · NO CONTABILIZADO | Aging vigente: ${formatEur(biz.aging.current)} | 31–60d vencido: ${formatEur(biz.aging.days_31_60)}`
    );
  }

  console.log('\nEstado terminal: project.completed');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
