import mockEventsRaw from '@contracts/fixtures/events.mock.json';
import planFixtureRaw from '@contracts/fixtures/plan.json';
import type {
  AgentId,
  AgentState,
  OfficeEvent,
  Plan,
  ProjectStatus,
  TaskState,
} from '@contracts/types';
import {
  AGENT_ORDER,
  AGENT_PROFILES,
  type AgentActivity,
} from './officeLayout';
import { eventLabel, resultLabel } from './officeCopy';

export const MOCK_EVENTS = mockEventsRaw as OfficeEvent[];
export const NORTIA_PLAN = planFixtureRaw as Plan;

export interface AgentRuntimeState {
  id: AgentId;
  state: AgentState;
  activity: AgentActivity;
  holdingProp: 'none' | 'coffee' | 'binder' | 'tablet';
  currentTaskId: string | null;
  currentTaskTitle: string;
  bubbleText: string;
  tools: string[];
  sources: string[];
  artifacts: string[];
  lastEventType: string;
  lastSequence: number;
}

export interface PlanTaskRuntime {
  id: string;
  agent: AgentId;
  instruction: string;
  dependsOn: string[];
  requiresApproval?: boolean;
  state: TaskState;
}

export interface DataPulseLink {
  id: string;
  from: AgentId | 'reception';
  to: AgentId;
  color: string;
  label: string;
}

export interface PendingCheckpoint {
  kind: 'scope_question' | 'offer_approval';
  title: string;
  text: string;
  priceBand?: string;
  options: Array<{ id: string; label: string; tone: 'primary' | 'secondary' }>;
}

export interface OfficeSceneState {
  projectId: string;
  projectTitle: string;
  mode: 'mock' | 'replay' | 'live';
  status: ProjectStatus;
  eventCursor: number;
  totalEvents: number;
  lastEvent: OfficeEvent | null;
  includesTraining: boolean;
  boardroomStatus: 'available' | 'meeting' | 'approval';
  receptionAlert: boolean;
  agents: Record<AgentId, AgentRuntimeState>;
  planTasks: PlanTaskRuntime[];
  artifacts: Array<{ id: string; name: string; agent: AgentId; draft?: boolean; mime: string }>;
  activePulses: DataPulseLink[];
  checkpoint: PendingCheckpoint | null;
}

export interface SceneOverrides {
  meetingActive: boolean;
  coffeeBreakActive: boolean;
  receptionPulse: boolean;
  includesTraining: boolean;
  agentOverrides: Partial<
    Record<
      AgentId,
      {
        state?: AgentState;
        activity?: AgentActivity;
        bubbleText?: string;
        holdingProp?: 'none' | 'coffee' | 'binder' | 'tablet';
      }
    >
  >;
}

export const INITIAL_OVERRIDES: SceneOverrides = {
  meetingActive: false,
  coffeeBreakActive: false,
  receptionPulse: false,
  includesTraining: true,
  agentOverrides: {},
};

/**
 * Pure event reducer that transforms the ordered OfficeEvent stream
 * (same contract as Phase 1 Fastify `/events?after=0`) + optional visual sandbox
 * overrides into the complete 8-agent, 5-zone 3D office scene state.
 */
