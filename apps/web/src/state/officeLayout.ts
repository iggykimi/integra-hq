import type { AgentId, AgentState } from '@contracts/types';

export type LightingMood = 'day' | 'golden' | 'night';

export type ZoneId =
  | 'director'
  | 'commercial'
  | 'solutions'
  | 'communication'
  | 'operations';

export type CameraPresetId =
  | 'overview'
  | 'reception'
  | 'director'
  | 'boardroom'
  | 'commercial'
  | 'solutions'
  | 'communication'
  | 'operations'
  | 'cafe';

export type AgentActivity =
  | 'desk'
  | 'whiteboard'
  | 'reception'
  | 'boardroom'
  | 'coffee'
  | 'lounge'
  | 'printer'
  | 'arch_board'
  | 'slides_tv';

export type HairStyle = 'short' | 'bob' | 'ponytail' | 'curly' | 'bun' | 'fade' | 'sidepart';

export interface Vec2 {
  x: number;
  z: number;
}

export interface AgentVisualProfile {
  id: AgentId;
  name: string;
  displayName: string;
  role: string;
  zone: ZoneId;
  zoneLabel: string;
  accentColor: string;
  deskPos: Vec2;
  /** Facing angle in radians where 0 faces -Z, +PI/2 faces -X */
  deskYaw: number;
  seatPos: Vec2;
  exitPos: Vec2;
  corridorX: number;
  corridorZ: number;
  /** Boardroom seat index 0..5 */
  boardroomSeatIndex: number;
  appearance: {
    skin: string;
    blazer: string;
    shirt: string;
    pants: string;
    shoes: string;
    hairColor: string;
    hairStyle: HairStyle;
    glasses: boolean;
    beard?: boolean;
    headset?: boolean;
    lanyardColor: string;
    heightScale: number;
  };
  screenProfile: {
    leftTitle: string;
    rightTitle: string;
    mode: 'director' | 'crm' | 'consultant' | 'architect' | 'offers' | 'designer' | 'delivery' | 'billing';
  };
  defaultTools: string[];
  defaultSources: string[];
  workingComments: string[];
  coffeeBanter: string[];
}

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  shortLabel: string;
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export const STATE_META: Record<
  AgentState,
  { label: string; shortLabel: string; color: string; screenAccent: string; caption: string }
> = {
  idle: {
    label: 'Disponible',
    shortLabel: 'Libre',
    color: '#8A97A4',
    screenAccent: '#587D8F',
    caption: 'Sin tarea asignada; disponible en puesto o zona común',
  },
  planning: {
    label: 'Planificando',
    shortLabel: 'Plan',
    color: '#115293',
    screenAccent: '#00B0F0',
    caption: 'Validando dependencias y armando plan DAG estructurado',
  },
  working: {
    label: 'Trabajando',
    shortLabel: 'Activo',
    color: '#168DC5',
    screenAccent: '#00B0F0',
    caption: 'Ejecutando herramienta autorizada y generando salida validada',
  },
  collaborating: {
    label: 'Colaborando',
    shortLabel: 'Reunión',
    color: '#7030A0',
    screenAccent: '#9A5CC7',
    caption: 'Coordinando handoff o revisión con otro especialista',
  },
  waiting: {
    label: 'Esperando aprobación',
    shortLabel: 'Pausa',
    color: '#D5A13D',
    screenAccent: '#D5A13D',
    caption: 'Checkpoint activo · 0 tokens consumidos hasta decisión humana',
  },
  completed: {
    label: 'Completado',
    shortLabel: 'Listo',
    color: '#36966C',
    screenAccent: '#36966C',
    caption: 'Salida verificada con esquema JSON y checksum',
  },
  blocked: {
    label: 'Bloqueado',
    shortLabel: 'Bloq.',
    color: '#C97B36',
    screenAccent: '#D5873D',
    caption: 'Esperando dependencia previa del grafo DAG',
  },
  error: {
    label: 'Error controlado',
    shortLabel: 'Error',
    color: '#C94F50',
    screenAccent: '#C94F50',
    caption: 'Validación fallida · nunca se simula éxito en live',
  },
};

