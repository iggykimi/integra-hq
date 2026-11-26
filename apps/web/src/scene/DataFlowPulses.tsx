import { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AgentId } from '@contracts/types';
import { AGENT_PROFILES, type Vec2 } from '../state/officeLayout';
import type { DataPulseLink } from '../state/officeReducer';

interface DataFlowPulsesProps {
  pulses: DataPulseLink[];
  agentPositions: Partial<Record<AgentId, Vec2>>;
  enabled: boolean;
  reducedMotion: boolean;
}

function PulseArc({
  link,
  start,
  end,
  reducedMotion,
}: {
  link: DataPulseLink;
  start: Vec2;
  end: Vec2;
  reducedMotion: boolean;
}) {
  const beadRef = useRef<THREE.Mesh>(null);
  const bead2Ref = useRef<THREE.Mesh>(null);

  const { curve, points } = useMemo(() => {
    const p0 = new THREE.Vector3(start.x, 1.15, start.z);
    const p2 = new THREE.Vector3(end.x, 1.15, end.z);
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      1.95 + Math.min(1.4, p0.distanceTo(p2) * 0.14),
      (start.z + end.z) / 2
    );
    const c = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    return { curve: c, points: c.getPoints(28) };
  }, [start.x, start.z, end.x, end.z]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (beadRef.current) {
      const u = (t * 0.55) % 1;
      curve.getPoint(u, beadRef.current.position);
    }
    if (bead2Ref.current) {
      const u2 = (t * 0.55 + 0.5) % 1;
      curve.getPoint(u2, bead2Ref.current.position);
    }
  });

  return (
    <group>
      <Line
        points={points}
        color={link.color}
        lineWidth={1.8}
        transparent
        opacity={0.48}
        dashed
        dashScale={4}
        dashSize={0.5}
        gapSize={0.35}
      />
      {!reducedMotion && (
        <>
          <mesh ref={beadRef}>
            <sphereGeometry args={[0.095, 10, 10]} />
            <meshStandardMaterial
              color={link.color}
              emissive={link.color}
              emissiveIntensity={1.4}
            />
          </mesh>
          <mesh ref={bead2Ref}>
            <sphereGeometry args={[0.072, 10, 10]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={link.color}
              emissiveIntensity={1.1}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

export function DataFlowPulses({
  pulses,
  agentPositions,
  enabled,
  reducedMotion,
}: DataFlowPulsesProps) {
  if (!enabled || pulses.length === 0) return null;

  const resolvePos = (node: AgentId | 'reception'): Vec2 => {
    if (node === 'reception') return { x: -6.7, z: 2.8 };
    return agentPositions[node] ?? AGENT_PROFILES[node].deskPos;
  };

  return (
    <group>
      {pulses.map((link) => (
        <PulseArc
          key={link.id}
          link={link}
          start={resolvePos(link.from)}
          end={resolvePos(link.to)}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
