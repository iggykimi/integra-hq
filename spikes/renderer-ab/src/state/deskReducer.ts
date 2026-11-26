import mockEventsRaw from '@contracts/fixtures/events.mock.json';

export type DeskVisualState = 'idle' | 'working' | 'waiting' | 'completed' | 'error';

export type DemoRoleId = 'offers' | 'architect' | 'consultant' | 'crm';

export interface MockOfficeEvent {
  event_id: string;
  sequence: number;
  timestamp: string;
  type: string;
  project_id: string;
  agent_id: string | null;
  task_id: string | null;
  payload: Record<string, unknown>;
}

export interface DeskSceneState {
  roleId: DemoRoleId;
  roleLabel: string;
  zoneLabel: string;
  jacketColor: string;
  hairColor: string;
  hasGlasses: boolean;
  state: DeskVisualState;
  taskTitle: string;
  commentSteps: string[];
  tools: string[];
  sources: string[];
  artifacts: string[];
  lastEventType: string;
  lastSequence: number;
  selected: boolean;
  reducedMotion: boolean;
}

export interface RendererMetrics {
  fps: number;
  frameMs: number;
  firstRenderMs: number | null;
}

export const STATE_META: Record<
  DeskVisualState,
  { label: string; icon: string; color: string; screenAccent: string; caption: string }
> = {
  idle: {
    label: 'Disponible',
    icon: '○',
    color: '#929CA5',
    screenAccent: '#587D8F',
    caption: 'Sin tarea activa asignada',
  },
  working: {
    label: 'Trabajando',
    icon: '●',
    color: '#168DC5',
    screenAccent: '#00B0F0',
    caption: 'Ejecutando herramienta y redactando salida validada',
  },
  waiting: {
    label: 'Esperando aprobación',
    icon: '◷',
    color: '#D5A13D',
    screenAccent: '#D5A13D',
    caption: 'Run pausado en checkpoint; sin consumo de tokens',
  },
  completed: {
    label: 'Completado',
    icon: '✓',
    color: '#36966C',
    screenAccent: '#36966C',
    caption: 'Entregable validado y guardado con checksum',
  },
  error: {
    label: 'Error / Bloqueado',
    icon: '!',
    color: '#C94F50',
    screenAccent: '#C94F50',
    caption: 'Fallo controlado; nunca simula éxito en live',
  },
};

export const ROLE_PRESETS: Record<
  DemoRoleId,
  {
    roleLabel: string;
    zoneLabel: string;
    jacketColor: string;
    hairColor: string;
    hasGlasses: boolean;
    defaultTask: string;
    workingComments: string[];
    tools: string[];
    sources: string[];
    artifact: string;
  }
> = {
  offers: {
    roleLabel: 'Ofertas · Comercial',
    zoneLabel: 'Zona Comercial',
    jacketColor: '#115293',
    hairColor: '#3B2B22',
    hasGlasses: true,
    defaultTask: 'Generar borrador de oferta DOCX/PDF con bandas del catálogo',
    workingComments: [
      'Consultando bandas aprobadas en CATALOG-SYNTH-2026…',
      'Cruzando alcance + fase de formación (42.000 € – 58.000 €)…',
      'Maquetando oferta-nortia-borrador.docx (marca BORRADOR)…',
    ],
    tools: ['read_catalog', 'build_offer'],
    sources: ['CATALOG-SYNTH-2026', 'OFFER-INTEGRA-01', 'STYLE-01'],
    artifact: 'oferta-nortia-borrador.docx (BORRADOR)',
  },
  architect: {
    roleLabel: 'Data & AI · Arquitectura',
    zoneLabel: 'Zona Soluciones',
    jacketColor: '#1D6B7E',
    hairColor: '#25211F',
    hasGlasses: true,
    defaultTask: 'Diseñar arquitectura Microsoft Fabric y renderizar SVG sanitizado',
    workingComments: [
      'Revisando fuentes MS-FABRIC-01 y MS-POWERBI-01…',
      'Validando grafo de solución (máx. 10 nodos, sin ciclos)…',
      'Generando diagrama determinista architecture-nortia.svg…',
    ],
    tools: ['search_knowledge', 'generate_architecture'],
    sources: ['MS-FABRIC-01', 'MS-POWERBI-01', 'INT-PUBLIC-02'],
    artifact: 'architecture-nortia.svg',
  },
  consultant: {
    roleLabel: 'Consultoría · Negocio',
    zoneLabel: 'Zona Soluciones',
    jacketColor: '#3B6E5C',
    hairColor: '#5B3E2B',
    hasGlasses: false,
    defaultTask: 'Extraer requisitos funcionales, riesgos, supuestos y fases',
    workingComments: [
      'Separando necesidades explícitas e inferidas del cliente…',
      'Contrastando fases con DEMO-METHOD-01…',
      'Registrando supuestos y preguntas abiertas en briefing.json…',
    ],
    tools: ['search_knowledge'],
    sources: ['INT-PUBLIC-01', 'DEMO-METHOD-01'],
    artifact: 'briefing.json (interno)',
  },
  crm: {
    roleLabel: 'CRM · Comercial',
    zoneLabel: 'Zona Comercial',
    jacketColor: '#485A7A',
    hairColor: '#463529',
    hasGlasses: false,
    defaultTask: 'Leer cuenta Nortia Industrial y calcular días sin contacto en código',
    workingComments: [
      'Leyendo cuenta ACC-NORTIA-001 (solo lectura, as_of 26/11)…',
      'Calculando en código: OPP-01 activa (8d) · OPP-02 estancada (67d)…',
      'Consolidando account_brief.json con referencias de actividad…',
    ],
    tools: ['read_crm', 'search_knowledge'],
    sources: ['CRM-FIXTURE-2026', 'CRM-ACC-NORTIA-001'],
    artifact: 'account_brief.json (interno)',
  },
};