export const ZONE_META: Record<
  ZoneId,
  { label: string; color: string; bounds: [number, number, number, number]; tagPos: [number, number, number] }
> = {
  director: {
    label: 'Dirección',
    color: '#0B2A5B',
    bounds: [-8.7, -6.2, -3.5, -1.2],
    tagPos: [-6.1, 0.02, -1.55],
  },
  commercial: {
    label: 'Comercial',
    color: '#115293',
    bounds: [-4.6, 1.3, -0.5, 6.1],
    tagPos: [-2.6, 0.02, 5.85],
  },
  solutions: {
    label: 'Soluciones · Data & AI',
    color: '#00B0F0',
    bounds: [-0.2, 1.3, 4.3, 6.1],
    tagPos: [2.0, 0.02, 5.85],
  },
  communication: {
    label: 'Comunicación',
    color: '#D70A8A',
    bounds: [4.6, 1.3, 8.7, 3.6],
    tagPos: [6.7, 0.02, 1.55],
  },
  operations: {
    label: 'Operación',
    color: '#36966C',
    bounds: [4.6, 3.8, 8.7, 6.1],
    tagPos: [6.7, 0.02, 5.85],
  },
};

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Vista General · DAT Alierta',
    shortLabel: 'General',
    position: [22, 18.5, 22],
    target: [0, 0.55, 0.35],
    zoom: 58,
  },
  {
    id: 'reception',
    label: 'Hall Recepción · 40 Años',
    shortLabel: 'Recepción',
    position: [3.5, 9.2, 13.8],
    target: [-6.9, 0.85, 3.8],
    zoom: 94,
  },
  {
    id: 'director',
    label: 'Dirección · Plan DAG',
    shortLabel: 'Dirección',
    position: [4.5, 9.5, 6.2],
    target: [-6.4, 0.9, -3.8],
    zoom: 92,
  },
  {
    id: 'boardroom',
    label: 'Sala Alierta · Reuniones',
    shortLabel: 'Sala Alierta',
    position: [9.5, 9.8, 6.5],
    target: [0.0, 0.85, -3.7],
    zoom: 92,
  },
  {
    id: 'commercial',
    label: 'Comercial · CRM y Ofertas',
    shortLabel: 'Comercial',
    position: [7.2, 9.2, 12.6],
    target: [-2.6, 0.8, 3.6],
    zoom: 94,
  },
  {
    id: 'solutions',
    label: 'Soluciones · Data & AI',
    shortLabel: 'Soluciones',
    position: [11.6, 9.4, 12.6],
    target: [1.8, 0.85, 3.6],
    zoom: 94,
  },
  {
    id: 'communication',
    label: 'Comunicación · Diseño PPTX',
    shortLabel: 'Diseño',
    position: [14.5, 9.0, 9.8],
    target: [6.5, 0.9, 2.3],
    zoom: 102,
  },
  {
    id: 'operations',
    label: 'Operación · Proyectos y Factura',
    shortLabel: 'Operación',
    position: [15.0, 9.0, 13.2],
    target: [6.6, 0.8, 4.9],
    zoom: 98,
  },
  {
    id: 'cafe',
    label: 'Rincón Café · IntegraTalks',
    shortLabel: 'Café',
    position: [15.5, 9.4, 6.4],
    target: [6.4, 0.85, -3.7],
    zoom: 94,
  },
];

export const BOARDROOM_SEATS: Array<{ pos: Vec2; yaw: number }> = [
  { pos: { x: -1.45, z: -3.7 }, yaw: -Math.PI / 2 }, // Director head of table (faces +X)
  { pos: { x: -0.45, z: -4.65 }, yaw: Math.PI },    // Back left (faces +Z)
  { pos: { x: 0.55, z: -4.65 }, yaw: Math.PI },     // Back right (faces +Z)
  { pos: { x: -0.45, z: -2.75 }, yaw: 0 },          // Front left (faces -Z)
  { pos: { x: 0.55, z: -2.75 }, yaw: 0 },           // Front right (faces -Z)
  { pos: { x: 1.45, z: -3.7 }, yaw: Math.PI / 2 },  // East head of table (faces -X)
];

