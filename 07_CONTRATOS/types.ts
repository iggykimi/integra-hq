// Proposed shared contract; not a compiled SDK.
export type AgentId =
  | 'director'
  | 'crm'
  | 'consultant'
  | 'architect'
  | 'offers'
  | 'designer'
  | 'delivery'
  | 'billing';

export type SpecialistAgentId = Exclude<AgentId, 'director'>;

export type AgentState =
  | 'idle'
  | 'planning'
  | 'working'
  | 'collaborating'
  | 'waiting'
  | 'completed'
  | 'blocked'
  | 'error';

export type TaskState =
  | 'queued'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled';

export type ProjectStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'interrupted';

export type OfficeEventType =
  | 'request.received'
  | 'plan.created'
  | 'task.assigned'
  | 'task.started'
  | 'tool.started'
  | 'tool.completed'
  | 'artifact.created'
  | 'task.completed'
  | 'task.failed'
  | 'task.blocked'
  | 'human.message'
  | 'approval.required'
  | 'approval.resolved'
  | 'run.paused'
  | 'run.resumed'
  | 'project.completed'
  | 'project.failed'
  | 'project.cancelled';

export interface PlanTask {
  id: string;
  agent: SpecialistAgentId;
  instruction: string;
  dependsOn: string[];
  requiresApproval?: boolean;
}

export interface Plan {
  objective: string;
  tasks: PlanTask[];
  assumptions: string[];
}

export interface OfficeAgent {
  id: AgentId;
  state: AgentState;
  currentTask?: string;
  workstation: 'director' | 'commercial' | 'solutions' | 'communication' | 'operations';
}

export interface OfficeEvent {
  event_id: string;
  sequence: number;
  timestamp: string;
  type: OfficeEventType;
  project_id: string;
  agent_id: AgentId | null;
  task_id: string | null;
  payload: Record<string, unknown>;
}

export interface HumanMessage {
  id: string;
  projectId: string;
  taskId?: string;
  author: 'director' | 'human';
  text: string;
  options?: string[];
  decision?: 'approve' | 'correct' | 'reject' | 'answer';
  createdAt: string;
}

export interface PriceBandEur {
  min: number;
  max: number;
  label: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  downloadPath: string;
  draft?: boolean;
}

export interface ProjectSnapshot {
  id: string;
  mode: 'live' | 'mock' | 'replay';
  status: ProjectStatus;
  asOf: string;
  lastSequence: number;
  replanCount: number;
  agents: OfficeAgent[];
  plan?: Plan;
  pendingHumanPrompt?: HumanMessage;
  artifacts: Artifact[];
}
