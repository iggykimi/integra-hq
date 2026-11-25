// Proposed shared contract; not a built SDK.
export type AgentId = 'director' | 'crm' | 'consultant' | 'architect' | 'offers' | 'designer' | 'delivery' | 'billing';
export type AgentState = 'idle' | 'planning' | 'working' | 'collaborating' | 'waiting' | 'completed' | 'blocked' | 'error';
export interface PlanTask { id: string; agent: Exclude<AgentId, 'director'>; instruction: string; dependsOn: string[]; requiresApproval?: boolean }
export interface Plan { objective: string; tasks: PlanTask[]; assumptions: string[] }
export interface OfficeAgent { id: AgentId; state: AgentState; currentTask?: string; workstation: string }
export interface OfficeEvent { event_id: string; sequence: number; timestamp: string; type: string; project_id: string; agent_id: AgentId | null; task_id: string | null; payload: Record<string, unknown> }
export interface HumanMessage { id: string; projectId: string; taskId?: string; text: string; decision?: 'approve' | 'reject' | 'answer'; createdAt: string }
export interface Artifact { id: string; projectId: string; name: string; mime: string; size: number; sha256: string; downloadPath: string }
export interface ProjectSnapshot { id: string; mode: 'live' | 'mock' | 'replay'; status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'interrupted'; lastSequence: number; agents: OfficeAgent[]; plan?: Plan; artifacts: Artifact[] }