export const LANDMARK_WAYPOINTS: Record<
  Exclude<AgentActivity, 'desk' | 'boardroom'>,
  { pos: Vec2; yaw: number; entry?: Vec2 }
> = {
  whiteboard: {
    pos: { x: -7.5, z: -3.35 },
    yaw: Math.PI / 2, // faces -X (West wall DAG whiteboard)
    entry: { x: -4.2, z: -0.2 },
  },
  reception: {
    pos: { x: -5.55, z: 3.15 },
    yaw: Math.PI / 2, // faces reception counter (-X)
    entry: { x: -5.2, z: 0.35 },
  },
  coffee: {
    pos: { x: 5.75, z: -4.9 },
    yaw: 0, // faces -Z (espresso counter)
    entry: { x: 4.5, z: -0.2 },
  },
  lounge: {
    pos: { x: 6.1, z: -2.35 },
    yaw: -Math.PI / 3,
    entry: { x: 4.5, z: -0.2 },
  },
  printer: {
    pos: { x: -1.55, z: 4.55 },
    yaw: -Math.PI / 2, // faces +X toward printer station
    entry: { x: -1.65, z: 0.45 },
  },
  arch_board: {
    pos: { x: 2.65, z: 3.6 },
    yaw: -Math.PI / 2, // faces +X toward glass architecture easel
    entry: { x: 2.65, z: 0.45 },
  },
  slides_tv: {
    pos: { x: 6.7, z: 1.95 },
    yaw: 0, // faces -Z toward 6-slide presentation screen on north divider
    entry: { x: 4.9, z: 0.45 },
  },
};

