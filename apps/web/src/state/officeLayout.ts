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
  | 'campus'
  | 'reception'
  | 'director'
  | 'boardroom'
  | 'academy'
  | 'commercial'
  | 'solutions'
  | 'communication'
  | 'operations'
  | 'cafe'
  | 'terrace';

export type AgentActivity =
  | 'desk'
  | 'whiteboard'
  | 'reception'
  | 'boardroom'
  | 'academy'
  | 'coffee'
  | 'lounge_sofa'
  | 'lounge_chair'
  | 'terrace'
  | 'phone_booth'
  | 'auditorium'
  | 'printer'
  | 'arch_board'
  | 'slides_tv'
  | 'retro_pc'
  | 'garden_chat';

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
  /** Facing angle in radians where 0 faces -Z */
  deskYaw: number;
  seatPos: Vec2;
  exitPos: Vec2;
  corridorX: number;
  corridorZ: number;
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
    label: 'En espera',
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
    label: 'Necesita revisión',
    shortLabel: 'Error',
    color: '#C94F50',
    screenAccent: '#C94F50',
    caption: 'Validación fallida · nunca se simula éxito en live',
  },
};

export const ZONE_META: Record<
  ZoneId,
  { label: string; color: string; tagPos: [number, number, number] }
> = {
  director: {
    label: 'Dirección',
    color: '#0B2A5B',
    tagPos: [-10.6, 0.02, -2.35],
  },
  commercial: {
    label: 'Comercial',
    color: '#115293',
    tagPos: [-4.0, 0.02, 9.2],
  },
  solutions: {
    label: 'Soluciones · Data & AI',
    color: '#00B0F0',
    tagPos: [2.8, 0.02, 9.2],
  },
  communication: {
    label: 'Comunicación',
    color: '#D70A8A',
    tagPos: [10.4, 0.02, 2.05],
  },
  operations: {
    label: 'Operación',
    color: '#36966C',
    tagPos: [10.4, 0.02, 9.2],
  },
};

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    label: 'Sede Completa · 28×20 m',
    shortLabel: 'Oficina',
    position: [31, 25, 31],
    target: [0.6, 0.2, 0.1],
    zoom: 38,
  },
  {
    id: 'campus',
    label: 'Campus DAT Alierta · Panorámica',
    shortLabel: 'Campus',
    position: [40, 29, 40],
    target: [0.8, -1.2, -2.4],
    zoom: 24,
  },
  {
    id: 'reception',
    label: 'Recepción & Auditorio IntegraTalks',
    shortLabel: 'Recepción',
    position: [4.5, 11.5, 19.5],
    target: [-10.6, 0.7, 5.4],
    zoom: 76,
  },
  {
    id: 'director',
    label: 'Dirección · Plan de trabajo',
    shortLabel: 'Dirección',
    position: [-4.2, 5.1, 1.8],
    target: [-10.55, 1.05, -5.95],
    zoom: 108,
  },
  {
    id: 'boardroom',
    label: 'Sala Alierta · Consejo',
    shortLabel: 'Sala Alierta',
    position: [2.8, 5.8, 3.3],
    target: [-3.7, 1.08, -5.95],
    zoom: 112,
  },
  {
    id: 'academy',
    label: 'Academia Integra · Formación',
    shortLabel: 'Formación',
    position: [16.5, 11.5, 8.2],
    target: [3.6, 0.85, -5.8],
    zoom: 78,
  },
  {
    id: 'commercial',
    label: 'Comercial · CRM, Ofertas y Cabina',
    shortLabel: 'Comercial',
    position: [9.2, 11.2, 18.2],
    target: [-4.0, 0.8, 5.4],
    zoom: 78,
  },
  {
    id: 'solutions',
    label: 'Soluciones · Data & AI Lab',
    shortLabel: 'Soluciones',
    position: [15.5, 11.2, 18.2],
    target: [2.8, 0.85, 5.4],
    zoom: 78,
  },
  {
    id: 'communication',
    label: 'Comunicación · Estudio PPTX',
    shortLabel: 'Diseño',
    position: [21.5, 10.8, 15.6],
    target: [9.8, 0.85, 3.8],
    zoom: 84,
  },
  {
    id: 'operations',
    label: 'Operación · Proyectos y Factura',
    shortLabel: 'Operación',
    position: [22.2, 10.8, 19.5],
    target: [10.4, 0.8, 7.4],
    zoom: 84,
  },
  {
    id: 'cafe',
    label: 'Rincón Café · Lounge',
    shortLabel: 'Café',
    position: [23.5, 11.5, 7.8],
    target: [10.5, 0.85, -5.6],
    zoom: 78,
  },
  {
    id: 'terrace',
    label: 'Terraza Exterior · Pérgola',
    shortLabel: 'Terraza',
    position: [28.5, 11.5, 7.2],
    target: [15.8, 0.7, -5.2],
    zoom: 82,
  },
];

