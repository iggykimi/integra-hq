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

  // Background activity yields to work and to explicit visits to the same place.
  useEffect(() => {
    const used = new Set(AGENT_ORDER.map((id) => scene.agents[id].activity));
    setSimMap((prev) => {
      let changed = false;
      const next: AmbientSimMap = { ...prev };
      for (const id of Object.keys(prev) as AgentId[]) {
        const rt = scene.agents[id];
        const isFree = (rt.state === 'idle' || rt.state === 'completed') && rt.activity === 'desk';
        const visit = prev[id];
        if (!isFree || (visit && used.has(visit.activity))) {
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

        const occupied = new Set(AGENT_ORDER.map((id) => next[id]?.activity ?? scene.agents[id].activity));
        const chosen = freeAgents[Math.floor(Math.random() * freeAgents.length)];

        if (mood !== 'night' && freeAgents.length >= 2 && activeWanderers === 0 &&
            !occupied.has('lounge_sofa') && !occupied.has('lounge_chair') && Math.random() < 0.45) {
          const partners = freeAgents.filter((id) => id !== chosen);
          const partner = partners[Math.floor(Math.random() * partners.length)];
          const expiresAt = now + 24000;

          next[chosen] = {
            activity: 'lounge_sofa',
            holdingProp: 'coffee',
            bubbleText: 'Charlando en el café',
            poseHint: 'chat',
            iconKind: 'chat',
            expiresAt,
          };
          next[partner] = {
            activity: 'lounge_chair',
            holdingProp: 'coffee',
            bubbleText: 'Charlando en el café',
            poseHint: 'chat',
            iconKind: 'chat',
            expiresAt,
          };
          return next;
        }

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
            text: 'Pausa en la terraza',
          },
          {
            activity: 'coffee',
            holdingProp: 'coffee',
            poseHint: 'normal',
            iconKind: 'coffee',
            text: 'Preparando un café',
          },
          {
            activity: 'phone_booth',
            holdingProp: 'none',
            poseHint: 'call',
            iconKind: 'phone',
            text: 'En una llamada',
          },
          {
            activity: 'auditorium',
            holdingProp: 'tablet',
            poseHint: 'normal',
            iconKind: 'book',
            text: 'Repasando apuntes',
          },
          {
            activity: 'academy',
            holdingProp: 'tablet',
            poseHint: 'normal',
            iconKind: 'book',
            text: 'En el aula',
          },
          {
            activity: 'retro_pc',
            holdingProp: 'none',
            poseHint: 'admire',
            iconKind: 'retro',
            text: 'Mirando el PC de 1986',
          },
        ];

        const available = pool.filter(({ activity }) => !occupied.has(activity) &&
          (mood !== 'night' || activity === 'coffee' || activity === 'phone_booth'));
        const goldenTerrace = mood === 'golden' && Math.random() < 0.5
          ? available.find(({ activity }) => activity === 'terrace')
          : undefined;
        const pick = goldenTerrace ?? available[Math.floor(Math.random() * available.length)];
        if (!pick) return next;
        next[chosen] = {
          activity: pick.activity,
          holdingProp: pick.holdingProp,
          bubbleText: pick.text,
          poseHint: pick.poseHint,
          iconKind: pick.iconKind,
          expiresAt: now + 20500 + Math.floor(Math.random() * 4500),
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