export const AGENT_PROFILES: Record<AgentId, AgentVisualProfile> = {
  director: {
    id: 'director',
    name: 'Dirección',
    displayName: 'Elena · Dirección',
    role: 'Orquestador',
    zone: 'director',
    zoneLabel: 'Zona Dirección',
    accentColor: '#0B2A5B',
    deskPos: { x: -5.85, z: -4.45 },
    deskYaw: 0, // sits on +Z side facing -Z (monitors face +Z towards camera!)
    seatPos: { x: -5.55, z: -3.32 },
    exitPos: { x: -4.4, z: -2.95 },
    corridorX: -4.2,
    corridorZ: -0.2,
    boardroomSeatIndex: 0,
    appearance: {
      skin: '#E8BC9F',
      blazer: '#0B2A5B',
      shirt: '#F8FAFC',
      pants: '#1D2C3D',
      shoes: '#16202A',
      hairColor: '#3A312D',
      hairStyle: 'bob',
      glasses: true,
      lanyardColor: '#00B0F0',
      heightScale: 1.02,
    },
    screenProfile: {
      leftTitle: 'ORQUESTADOR · DAG',
      rightTitle: 'CHECKPOINTS · HUMANO',
      mode: 'director',
    },
    defaultTools: ['plan', 'ask_human', 'review', 'request_approval'],
    defaultSources: ['INT-METHOD-2026', 'NORTIA-SIGNAL-01'],
    workingComments: [
      'Validando dependencias del grafo DAG (7 tareas, máx. 2 en paralelo)…',
      'Comprobando reglas de aprobación humana antes de emitir oferta…',
      'Consolidando trazabilidad y fuentes verificadas del expediente…',
    ],
    coffeeBanter: [
      'Buen café para arrancar el expediente de Nortia Industrial.',
      '¿Visteis el render nuevo del DAT Alierta? Qué luz natural.',
    ],
  },
  crm: {
    id: 'crm',
    name: 'CRM',
    displayName: 'Lucía · CRM',
    role: 'Comercial',
    zone: 'commercial',
    zoneLabel: 'Zona Comercial',
    accentColor: '#2D5A88',
    deskPos: { x: -3.35, z: 2.35 },
    deskYaw: 0,
    seatPos: { x: -3.35, z: 3.12 },
    exitPos: { x: -2.05, z: 3.12 },
    corridorX: -2.0,
    corridorZ: 0.4,
    boardroomSeatIndex: 1,
    appearance: {
      skin: '#D9A786',
      blazer: '#2D5A88',
      shirt: '#FFFFFF',
      pants: '#253545',
      shoes: '#1B252F',
      hairColor: '#281E1A',
      hairStyle: 'ponytail',
      glasses: false,
      headset: true,
      lanyardColor: '#00B0F0',
      heightScale: 0.98,
    },
    screenProfile: {
      leftTitle: 'CRM · NORTIA ACC-001',
      rightTitle: 'PIPELINE & AGING',
      mode: 'crm',
    },
    defaultTools: ['read_crm', 'search_knowledge'],
    defaultSources: ['CRM-FIXTURE-2026', 'CRM-ACC-NORTIA-001'],
    workingComments: [
      'Leyendo cuenta ACC-NORTIA-001 (solo lectura, as_of 26/11)…',
      'Calculando en código: OPP-01 activa (8d) · OPP-02 estancada (67d)…',
      'Validando account_brief.json con historial de contacto…',
    ],
    coffeeBanter: [
      'Nortia lleva 67 días con la oportunidad de analítica parada, ¡toca moverla!',
      'Café rápido y vuelvo al pipeline comercial.',
    ],
  },
  offers: {
    id: 'offers',
    name: 'Ofertas',
    displayName: 'Carlos · Ofertas',
    role: 'Comercial',
    zone: 'commercial',
    zoneLabel: 'Zona Comercial',
    accentColor: '#115293',
    deskPos: { x: -3.35, z: 4.7 },
    deskYaw: 0,
    seatPos: { x: -3.35, z: 5.47 },
    exitPos: { x: -2.05, z: 5.35 },
    corridorX: -2.0,
    corridorZ: 0.4,
    boardroomSeatIndex: 3,
    appearance: {
      skin: '#E5B799',
      blazer: '#115293',
      shirt: '#F1F6FA',
      pants: '#223142',
      shoes: '#241B15',
      hairColor: '#4A3426',
      hairStyle: 'sidepart',
      glasses: true,
      lanyardColor: '#43C6F0',
      heightScale: 1.03,
    },
    screenProfile: {
      leftTitle: 'CATÁLOGO · TARIFAS',
      rightTitle: 'OFERTA DOCX · BORRADOR',
      mode: 'offers',
    },
    defaultTools: ['read_catalog', 'build_offer'],
    defaultSources: ['CATALOG-SYNTH-2026', 'OFFER-INTEGRA-01', 'STYLE-01'],
    workingComments: [
      'Consultando bandas aprobadas en CATALOG-SYNTH-2026…',
      'Calculando 42.000 € – 58.000 € (428 h, incluye formación)…',
      'Maquetando oferta-nortia-borrador.docx con sello BORRADOR…',
    ],
    coffeeBanter: [
      'Bandas de precio cuadradas al euro desde catálogo determinista.',
      'En cuanto Dirección apruebe el borrador, lanzamos plan y factura.',
    ],
  },
  consultant: {
    id: 'consultant',
    name: 'Consultoría',
    displayName: 'Marta · Consultoría',
    role: 'Consultor',
    zone: 'solutions',
    zoneLabel: 'Zona Soluciones',
    accentColor: '#2F6657',
    deskPos: { x: 1.0, z: 2.35 },
    deskYaw: 0,
    seatPos: { x: 1.0, z: 3.12 },
    exitPos: { x: 2.45, z: 3.12 },
    corridorX: 2.45,
    corridorZ: 0.4,
    boardroomSeatIndex: 2,
    appearance: {
      skin: '#DFAC8B',
      blazer: '#2F6657',
      shirt: '#FFFFFF',
      pants: '#2A3842',
      shoes: '#1D252C',
      hairColor: '#5C3B28',
      hairStyle: 'bun',
      glasses: false,
      lanyardColor: '#70C4BE',
      heightScale: 0.99,
    },
    screenProfile: {
      leftTitle: 'REQUISITOS · NEGOCIO',
      rightTitle: 'RIESGOS Y FASES',
      mode: 'consultant',
    },
    defaultTools: ['search_knowledge'],
    defaultSources: ['INT-PUBLIC-01', 'DEMO-METHOD-01'],
    workingComments: [
      'Separando requisitos explícitos e inferidos de Nortia Industrial…',
      'Añadiendo fase de capacitación y adopción según respuesta humana…',
      'Registrando riesgos, supuestos y dependencias en briefing.json…',
    ],
    coffeeBanter: [
      'Me encanta cuando el cliente pide formación desde el día uno.',
      'Reviso con Data & AI las fases de adopción en Power BI.',
    ],
  },
  architect: {
    id: 'architect',
    name: 'Data & AI',
    displayName: 'Javier · Data & AI',
    role: 'Arquitecto',
    zone: 'solutions',
    zoneLabel: 'Zona Soluciones',
    accentColor: '#16687A',
    deskPos: { x: 1.0, z: 4.7 },
    deskYaw: 0,
    seatPos: { x: 1.0, z: 5.47 },
    exitPos: { x: 2.45, z: 5.35 },
    corridorX: 2.45,
    corridorZ: 0.4,
    boardroomSeatIndex: 4,
    appearance: {
      skin: '#ECC4A8',
      blazer: '#16687A',
      shirt: '#EBF4F7',
      pants: '#202E3B',
      shoes: '#1A2229',
      hairColor: '#1E1D1C',
      hairStyle: 'curly',
      glasses: true,
      beard: true,
      lanyardColor: '#00B0F0',
      heightScale: 1.04,
    },
    screenProfile: {
      leftTitle: 'MICROSOFT FABRIC',
      rightTitle: 'ARQUITECTURA SVG',
      mode: 'architect',
    },
    defaultTools: ['search_knowledge', 'generate_architecture'],
    defaultSources: ['MS-FABRIC-01', 'MS-POWERBI-01', 'INT-PUBLIC-02'],
    workingComments: [
      'Diseñando Lakehouse + OneLake + Power BI en Microsoft Fabric…',
      'Validando grafo acíclico de solución (8 nodos, 0 ciclos)…',
      'Renderizando diagrama determinista architecture-nortia.svg…',
    ],
    coffeeBanter: [
      'Con Microsoft Fabric y OneLake el dato industrial fluye limpio.',
      'A ver si el SVG queda de portada para la oferta de Carlos.',
    ],
  },
  designer: {
    id: 'designer',
    name: 'Diseño',
    displayName: 'Sofía · Diseño',
    role: 'Diseñador',
    zone: 'communication',
    zoneLabel: 'Zona Comunicación',
    accentColor: '#9E2472',
    deskPos: { x: 6.6, z: 2.55 },
    deskYaw: 0, // sits on +Z side facing -Z (monitors & 6-slide screen face +Z toward camera!)
    seatPos: { x: 6.6, z: 3.32 },
    exitPos: { x: 5.15, z: 3.15 },
    corridorX: 4.9,
    corridorZ: 0.4,
    boardroomSeatIndex: 5,
    appearance: {
      skin: '#F0C8AE',
      blazer: '#8A2866',
      shirt: '#FFFFFF',
      pants: '#252B36',
      shoes: '#20232A',
      hairColor: '#7A4329',
      hairStyle: 'bob',
      glasses: false,
      lanyardColor: '#D70A8A',
      heightScale: 0.97,
    },
    screenProfile: {
      leftTitle: 'BRAND KIT · INTEGRA',
      rightTitle: 'PPTX · 6 DIAPOSITIVAS',
      mode: 'designer',
    },
    defaultTools: ['generate_presentation'],
    defaultSources: ['BRAND-KIT-2026', 'STYLE-01'],
    workingComments: [
      'Aplicando paleta oficial Integra (#0B2A5B / #00B0F0) en 16:9…',
      'Maquetando 6 diapositivas ejecutivas para el comité Nortia…',
      'Exportando comite-nortia-industrial.pptx desde JSON validado…',
    ],
    coffeeBanter: [
      'La portada en azul marino con cian y logo blanco queda impecable.',
      'Solo seis slides limpias: cero ruido visual en proyección.',
    ],
  },
  delivery: {
    id: 'delivery',
    name: 'Proyectos',
    displayName: 'David · Proyectos',
    role: 'Entrega',
    zone: 'operations',
    zoneLabel: 'Zona Operación',
    accentColor: '#36966C',
    deskPos: { x: 5.55, z: 4.7 },
    deskYaw: 0,
    seatPos: { x: 5.55, z: 5.47 },
    exitPos: { x: 4.7, z: 4.2 },
    corridorX: 4.8,
    corridorZ: 0.4,
    boardroomSeatIndex: 4,
    appearance: {
      skin: '#A87654',
      blazer: '#374B5E',
      shirt: '#F2F6FA',
      pants: '#1E2A36',
      shoes: '#171E26',
      hairColor: '#191817',
      hairStyle: 'fade',
      glasses: false,
      beard: true,
      lanyardColor: '#36966C',
      heightScale: 1.03,
    },
    screenProfile: {
      leftTitle: 'HITOS · GANTT 14 SEM',
      rightTitle: 'PLAN PROYECTO PDF',
      mode: 'delivery',
    },
    defaultTools: ['read_projects', 'build_project_plan'],
    defaultSources: ['PROJECTS-FIXTURE-2026', 'OFFER-APPROVED-01'],
    workingComments: [
      'Calculando calendario determinista de 4 fases e hitos de entrega…',
      'Asignando equipo consultor y ventana de formación a usuarios…',
      'Generando plan-proyecto-nortia-borrador.pdf verificable…',
    ],
    coffeeBanter: [
      'Arranque limpio en semana 1, kickoff con Nortia ya calendarizado.',
      'Hitos deterministas: cero fechas inventadas.',
    ],
  },
  billing: {
    id: 'billing',
    name: 'Facturación',
    displayName: 'Ana · Facturación',
    role: 'Administración',
    zone: 'operations',
    zoneLabel: 'Zona Operación',
    accentColor: '#7E5443',
    deskPos: { x: 7.65, z: 4.7 },
    deskYaw: 0,
    seatPos: { x: 7.65, z: 5.47 },
    exitPos: { x: 6.65, z: 3.9 },
    corridorX: 4.8,
    corridorZ: 0.4,
    boardroomSeatIndex: 5,
    appearance: {
      skin: '#C99573',
      blazer: '#7E5443',
      shirt: '#FFFDFB',
      pants: '#27313D',
      shoes: '#1D2229',
      hairColor: '#2B201B',
      hairStyle: 'short',
      glasses: true,
      lanyardColor: '#D5A13D',
      heightScale: 0.99,
    },
    screenProfile: {
      leftTitle: 'AGING · COBROS',
      rightTitle: 'FACTURA · BORRADOR',
      mode: 'billing',
    },
    defaultTools: ['read_billing', 'build_invoice'],
    defaultSources: ['BILLING-FIXTURE-2026', 'CATALOG-SYNTH-2026'],
    workingComments: [
      'Calculando aging y vencimientos exactos en código (as_of 26/11)…',
      'Generando factura-borrador-nortia.pdf (BORRADOR · NO CONTABILIZADO)…',
      'Confirmando bloqueo de envío externo sin revisión financiera…',
    ],
    coffeeBanter: [
      'Todo borrador marcado bien visible: nada se contabiliza solo.',
      'Un espresso y cierro el informe de aging de Nortia.',
    ],
  },
};