export const BOARDROOM_SEATS: Array<{ pos: Vec2; yaw: number }> = [
  { pos: { x: -5.45, z: -5.8 }, yaw: -Math.PI / 2 }, // Director head of table (faces +X)
  { pos: { x: -4.6, z: -6.95 }, yaw: Math.PI },      // Back 1
  { pos: { x: -3.7, z: -6.95 }, yaw: Math.PI },      // Back 2
  { pos: { x: -2.8, z: -6.95 }, yaw: Math.PI },      // Back 3
  { pos: { x: -4.6, z: -4.65 }, yaw: 0 },            // Front 1
  { pos: { x: -3.7, z: -4.65 }, yaw: 0 },            // Front 2
  { pos: { x: -2.8, z: -4.65 }, yaw: 0 },            // Front 3
  { pos: { x: -1.95, z: -5.8 }, yaw: Math.PI / 2 },  // East head of table (faces -X)
];

export const LANDMARK_WAYPOINTS: Record<
  Exclude<AgentActivity, 'desk' | 'boardroom'>,
  { pos: Vec2; yaw: number; entry?: Vec2; seated?: boolean }
> = {
  whiteboard: {
    pos: { x: -12.15, z: -5.5 },
    yaw: Math.PI / 2, // faces -X (West wall DAG whiteboard)
    entry: { x: -8.2, z: -0.2 },
  },
  reception: {
    pos: { x: -9.15, z: 4.3 },
    yaw: Math.PI / 2,
    entry: { x: -8.6, z: 0.4 },
  },
  academy: {
    pos: { x: 3.6, z: -5.2 },
    yaw: 0, // sits facing instructor screen (-Z)
    entry: { x: 3.6, z: -1.5 },
    seated: true,
  },
  coffee: {
    pos: { x: 10.35, z: -7.7 },
    yaw: 0, // faces espresso bar (-Z)
    entry: { x: 9.8, z: -1.4 },
  },
  lounge_sofa: {
    pos: { x: 11.15, z: -4.75 },
    yaw: Math.PI / 2, // sits comfortably on the L-sofa facing coffee table!
    entry: { x: 9.8, z: -1.4 },
    seated: true,
  },
  lounge_chair: {
    pos: { x: 8.95, z: -4.35 },
    yaw: -Math.PI / 2.2, // sits on lounge armchair facing sofa buddy!
    entry: { x: 9.8, z: -1.4 },
    seated: true,
  },
  terrace: {
    pos: { x: 15.8, z: -5.0 },
    yaw: -Math.PI / 4, // outdoors under the terracotta pergola looking out over Zaragoza!
    entry: { x: 12.6, z: -5.0 },
  },
  phone_booth: {
    pos: { x: -1.95, z: 3.45 },
    yaw: 0, // inside acoustic glass phone booth taking a private client call
    entry: { x: -2.9, z: 3.45 },
  },
  auditorium: {
    pos: { x: -10.5, z: 8.15 },
    yaw: 0, // sits on the oak IntegraTalks bleachers facing -Z!
    entry: { x: -8.4, z: 6.4 },
    seated: true,
  },
  printer: {
    pos: { x: -2.65, z: 7.2 },
    yaw: -Math.PI / 2,
    entry: { x: -3.1, z: 0.4 },
  },
  arch_board: {
    pos: { x: 4.15, z: 6.1 },
    yaw: -Math.PI / 2,
    entry: { x: 3.4, z: 0.4 },
  },
  slides_tv: {
    pos: { x: 9.8, z: 3.25 },
    yaw: 0,
    entry: { x: 7.7, z: 0.4 },
  },
  retro_pc: {
    pos: { x: -11.6, z: 6.25 },
    yaw: Math.PI / 2.5,
    entry: { x: -8.6, z: 6.25 },
  },
  garden_chat: {
    pos: { x: -12.0, z: -2.4 },
    yaw: Math.PI / 2,
    entry: { x: -8.3, z: -0.2 },
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
    deskPos: { x: -10.35, z: -6.5 },
    deskYaw: 0,
    seatPos: { x: -10.05, z: -5.35 },
    exitPos: { x: -8.35, z: -4.9 },
    corridorX: -8.25,
    corridorZ: -0.1,
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
      leftTitle: 'PLAN DE TRABAJO',
      rightTitle: 'DECISIONES PENDIENTES',
      mode: 'director',
    },
    defaultTools: ['plan', 'ask_human', 'review', 'request_approval'],
    defaultSources: ['INT-METHOD-2026', 'NORTIA-SIGNAL-01'],
    workingComments: [
      'Organizando el trabajo del equipo',
      'Revisando qué decisiones quedan pendientes',
      'Reuniendo los resultados del proyecto',
    ],
    coffeeBanter: [
      'Buen café para arrancar el expediente de Nortia Industrial.',
      'Qué luz tan buena entra hoy desde la terraza del DAT Alierta.',
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
    deskPos: { x: -4.85, z: 3.65 },
    deskYaw: 0,
    seatPos: { x: -4.85, z: 4.45 },
    exitPos: { x: -3.2, z: 4.45 },
    corridorX: -3.15,
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
      'Nortia lleva 67 días con la oportunidad parada, ¡hoy se reactiva!',
      'Paso por la cabina acústica para una llamada rápida y vuelvo.',
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
    deskPos: { x: -4.85, z: 7.2 },
    deskYaw: 0,
    seatPos: { x: -4.85, z: 8.0 },
    exitPos: { x: -3.2, z: 7.65 },
    corridorX: -3.15,
    corridorZ: 0.4,
    boardroomSeatIndex: 4,
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
      'Bandas de precio cuadradas al euro desde el catálogo determinista.',
      'En cuanto Dirección apruebe en Sala Alierta, lanzamos Operación.',
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
    deskPos: { x: 1.55, z: 3.65 },
    deskYaw: 0,
    seatPos: { x: 1.55, z: 4.45 },
    exitPos: { x: 3.35, z: 4.45 },
    corridorX: 3.35,
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
      'Añadiendo fase de formación en Academia Integra según alcance…',
      'Registrando riesgos, supuestos y dependencias en briefing.json…',
    ],
    coffeeBanter: [
      'Me encanta cuando el cliente pide formación en Academia Integra.',
      'Revisando las fases de adopción de Power BI en el lounge.',
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
    deskPos: { x: 1.55, z: 7.2 },
    deskYaw: 0,
    seatPos: { x: 1.55, z: 8.0 },
    exitPos: { x: 3.35, z: 7.65 },
    corridorX: 3.35,
    corridorZ: 0.4,
    boardroomSeatIndex: 5,
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
      'Validando grafo acíclico de solución (6 nodos, 0 ciclos)…',
      'Renderizando diagrama determinista architecture-nortia.svg…',
    ],
    coffeeBanter: [
      'El nuevo rack de Data & AI Lab va fino como la seda.',
      'Con Microsoft Fabric y OneLake el dato industrial fluye limpio.',
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
    deskPos: { x: 9.8, z: 4.15 },
    deskYaw: 0,
    seatPos: { x: 9.8, z: 4.95 },
    exitPos: { x: 7.85, z: 4.75 },
    corridorX: 7.8,
    corridorZ: 0.4,
    boardroomSeatIndex: 3,
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
      'La portada azul marino con cian y el SVG oficial queda impecable.',
      'Salgo un minuto a la terraza exterior a despejar la vista.',
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
    deskPos: { x: 8.85, z: 7.4 },
    deskYaw: 0,
    seatPos: { x: 8.85, z: 8.2 },
    exitPos: { x: 7.75, z: 6.7 },
    corridorX: 7.75,
    corridorZ: 0.4,
    boardroomSeatIndex: 6,
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
      'Asignando equipo consultor y ventana de formación en Academia…',
      'Generando plan-proyecto-nortia-borrador.pdf verificable…',
    ],
    coffeeBanter: [
      'Arranque limpio en semana 1, kickoff con Nortia ya calendarizado.',
      'Qué gusto trabajar en un edificio con terraza y grada propia.',
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
    deskPos: { x: 11.95, z: 7.4 },
    deskYaw: 0,
    seatPos: { x: 11.95, z: 8.2 },
    exitPos: { x: 10.65, z: 6.2 },
    corridorX: 7.75,
    corridorZ: 0.4,
    boardroomSeatIndex: 7,
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
      'Un espresso en el sofá y cierro el informe de aging.',
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
 * Computes a collision-free corridor waypoint route across the 28m x 20m flagship
 * floorplate, keeping clear of the atrium stairwell, glass partitions, and desks.
 */
export function buildAgentRoute(
  profile: AgentVisualProfile,
  from: Vec2,
  activity: AgentActivity
): { waypoints: Vec2[]; finalYaw: number; seatedAtEnd: boolean } {
  // Slight personal lane offset in corridor so agents passing each other don't collide head-on
  const laneOffset = ((profile.boardroomSeatIndex % 3) - 1) * 0.45;
  const corridorZ = 0.25 + laneOffset;

  const leaveCurrentRoom = (pts: Vec2[]) => {
    const nearSeat = Math.hypot(from.x - profile.seatPos.x, from.z - profile.seatPos.z) < 0.55;
    if (nearSeat) {
      pts.push(profile.exitPos);
      return;
    }
    // Exit Sala Alierta cleanly via doorway (-3.7, -2.0)
    if (from.z < -2.0 && from.x > -7.3 && from.x < -0.1) {
      pts.push({ x: -3.7, z: -2.4 }, { x: -3.7, z: corridorZ });
      return;
    }
    // Exit Academia cleanly via doorway (+3.6, -2.0)
    if (from.z < -2.0 && from.x >= 0.1 && from.x < 7.2) {
      pts.push({ x: 3.6, z: -2.4 }, { x: 3.6, z: corridorZ });
      return;
    }
    // Exit Outdoor Terrace back through Café glass door (+14.0, -5.0)
    if (from.x > 13.8) {
      pts.push({ x: 12.6, z: -5.0 }, { x: 9.8, z: -1.4 }, { x: 9.8, z: corridorZ });
      return;
    }
    // Exit Café / Lounge cleanly via entrance (+9.8, -1.6)
    if (from.z < -2.0 && from.x >= 7.2) {
      pts.push({ x: 9.8, z: -1.4 }, { x: 9.8, z: corridorZ });
      return;
    }
    // Exit Acoustic Phone Booth
    if (Math.hypot(from.x - -1.95, from.z - 3.45) < 0.8) {
      pts.push({ x: -3.1, z: 3.45 });
    }
    // Exit Reception Retro PC / Auditorium without cutting through Reception Desk!
    if (from.x < -9.5 && from.z > 4.8) {
      pts.push({ x: -8.6, z: 6.25 }, { x: -8.6, z: corridorZ });
    }
  };

  if (activity === 'desk') {
    const distToSeat = Math.hypot(from.x - profile.seatPos.x, from.z - profile.seatPos.z);
    if (distToSeat < 0.25) {
      return { waypoints: [profile.seatPos], finalYaw: profile.deskYaw, seatedAtEnd: true };
    }
    const pts: Vec2[] = [];
    leaveCurrentRoom(pts);
    pts.push({ x: Math.max(-8.8, from.x), z: corridorZ }, { x: profile.corridorX, z: corridorZ }, profile.exitPos, profile.seatPos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: profile.deskYaw, seatedAtEnd: true };
  }

  const pts: Vec2[] = [];
  leaveCurrentRoom(pts);

  if (activity === 'boardroom') {
    const seat = BOARDROOM_SEATS[profile.boardroomSeatIndex % BOARDROOM_SEATS.length];
    pts.push(
      { x: Math.max(-8.8, profile.corridorX), z: corridorZ },
      { x: -3.7, z: corridorZ },
      { x: -3.7, z: -2.5 },
      seat.pos
    );
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: seat.yaw, seatedAtEnd: true };
  }

  const target = LANDMARK_WAYPOINTS[activity];

  // Fast direct in-zone shortcuts
  if (profile.id === 'director' && activity === 'whiteboard' && from.z < -1.8 && from.x < -7.2) {
    pts.push({ x: -10.8, z: -4.8 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }
  if ((profile.id === 'offers' || profile.id === 'crm') && activity === 'printer' && from.z > 1.8 && from.x < -1.0) {
    pts.push({ x: -3.15, z: 7.2 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }
  if ((profile.id === 'architect' || profile.id === 'consultant') && activity === 'arch_board' && from.z > 1.8 && from.x > -0.8 && from.x < 6.8) {
    pts.push({ x: 3.35, z: 6.1 }, target.pos);
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }

  // Terrace goes smoothly through the Café entrance -> glass terrace door -> outdoor deck
  if (activity === 'terrace') {
    pts.push(
      { x: Math.max(-8.8, from.x), z: corridorZ },
      { x: 9.8, z: corridorZ },
      { x: 9.8, z: -1.4 },
      { x: 12.6, z: -5.0 },
      target.pos
    );
    return { waypoints: dedupeWaypoints(pts, from), finalYaw: target.yaw, seatedAtEnd: false };
  }

  pts.push({ x: Math.max(-8.8, from.x), z: corridorZ });
  if (target.entry) {
    pts.push({ x: target.entry.x, z: corridorZ }, target.entry);
  } else {
    pts.push({ x: target.pos.x, z: corridorZ });
  }
  pts.push(target.pos);
  return {
    waypoints: dedupeWaypoints(pts, from),
    finalYaw: target.yaw,
    seatedAtEnd: Boolean(target.seated),
  };
}

function dedupeWaypoints(points: Vec2[], start: Vec2): Vec2[] {
  const out: Vec2[] = [];
  let prev = start;
  for (const p of points) {
    if (Math.hypot(p.x - prev.x, p.z - prev.z) > 0.16) {
      out.push(p);
      prev = p;
    }
  }
  return out;
}
