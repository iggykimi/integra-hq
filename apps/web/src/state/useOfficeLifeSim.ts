import { useEffect, useState } from 'react';
import type { AgentId } from '@contracts/types';
import { AGENT_ORDER, type AgentActivity, type LightingMood } from './officeLayout';
import type { OfficeSceneState } from './officeReducer';

export interface AmbientAgentOverride {
  activity: AgentActivity;
  holdingProp: 'none' | 'coffee' | 'binder' | 'tablet';
  bubbleText: string;
  poseHint: 'normal' | 'stretch' | 'chat' | 'admire' | 'call';
  iconKind: 'coffee' | 'chat' | 'sun' | 'phone' | 'book' | 'retro';
  expiresAt: number;
}

export type AmbientSimMap = Partial<Record<AgentId, AmbientAgentOverride>>;

const SOCIAL_LOUNGE_DIALOGUES: Array<[string, string]> = [
  [
    '¿Probaste ya gpt-6-luna en el plan DAG de Nortia?',
    'Sí, vuela validando dependencias sin pasarse de latencia.',
  ],
  [
    'Qué gustazo tener el lounge conectado con la terraza.',
    'Y con la Academia al lado para preparar la formación de Nortia.',
  ],
  [
    'Un espresso en el sofá antes del próximo bloque.',
    'Perfecto, así llegamos frescos a la aprobación en Sala Alierta.',
  ],
  [
    'Qué limpio ha quedado el diagrama de Microsoft Fabric.',
    'Combina genial con las 6 diapositivas de Diseño.',
  ],
];

/**
 * Autonomous idle office-life simulator (Sims / Two Point Campus style).
 * Adapts subtly to lighting mood (coffee/calls in Day, outdoor Terrace in Golden Hour,
 * calm focus in Night mode) and yields immediately to any real workflow event.
 */
export function useOfficeLifeSim(
  enabled: boolean,
  reducedMotion: boolean,
  mood: LightingMood,
  scene: OfficeSceneState,
  manualTrigger: number
): AmbientSimMap {
  const [simMap, setSimMap] = useState<AmbientSimMap>({});

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setSimMap({});
    }
  }, [enabled, reducedMotion]);

  // Immediately clear any agent that receives a real workflow task/checkpoint
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

        const freeAgents = AGENT_ORDER.filter((id) => {
          if (next[id]) return false;
          const rt = scene.agents[id];
          return (rt.state === 'idle' || rt.state === 'completed') && rt.activity === 'desk';
        });

        const maxWanderers = mood === 'night' ? 1 : 2;
        const activeWanderers = Object.keys(next).length;
        if (freeAgents.length === 0 || activeWanderers >= maxWanderers) {
          return next;
        }

        // 2-agent seated sofa + armchair conversation in the Lounge!
        if (mood !== 'night' && freeAgents.length >= 2 && activeWanderers === 0 && Math.random() < 0.45) {
          const shuffled = [...freeAgents].sort(() => Math.random() - 0.5);
          const a = shuffled[0];
          const b = shuffled[1];
          const [lineA, lineB] =
            SOCIAL_LOUNGE_DIALOGUES[Math.floor(Math.random() * SOCIAL_LOUNGE_DIALOGUES.length)];
          const duration = 13500 + Math.floor(Math.random() * 4500);

          next[a] = {
            activity: 'lounge_sofa',
            holdingProp: 'coffee',
            bubbleText: lineA,
            poseHint: 'chat',
            iconKind: 'chat',
            expiresAt: now + duration,
          };
          next[b] = {
            activity: 'lounge_chair',
            holdingProp: 'coffee',
            bubbleText: lineB,
            poseHint: 'chat',
            iconKind: 'chat',
            expiresAt: now + duration,
          };
          return next;
        }

        const chosen = freeAgents[Math.floor(Math.random() * freeAgents.length)];
        const pool: Array<{
          activity: AgentActivity;
          holdingProp: 'none' | 'coffee' | 'tablet';
          poseHint: 'normal' | 'stretch' | 'admire' | 'call';
          iconKind: 'coffee' | 'sun' | 'phone' | 'book' | 'retro';
          text: string;
        }> = [
          {
            activity: 'terrace',
            holdingProp: 'coffee',
            poseHint: 'stretch',
            iconKind: 'sun',
            text:
              mood === 'golden'
                ? 'Disfrutando el atardecer de Zaragoza en la terraza DAT Alierta…'
                : 'Respiro breve en la terraza bajo la pérgola cerámica.',
          },
          {
            activity: 'coffee',
            holdingProp: 'coffee',
            poseHint: 'normal',
            iconKind: 'coffee',
            text: 'Preparando un espresso en el Rincón Café…',
          },
          {
            activity: 'phone_booth',
            holdingProp: 'tablet',
            poseHint: 'call',
            iconKind: 'phone',
            text: 'Llamada breve en la cabina acústica · disponible enseguida.',
          },
          {
            activity: 'auditorium',
            holdingProp: 'tablet',
            poseHint: 'normal',
            iconKind: 'book',
            text: 'Repasando notas en la grada de roble IntegraTalks.',
          },
          {
            activity: 'academy',
            holdingProp: 'tablet',
            poseHint: 'normal',
            iconKind: 'book',
            text: scene.includesTraining
              ? 'Preparando materiales en Academia Integra para Nortia.'
              : 'Revisando el aula de Academia Integra.',
          },
          {
            activity: 'retro_pc',
            holdingProp: 'none',
            poseHint: 'admire',
            iconKind: 'retro',
            text: 'Curioseando el PC retro de 1986 en Recepción · 40 años.',
          },
        ];

        // Favor outdoor terrace in Golden Hour, coffee in Night mode
        const filtered =
          mood === 'night'
            ? pool.filter((r) => r.activity === 'coffee' || r.activity === 'phone_booth')
            : mood === 'golden' && Math.random() < 0.5
              ? pool.filter((r) => r.activity === 'terrace')
              : pool;

        const pick = filtered[Math.floor(Math.random() * filtered.length)] ?? pool[0];
        next[chosen] = {
          activity: pick.activity,
          holdingProp: pick.holdingProp,
          bubbleText: pick.text,
          poseHint: pick.poseHint,
          iconKind: pick.iconKind,
          expiresAt: now + 11500 + Math.floor(Math.random() * 4500),
        };
        return next;
      });
    };

    const initialTimer = window.setTimeout(runStep, manualTrigger > 0 ? 120 : 2500);
    const interval = window.setInterval(runStep, 5800);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [enabled, reducedMotion, mood, scene, manualTrigger]);

  return simMap;
}