export const AGENT_ORDER: AgentId[] = [
  'director',
  'crm',
  'offers',
  'consultant',
  'architect',
  'designer',
  'delivery',
  'billing',
];

/**
 * Computes a collision-free corridor waypoint route from an agent's current
 * floor position to a target activity destination.
 */
export function buildAgentRoute(
  profile: AgentVisualProfile,
  from: Vec2,
  activity: AgentActivity
): { waypoints: Vec2[]; finalYaw: number; seatedAtEnd: boolean } {
  const corridorZ = 0.25;

  if (activity === 'desk') {
    const distToSeat = Math.hypot(from.x - profile.seatPos.x, from.z - profile.seatPos.z);
    if (distToSeat < 0.2) {
      return { waypoints: [profile.seatPos], finalYaw: profile.deskYaw, seatedAtEnd: true };
    }
    const pts: Vec2[] = [];
    // If inside boardroom, exit cleanly via central glass doorway
    if (from.z < -1.1 && from.x > -3.3 && from.x < 3.3) {
      pts.push({ x: 0, z: -1.65 }, { x: 0, z: corridorZ });
    } else if (Math.abs(from.z - profile.seatPos.z) > 1.8 || Math.abs(from.x - profile.seatPos.x) > 2.2) {
      pts.push({ x: from.x, z: corridorZ });
    }
    pts.push({ x: profile.corridorX, z: corridorZ }, profile.exitPos, profile.seatPos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: profile.deskYaw, seatedAtEnd: true };
  }

  const pts: Vec2[] = [];
  // Step 1: leave desk or boardroom cleanly
  const nearSeat = Math.hypot(from.x - profile.seatPos.x, from.z - profile.seatPos.z) < 0.45;
  if (nearSeat) {
    pts.push(profile.exitPos);
  } else if (from.z < -1.1 && from.x > -3.3 && from.x < 3.3) {
    pts.push({ x: 0, z: -1.65 });
  }

  if (activity === 'boardroom') {
    const seat = BOARDROOM_SEATS[profile.boardroomSeatIndex % BOARDROOM_SEATS.length];
    pts.push(
      { x: profile.corridorX, z: corridorZ },
      { x: 0, z: corridorZ },
      { x: 0, z: -1.75 },
      seat.pos
    );
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: seat.yaw, seatedAtEnd: true };
  }

  const target = LANDMARK_WAYPOINTS[activity];
  // Shortcut if Director walks to own whiteboard inside Dirección zone
  if (profile.id === 'director' && activity === 'whiteboard' && from.z < -1.0 && from.x < -3.4) {
    pts.push({ x: -6.3, z: -3.2 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }

  // Shortcut if Offers walks to own Comercial printer
  if ((profile.id === 'offers' || profile.id === 'crm') && activity === 'printer' && from.z > 1.2 && from.x < -0.5) {
    pts.push({ x: -2.0, z: 4.55 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }

  // Shortcut if Solutions agents walk to glass architecture board
  if ((profile.id === 'architect' || profile.id === 'consultant') && activity === 'arch_board' && from.z > 1.2 && from.x > -0.3 && from.x < 4.3) {
    pts.push({ x: 2.35, z: 3.6 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }

  pts.push({ x: profile.corridorX, z: corridorZ });
  if (target.entry) {
    pts.push({ x: target.entry.x, z: corridorZ }, target.entry);
  } else {
    pts.push({ x: target.pos.x, z: corridorZ });
  }
  pts.push(target.pos);
  return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
}

function dedupeWaypoints(points: Vec2[], start: Vec2): Vec2[] {
  const out: Vec2[] = [];
  let prev = start;
  for (const p of points) {
    if (Math.hypot(p.x - prev.x, p.z - prev.z) > 0.14) {
      out.push(p);
      prev = p;
    }
  }
  return out;
}