export const MOCK_EVENTS: MockOfficeEvent[] = mockEventsRaw as MockOfficeEvent[];

export const SCORECARD_CRITERIA = [
  { id: 'quality', label: 'Calidad gráfica', weight: 0.35 },
  { id: 'ease', label: 'Facilidad / tiempo', weight: 0.3 },
  { id: 'flexibility', label: 'Flexibilidad (8 roles)', weight: 0.1 },
  { id: 'performance', label: 'Rendimiento / fluidez', weight: 0.1 },
  { id: 'impact', label: 'Impacto en demo 1080p', weight: 0.15 },
] as const;

export type CriterionId = (typeof SCORECARD_CRITERIA)[number]['id'];

export function buildManualDeskState(
  roleId: DemoRoleId,
  state: DeskVisualState,
  selected: boolean,
  reducedMotion: boolean
): DeskSceneState {
  const preset = ROLE_PRESETS[roleId];
  const artifacts =
    state === 'completed' || state === 'waiting' ? [preset.artifact] : [];
  const taskTitle =
    state === 'idle'
      ? 'Puesto en espera de asignación del director'
      : state === 'waiting'
        ? 'Oferta lista en BORRADOR · esperando aprobación humana'
        : state === 'error'
          ? 'Validación rechazada: tarifa fuera de catálogo aprobado'
          : preset.defaultTask;

  const commentSteps =
    state === 'idle'
      ? ['Disponible · esperando asignación del Director.']
      : state === 'working'
        ? preset.workingComments
        : state === 'waiting'
          ? ['Oferta BORRADOR lista (42.000 € – 58.000 €). Requiere tu aprobación.']
          : state === 'completed'
            ? [`Entregable verificado: ${preset.artifact}`]
            : ['Bloqueado: tarifa fuera de catálogo aprobado. Sin envío externo.'];

  return {
    roleId,
    roleLabel: preset.roleLabel,
    zoneLabel: preset.zoneLabel,
    jacketColor: preset.jacketColor,
    hairColor: preset.hairColor,
    hasGlasses: preset.hasGlasses,
    state,
    taskTitle,
    commentSteps,
    tools: state === 'idle' ? [] : preset.tools,
    sources: state === 'idle' ? [] : preset.sources,
    artifacts,
    lastEventType:
      state === 'idle'
        ? 'idle'
        : state === 'working'
          ? 'task.started'
          : state === 'waiting'
            ? 'approval.required'
            : state === 'completed'
              ? 'task.completed'
              : 'task.failed',
    lastSequence: 0,
    selected,
    reducedMotion,
  };
}

/**
 * Shared event reducer: projects the 8-agent Nortia Industrial mock event stream
 * onto the single comparative desk so both Candidate A and Candidate B render
 * the exact same state derived from events.
 */
export function reduceEventsToDeskState(
  eventIndex: number,
  selected: boolean,
  reducedMotion: boolean
): DeskSceneState {
  const slice = MOCK_EVENTS.slice(0, Math.max(0, Math.min(eventIndex, MOCK_EVENTS.length)));
  if (slice.length === 0) {
    return buildManualDeskState('offers', 'idle', selected, reducedMotion);
  }

  let roleId: DemoRoleId = 'crm';
  let state: DeskVisualState = 'idle';
  let taskTitle = 'Esperando señal de oportunidad...';
  const tools = new Set<string>();
  const sources = new Set<string>();
  const artifacts: string[] = [];
  let lastEventType = 'idle';
  let lastSequence = 0;

  for (const ev of slice) {
    lastEventType = ev.type;
    lastSequence = ev.sequence;

    if (
      ev.agent_id === 'crm' ||
      ev.agent_id === 'consultant' ||
      ev.agent_id === 'architect' ||
      ev.agent_id === 'offers'
    ) {
      roleId = ev.agent_id;
    }

    if (typeof ev.payload.title === 'string') {
      taskTitle = ev.payload.title;
    }
    if (typeof ev.payload.tool === 'string') {
      tools.add(ev.payload.tool);
    }
    if (Array.isArray(ev.payload.sources)) {
      for (const s of ev.payload.sources) {
        if (typeof s === 'string') sources.add(s);
      }
    }
    if (ev.type === 'artifact.created' && typeof ev.payload.name === 'string') {
      if (!artifacts.includes(ev.payload.name)) {
        artifacts.push(ev.payload.name);
      }
    }

    switch (ev.type) {
      case 'request.received':
      case 'task.started':
      case 'tool.started':
      case 'run.resumed':
        state = 'working';
        break;
      case 'approval.required':
      case 'run.paused':
        state = 'waiting';
        break;
      case 'task.completed':
      case 'project.completed':
        state = 'completed';
        break;
      case 'task.failed':
      case 'project.failed':
        state = 'error';
        break;
      default:
        break;
    }
  }

  const preset = ROLE_PRESETS[roleId];
  return {
    roleId,
    roleLabel: preset.roleLabel,
    zoneLabel: preset.zoneLabel,
    jacketColor: preset.jacketColor,
    hairColor: preset.hairColor,
    hasGlasses: preset.hasGlasses,
    state,
    taskTitle,
    commentSteps: [taskTitle],
    tools: tools.size > 0 ? [...tools] : preset.tools,
    sources: sources.size > 0 ? [...sources] : preset.sources,
    artifacts,
    lastEventType,
    lastSequence,
    selected,
    reducedMotion,
  };
}
