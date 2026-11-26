import type { AgentId, OfficeEvent, ProjectStatus, TaskState } from '@contracts/types';

const WORK: Record<AgentId, [task: string, result: string]> = {
  director: ['Coordinar al equipo', 'Trabajo revisado'],
  crm: ['Revisar la oportunidad', 'Contexto comercial listo'],
  consultant: ['Definir los requisitos', 'Requisitos definidos'],
  architect: ['Diseñar la solución', 'Diagrama de arquitectura'],
  offers: ['Preparar la oferta', 'Borrador de oferta'],
  delivery: ['Planificar la entrega', 'Plan de proyecto'],
  billing: ['Preparar la factura', 'Borrador de factura'],
  designer: ['Preparar la presentación', 'Presentación para el comité'],
};

export const taskLabel = (agent: AgentId) => WORK[agent][0];
export const resultLabel = (agent: AgentId) => WORK[agent][1];

export const PROJECT_LABEL: Record<ProjectStatus, string> = {
  queued: 'Listo para empezar',
  running: 'En marcha',
  paused: 'Pendiente de tu decisión',
  completed: 'Proyecto completado',
  failed: 'El proyecto se detuvo',
  cancelled: 'Proyecto cancelado',
  interrupted: 'Proyecto interrumpido',
};

export const TASK_LABEL: Record<TaskState, string> = {
  queued: 'Pendiente',
  running: 'En curso',
  waiting: 'En espera',
  completed: 'Lista',
  failed: 'Con error',
  blocked: 'Bloqueada',
  cancelled: 'Cancelada',
};

export function eventLabel(event: OfficeEvent | null, includesTraining = true): string {
  if (!event) return 'El equipo está listo para empezar';
  const agent = event.agent_id ?? 'director';

  switch (event.type) {
    case 'request.received': return 'Nortia quiere ampliar su plataforma de datos';
    case 'human.message': return event.payload.author === 'director'
      ? 'Elena pregunta por la formación'
      : includesTraining ? 'La oferta incluirá formación' : 'La oferta seguirá sin formación';
    case 'plan.created': return 'Elena reparte el trabajo';
    case 'task.assigned':
    case 'task.started': return taskLabel(agent);
    case 'tool.started': return 'Consultando la cuenta de Nortia';
    case 'tool.completed': return 'Historial de Nortia revisado';
    case 'artifact.created': return resultLabel(agent);
    case 'task.completed': return agent === 'offers' ? 'Oferta aprobada' : resultLabel(agent);
    case 'task.failed': return 'Una tarea necesita revisión';
    case 'task.blocked': return 'Una tarea está en espera';
    case 'approval.required': return 'Elena te pide revisar la oferta';
    case 'approval.resolved': return 'Oferta aprobada';
    case 'run.paused': return 'El equipo espera tu decisión';
    case 'run.resumed': return 'El equipo retoma el trabajo';
    case 'project.completed': return 'La demostración ha terminado';
    case 'project.failed': return PROJECT_LABEL.failed;
    case 'project.cancelled': return PROJECT_LABEL.cancelled;
  }
}