export function reduceOfficeSceneState(
  events: OfficeEvent[],
  eventCursor: number,
  overrides: SceneOverrides
): OfficeSceneState {
  const clamped = Math.max(0, Math.min(eventCursor, events.length));
  const slice = events.slice(0, clamped);

  const agents = {} as Record<AgentId, AgentRuntimeState>;
  for (const id of AGENT_ORDER) {
    agents[id] = {
      id,
      state: 'idle',
      activity: 'desk',
      holdingProp: 'none',
      currentTaskId: null,
      currentTaskTitle: 'Sin tarea asignada',
      bubbleText: 'Sin tarea asignada',
      tools: [],
      sources: [],
      artifacts: [],
      lastEventType: 'idle',
      lastSequence: 0,
    };
  }

  const taskStateMap: Record<string, TaskState> = {};
  for (const t of NORTIA_PLAN.tasks) {
    taskStateMap[t.id] = 'queued';
  }

  const artifacts: OfficeSceneState['artifacts'] = [];
  let status: ProjectStatus = clamped === 0 ? 'queued' : 'running';
  let boardroomStatus: OfficeSceneState['boardroomStatus'] = 'available';
  let receptionAlert = false;
  let checkpoint: PendingCheckpoint | null = null;
  let includesTraining = overrides.includesTraining;
  const activePulses: DataPulseLink[] = [];

  for (const ev of slice) {
    const title = eventLabel(ev, includesTraining);
    const aid = ev.agent_id;

    if (aid && agents[aid]) {
      agents[aid].lastEventType = ev.type;
      agents[aid].lastSequence = ev.sequence;
      if (typeof ev.payload.tool === 'string' && !agents[aid].tools.includes(ev.payload.tool)) {
        agents[aid].tools.push(ev.payload.tool);
      }
      if (Array.isArray(ev.payload.sources)) {
        for (const s of ev.payload.sources) {
          if (typeof s === 'string' && !agents[aid].sources.includes(s)) {
            agents[aid].sources.push(s);
          }
        }
      }
    }

    switch (ev.type) {
      case 'request.received': {
        status = 'running';
        receptionAlert = true;
        agents.director.state = 'planning';
        agents.director.activity = 'reception';
        agents.director.holdingProp = 'tablet';
        agents.director.currentTaskTitle = title;
        agents.director.bubbleText = 'Nueva oportunidad de Nortia';
        break;
      }
      case 'human.message': {
        if (ev.payload.author === 'director') {
          receptionAlert = false;
          agents.director.state = 'waiting';
          agents.director.activity = 'whiteboard';
          agents.director.holdingProp = 'tablet';
          agents.director.currentTaskTitle = title;
          agents.director.bubbleText = '¿Incluimos formación en la oferta de Nortia Industrial?';
          checkpoint = {
            kind: 'scope_question',
            title: '¿Incluimos formación?',
            text: 'La formación para el equipo de Nortia añade 48 horas al proyecto.',
            options: [
              { id: 'training_yes', label: 'Incluir formación', tone: 'primary' },
              { id: 'training_no', label: 'Seguir sin formación', tone: 'secondary' },
            ],
          };
        } else {
          checkpoint = null;
          if (typeof ev.payload.text === 'string' && ev.payload.text.toLowerCase().includes('no')) {
            includesTraining = false;
          }
          agents.director.state = 'planning';
          agents.director.bubbleText = includesTraining
            ? 'Incluimos formación en la oferta.'
            : 'Seguimos sin formación.';
        }
        break;
      }
      case 'run.paused': {
        status = 'paused';
        const reason = typeof ev.payload.reason === 'string' ? ev.payload.reason : '';
        if (reason === 'waiting_offer_approval') {
          boardroomStatus = 'approval';
          agents.director.state = 'waiting';
          agents.director.activity = 'boardroom';
          agents.director.holdingProp = 'tablet';
          agents.director.bubbleText = 'Pendiente de tu decisión';
          agents.offers.state = 'waiting';
          agents.offers.activity = 'boardroom';
          agents.offers.holdingProp = 'binder';
          agents.offers.bubbleText = 'Borrador listo para revisar';
        } else {
          agents.director.state = 'waiting';
          agents.director.activity = 'whiteboard';
        }
        break;
      }
      case 'run.resumed': {
        status = 'running';
        checkpoint = null;
        boardroomStatus = 'available';
        agents.director.state = 'planning';
        agents.director.activity = 'whiteboard';
        agents.director.bubbleText = title;
        if (agents.offers.state === 'waiting') {
          agents.offers.activity = 'desk';
        }
        break;
      }
      case 'plan.created': {
        receptionAlert = false;
        agents.director.state = 'planning';
        agents.director.activity = 'whiteboard';
        agents.director.holdingProp = 'tablet';
        agents.director.currentTaskTitle = title;
        agents.director.bubbleText = 'Repartiendo el trabajo';
        break;
      }
      case 'task.assigned': {
        if (ev.task_id) taskStateMap[ev.task_id] = 'queued';
        if (aid && agents[aid]) {
          agents[aid].state = 'collaborating';
          agents[aid].currentTaskId = ev.task_id;
          agents[aid].currentTaskTitle = title;
          agents[aid].bubbleText = title;
          agents[aid].activity = 'desk';
        }
        break;
      }
      case 'task.started': {
        if (ev.task_id) taskStateMap[ev.task_id] = 'running';
        if (aid && agents[aid]) {
          agents[aid].state = 'working';
          agents[aid].currentTaskId = ev.task_id;
          agents[aid].currentTaskTitle = title;
          agents[aid].bubbleText = AGENT_PROFILES[aid].workingComments[0] ?? title;
          agents[aid].tools = [...AGENT_PROFILES[aid].defaultTools];
          agents[aid].activity = aid === 'architect' ? 'arch_board' : 'desk';
          agents[aid].holdingProp = aid === 'architect' ? 'tablet' : 'none';
          if (agents.director.state === 'planning') {
            agents.director.activity = 'desk';
            agents.director.holdingProp = 'none';
            agents.director.state = 'working';
            agents.director.bubbleText = 'Coordinando al equipo';
          }
        }
        break;
      }
      case 'tool.started':
      case 'tool.completed': {
        if (aid && agents[aid]) {
          agents[aid].state = 'working';
          agents[aid].currentTaskTitle = title;
          agents[aid].bubbleText = title;
        }
        break;
      }
      case 'artifact.created': {
        const artName = typeof ev.payload.name === 'string' ? ev.payload.name : 'entregable';
        const artId = typeof ev.payload.artifact_id === 'string' ? ev.payload.artifact_id : `art-${ev.sequence}`;
        const mime = typeof ev.payload.mime === 'string' ? ev.payload.mime : 'application/octet-stream';
        const draft = Boolean(ev.payload.draft);
        if (aid && !artifacts.some((a) => a.id === artId)) {
          artifacts.push({ id: artId, name: artName, agent: aid, draft, mime });
        }
        if (aid && agents[aid]) {
          if (!agents[aid].artifacts.includes(artName)) {
            agents[aid].artifacts.push(artName);
          }
          agents[aid].bubbleText = resultLabel(aid);
          if (aid === 'offers') {
            agents[aid].activity = 'printer';
            agents[aid].holdingProp = 'binder';
            agents[aid].bubbleText = 'Recogiendo el borrador de la oferta';
          } else if (aid === 'architect') {
            agents[aid].activity = 'arch_board';
            agents[aid].holdingProp = 'tablet';
          } else if (aid === 'designer') {
            agents[aid].activity = 'slides_tv';
            agents[aid].holdingProp = 'tablet';
          }
        }
        break;
      }
      case 'approval.required': {
        if (ev.task_id) taskStateMap[ev.task_id] = 'waiting';
        boardroomStatus = 'approval';
        const band = includesTraining
          ? '42.000 € – 58.000 € (428 h · con formación)'
          : '36.000 € – 50.000 € (380 h · sin formación)';
        checkpoint = {
          kind: 'offer_approval',
          title: '¿Apruebas la oferta?',
          text: 'Si la apruebas, el equipo prepara el plan de proyecto y el borrador de factura.',
          priceBand: band,
          options: [
            { id: 'approve', label: 'Aprobar oferta', tone: 'primary' },
            { id: 'correct', label: 'Pedir cambios', tone: 'secondary' },
          ],
        };
        agents.director.state = 'waiting';
        agents.director.activity = 'boardroom';
        agents.director.holdingProp = 'tablet';
        agents.offers.state = 'waiting';
        agents.offers.activity = 'boardroom';
        agents.offers.holdingProp = 'binder';
        break;
      }
      case 'approval.resolved': {
        checkpoint = null;
        boardroomStatus = 'available';
        agents.offers.state = 'completed';
        agents.offers.activity = 'desk';
        agents.offers.holdingProp = 'none';
        agents.offers.bubbleText = 'Oferta aprobada';
        break;
      }
      case 'task.completed': {
        if (ev.task_id) taskStateMap[ev.task_id] = 'completed';
        if (aid && agents[aid]) {
          agents[aid].state = 'completed';
          agents[aid].currentTaskTitle = title;
          agents[aid].bubbleText = title;
          agents[aid].activity = 'desk';
          agents[aid].holdingProp = 'none';
        }
        break;
      }
      case 'task.failed': {
        if (ev.task_id) taskStateMap[ev.task_id] = 'failed';
        if (aid && agents[aid]) {
          agents[aid].state = 'error';
          agents[aid].currentTaskTitle = title;
          agents[aid].bubbleText = title;
          agents[aid].activity = 'desk';
        }
        break;
      }
      case 'project.completed': {
        status = 'completed';
        checkpoint = null;
        boardroomStatus = 'available';
        agents.director.state = 'completed';
        agents.director.activity = 'whiteboard';
        agents.director.holdingProp = 'none';
        agents.director.currentTaskTitle = title;
        agents.director.bubbleText = 'Proyecto completado';
        break;
      }
      default:
        break;
    }
  }

  // Derive active data handoff pulses from the latest event for crisp visual choreography
  const lastEvent = slice.length > 0 ? slice[slice.length - 1] : null;
  if (lastEvent) {
    if (lastEvent.type === 'request.received') {
      activePulses.push({
        id: 'pulse-rec-dir',
        from: 'reception',
        to: 'director',
        color: '#00B0F0',
        label: 'Nueva oportunidad',
      });
    } else if (
      lastEvent.type === 'task.assigned' ||
      lastEvent.type === 'task.started'
    ) {
      for (const id of AGENT_ORDER) {
        if (id !== 'director' && (agents[id].state === 'working' || agents[id].state === 'collaborating')) {
          activePulses.push({
            id: `pulse-dir-${id}`,
            from: 'director',
            to: id,
            color: '#00B0F0',
            label: 'Encargo asignado',
          });
        }
      }
      if (agents.architect.state === 'working') {
        activePulses.push({
          id: 'pulse-cons-arch',
          from: 'consultant',
          to: 'architect',
          color: '#70C4BE',
          label: 'Requisitos del proyecto',
        });
      }
      if (agents.offers.state === 'working') {
        activePulses.push(
          { id: 'pulse-crm-off', from: 'crm', to: 'offers', color: '#43C6F0', label: 'Resumen de la cuenta' },
          { id: 'pulse-arch-off', from: 'architect', to: 'offers', color: '#43C6F0', label: 'Diagrama de solución' }
        );
      }
      if (agents.designer.state === 'working') {
        activePulses.push(
          { id: 'pulse-del-des', from: 'delivery', to: 'designer', color: '#D70A8A', label: 'plan PDF' },
          { id: 'pulse-bil-des', from: 'billing', to: 'designer', color: '#D70A8A', label: 'factura PDF' }
        );
      }
    } else if (lastEvent.type === 'approval.required' || lastEvent.type === 'run.paused') {
      activePulses.push({
        id: 'pulse-off-dir',
        from: 'offers',
        to: 'director',
        color: '#D5A13D',
        label: 'Oferta pendiente',
      });
    }
  }

  // Apply interactive sandbox overrides (meeting room, coffee break, reception pulse, per-agent commands)
  if (overrides.receptionPulse) {
    receptionAlert = true;
    activePulses.push({
      id: 'pulse-manual-rec',
      from: 'reception',
      to: 'director',
      color: '#00B0F0',
      label: 'Nueva señal CRM',
    });
  }

  if (overrides.meetingActive) {
    boardroomStatus = 'meeting';
    const attendees: AgentId[] = ['director', 'crm', 'consultant', 'architect', 'offers', 'designer'];
    attendees.forEach((id) => {
      agents[id].activity = 'boardroom';
      agents[id].state = 'collaborating';
      agents[id].holdingProp = id === 'offers' ? 'binder' : 'tablet';
      agents[id].bubbleText =
        id === 'director'
          ? 'Standup en Sala Alierta: alineando entrega Nortia Industrial.'
          : 'Revisando dependencias e hitos en Sala Alierta.';
    });
  }

  if (overrides.coffeeBreakActive) {
    const coffeeCrew: Array<[AgentId, AgentActivity]> = [
      ['crm', 'coffee'],
      ['consultant', 'lounge_sofa'],
      ['designer', 'lounge_chair'],
    ];
    coffeeCrew.forEach(([id, activity]) => {
      agents[id].activity = activity;
      agents[id].state = 'idle';
      agents[id].holdingProp = 'coffee';
      agents[id].bubbleText = activity === 'coffee' ? 'Preparando un café' : 'Pausa café';
    });
  }

  for (const id of AGENT_ORDER) {
    const ov = overrides.agentOverrides[id];
    if (!ov) continue;
    if (ov.state) agents[id].state = ov.state;
    if (ov.activity) agents[id].activity = ov.activity;
    if (ov.bubbleText) agents[id].bubbleText = ov.bubbleText;
    if (ov.holdingProp) agents[id].holdingProp = ov.holdingProp;
    if (ov.activity === 'boardroom' && boardroomStatus === 'available') {
      boardroomStatus = 'meeting';
    }
  }

  const planTasks: PlanTaskRuntime[] = NORTIA_PLAN.tasks.map((t) => ({
    id: t.id,
    agent: t.agent,
    instruction:
      t.id === 't2' && !includesTraining
        ? 'Analizar requisitos, riesgos y fases (sin formación).'
        : t.instruction,
    dependsOn: t.dependsOn,
    requiresApproval: t.requiresApproval,
    state: taskStateMap[t.id] ?? 'queued',
  }));

  return {
    projectId: 'DEMO-001',
    projectTitle: 'Nortia Industrial · Plataforma Data & AI',
    mode: 'mock',
    status,
    eventCursor: clamped,
    totalEvents: events.length,
    lastEvent,
    includesTraining,
    boardroomStatus,
    receptionAlert,
    agents,
    planTasks,
    artifacts,
    activePulses,
    checkpoint,
  };
}
