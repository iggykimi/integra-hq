import { useEffect, useState } from 'react';
import type { AgentId } from '@contracts/types';
import { AGENT_ORDER, type AgentActivity } from './officeLayout';
import type { OfficeSceneState } from './officeReducer';

export interface AmbientAgentOverride {
  activity: AgentActivity;
  holdingProp: 'none' | 'coffee' | 'binder' | 'tablet';
  bubbleText: string;
  poseHint: 'normal' | 'stretch' | 'chat' | 'admire';
  expiresAt: number;
}

export type AmbientSimMap = Partial<Record<AgentId, AmbientAgentOverride>>;

const SOCIAL_DIALOGUES: Array<[string, string]> = [
  [
    '¿Probaste ya gpt-6-luna en el plan DAG de Nortia?',
    'Sí, vuela validando dependencias sin pasarse de latencia.',
  ],
  [
    '¿Viste las vistas al parque del DAT Alierta hoy?',
    'Con las celosías cerámicas la luz de Zaragoza entra genial.',
  ],
  [
    'Un espresso rápido antes del próximo encargo.',
    'Buena idea, así llegamos frescos a la aprobación en Sala Alierta.',
  ],
  [
    'Qué limpio ha quedado el diagrama de Microsoft Fabric.',
    'Y encaja perfecto con la presentación de 6 slides de Diseño.',
  ],
  [
    '40 años desde Calatayud y ahora en una sede agéntica.',
    'Lo mejor es que la persona sigue teniendo la última palabra.',
  ],
];

const SOLO_ROUTINES: Array<{
  activity: AgentActivity;
  holdingProp: 'none' | 'coffee' | 'tablet';
  poseHint: 'normal' | 'stretch' | 'admire';
  lines: string[];
}> = [
  {
    activity: 'coffee',
    holdingProp: 'coffee',
    poseHint: 'normal',
    lines: [
      'Preparando un café recién molido en IntegraTalks…',
      'Pausa de 2 minutos en la cafetera · disponible si llega tarea.',
    ],
  },
  {
    activity: 'window_view',
    holdingProp: 'coffee',
    poseHint: 'stretch',
    lines: [
      'Estirando piernas mirando el parque DAT Alierta y el carril bici…',
      'Respiro breve junto a los ventanales de Zaragoza.',
    ],
  },
  {
    activity: 'retro_pc',
    holdingProp: 'none',
    poseHint: 'admire',
    lines: [
      'Curioseando el PC retro de 1986 en Recepción… ¡qué historia!',
      'De Calatayud 1986 al DAT Alierta 2029.',
    ],
  },
  {
    activity: 'garden_chat',
    holdingProp: 'tablet',
    poseHint: 'admire',
    lines: [
      'Revisando notas junto al jardín vertical interior…',
      'Aire fresco junto al muro biofílico del pasillo central.',
    ],
  },
  {
    activity: 'lounge',
    holdingProp: 'coffee',
    poseHint: 'normal',
    lines: [
      'Leyendo novedades de Microsoft Solutions Partner en el lounge.',
      'Tomando un café tranquilo · puesto listo para nueva asignación.',
    ],
  },
];

/**
 * Autonomous idle office-life simulator (Sims / Two Point Campus style).
 * Strictly operates ONLY on agents whose real workflow state is `idle` or `completed`
 * and never alters real task/event state.
 */
export function useOfficeLifeSim(
  enabled: boolean,
  reducedMotion: boolean,
  scene: OfficeSceneState,
  manualTrigger: number
): AmbientSimMap {
  const [simMap, setSimMap] = useState<AmbientSimMap>({});

  // Clear immediately when disabled or reduced motion enabled
  useEffect(() => {
    if (!enabled || reducedMotion) {
      setSimMap({});
    }
  }, [enabled, reducedMotion]);

  // Immediately evict any agent whose real workflow state becomes active/waiting/error
  useEffect(() => {
    setSimMap((prev) => {
      let changed = false;
      const next: AmbientSimMap = { ...prev };
      for (const id of Object.keys(prev) as AgentId[]) {
        const rt = scene.agents[id];
        const isFree = (rt.state === 'idle' || rt.state === 'completed') && rt.activity === 'desk';
        if (!isFree) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [scene]);

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const runStep = () => {
      const now = Date.now();
      setSimMap((prev) => {
        const next: AmbientSimMap = {};
        for (const id of Object.keys(prev) as AgentId[]) {
          const entry = prev[id];
          if (entry && entry.expiresAt > now) {
            next[id] = entry;
          }
        }

        // Find truly free agents sitting at their desks
        const freeAgents = AGENT_ORDER.filter((id) => {
          if (next[id]) return false;
          const rt = scene.agents[id];
          return (rt.state === 'idle' || rt.state === 'completed') && rt.activity === 'desk';
        });

        // Keep at most 2 ambient wanderers at once so the office feels lively and uncluttered
        const activeWanderers = Object.keys(next).length;
        if (freeAgents.length === 0 || activeWanderers >= 2) {
          return next;
        }

        // 48% chance of a 2-agent synchronized social coffee/lounge chat when nobody else is wandering
        if (freeAgents.length >= 2 && activeWanderers === 0 && Math.random() < 0.48) {
          const shuffled = [...freeAgents].sort(() => Math.random() - 0.5);
          const a = shuffled[0];
          const b = shuffled[1];
          const [lineA, lineB] =
            SOCIAL_DIALOGUES[Math.floor(Math.random() * SOCIAL_DIALOGUES.length)];
          const duration = 12000 + Math.floor(Math.random() * 5000);

          next[a] = {
            activity: 'coffee',
            holdingProp: 'coffee',
            bubbleText: lineA,
            poseHint: 'chat',
            expiresAt: now + duration,
          };
          next[b] = {
            activity: 'lounge',
            holdingProp: 'coffee',
            bubbleText: lineB,
            poseHint: 'chat',
            expiresAt: now + duration,
          };
          return next;
        }

        // Otherwise send 1 free agent on a charming solo office micro-routine
        const chosen = freeAgents[Math.floor(Math.random() * freeAgents.length)];
        const occupiedActivities = new Set(Object.values(next).map((v) => v?.activity));
        const availableRoutines = SOLO_ROUTINES.filter((r) => !occupiedActivities.has(r.activity));
        const routine =
          (availableRoutines.length > 0 ? availableRoutines : SOLO_ROUTINES)[
            Math.floor(Math.random() * (availableRoutines.length || SOLO_ROUTINES.length))
          ];
        const line = routine.lines[Math.floor(Math.random() * routine.lines.length)];

        next[chosen] = {
          activity: routine.activity,
          holdingProp: routine.holdingProp,
          bubbleText: line,
          poseHint: routine.poseHint,
          expiresAt: now + 10000 + Math.floor(Math.random() * 5000),
        };
        return next;
      });
    };

    // Kick off first gentle ambient moment after 2.8s (or immediately on manual trigger)
    const initialTimer = window.setTimeout(runStep, manualTrigger > 0 ? 120 : 2800);
    const interval = window.setInterval(runStep, 5500);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [enabled, reducedMotion, scene, manualTrigger]);

  return simMap;
}
