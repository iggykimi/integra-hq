import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AgentId } from '@contracts/types';
import {
  type AgentActivity,
  type AgentVisualProfile,
  buildAgentRoute,
  type HairStyle,
  STATE_META,
  type Vec2,
} from '../state/officeLayout';
import type { AgentRuntimeState, PendingCheckpoint } from '../state/officeReducer';

export type BubbleVisibilityMode = 'smart' | 'all' | 'none';

interface SpecialistAgentProps {
  profile: AgentVisualProfile;
  agent: AgentRuntimeState;
  selected: boolean;
  bubbleMode: BubbleVisibilityMode;
  reducedMotion: boolean;
  checkpoint: PendingCheckpoint | null;
  onSelect: (id: AgentId) => void;
  onPositionReport?: (id: AgentId, pos: Vec2) => void;
}

function lerpAngle(current: number, target: number, alpha: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * alpha;
}

function HairSculpt({ style, color }: { style: HairStyle; color: string }) {
  return (
    <group>
      {/* Base cranial hair cap */}
      <mesh position={[0, 0.055, 0.02]} scale={[1.04, 0.92, 1.05]} castShadow>
        <sphereGeometry args={[0.188, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>

      {style === 'sidepart' && (
        <>
          <mesh position={[-0.03, 0.14, -0.115]} rotation={[0.22, 0.16, -0.2]} castShadow>
            <capsuleGeometry args={[0.042, 0.13, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.01, 0.13]} scale={[1.02, 0.82, 0.62]} castShadow>
            <sphereGeometry args={[0.165, 14, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        </>
      )}

      {style === 'bob' && (
        <>
          <mesh position={[-0.165, -0.055, 0.03]} scale={[0.55, 1.15, 0.88]} castShadow>
            <capsuleGeometry args={[0.075, 0.16, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh position={[0.165, -0.055, 0.03]} scale={[0.55, 1.15, 0.88]} castShadow>
            <capsuleGeometry args={[0.075, 0.16, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.06, 0.13]} scale={[1.08, 1.15, 0.56]} castShadow>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        </>
      )}

      {style === 'ponytail' && (
        <>
          <mesh position={[0, 0.02, 0.15]} scale={[0.98, 0.88, 0.58]} castShadow>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.06, 0.24]} rotation={[0.35, 0, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.18, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        </>
      )}

      {style === 'bun' && (
        <>
          <mesh position={[0, 0.03, 0.13]} scale={[0.98, 0.85, 0.6]} castShadow>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.14, 0.18]} castShadow>
            <sphereGeometry args={[0.088, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        </>
      )}

      {style === 'curly' && (
        <>
          {[
            [-0.1, 0.16, -0.04],
            [0.02, 0.19, -0.02],
            [0.11, 0.15, -0.04],
            [-0.13, 0.11, 0.07],
            [0.13, 0.11, 0.07],
            [0, 0.14, 0.12],
          ].map(([cx, cy, cz], idx) => (
            <mesh key={idx} position={[cx, cy, cz]} castShadow>
              <dodecahedronGeometry args={[0.078, 1]} />
              <meshStandardMaterial color={color} roughness={0.88} />
            </mesh>
          ))}
        </>
      )}

      {style === 'fade' && (
        <mesh position={[0, 0.13, -0.01]} scale={[0.92, 0.45, 0.92]} castShadow>
          <cylinderGeometry args={[0.165, 0.175, 0.12, 14]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      )}

      {style === 'short' && (
        <mesh position={[0, 0.04, 0.12]} scale={[1.0, 0.82, 0.64]} castShadow>
          <sphereGeometry args={[0.162, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      )}
    </group>
  );
}

export function SpecialistAgent({
  profile,
  agent,
  selected,
  bubbleMode,
  reducedMotion,
  checkpoint,
  onSelect,
  onPositionReport,
}: SpecialistAgentProps) {
  const rootRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const alertPropRef = useRef<THREE.Mesh>(null);

  // Waypoint locomotion refs (kept out of React state for smooth 60 FPS animation)
  const routeRef = useRef<Vec2[]>([]);
  const routeIdxRef = useRef<number>(0);
  const finalYawRef = useRef<number>(profile.deskYaw);
  const seatedAtEndRef = useRef<boolean>(true);
  const lastActivityRef = useRef<AgentActivity>(agent.activity);
  const [isWalking, setIsWalking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reportTimerRef = useRef(0);

  // Recompute collision-free corridor route whenever target activity changes
  useEffect(() => {
    if (lastActivityRef.current === agent.activity) return;
    lastActivityRef.current = agent.activity;
    const root = rootRef.current;
    const currentPos: Vec2 = root
      ? { x: root.position.x, z: root.position.z }
      : { ...profile.seatPos };

    const plan = buildAgentRoute(profile, currentPos, agent.activity);
    routeRef.current = plan.waypoints;
    routeIdxRef.current = 0;
    finalYawRef.current = plan.finalYaw;
    seatedAtEndRef.current = plan.seatedAtEnd;

    if (reducedMotion && root && plan.waypoints.length > 0) {
      const dest = plan.waypoints[plan.waypoints.length - 1];
      root.position.set(dest.x, 0, dest.z);
      root.rotation.y = plan.finalYaw;
      routeRef.current = [];
      setIsWalking(false);
      onPositionReport?.(profile.id, dest);
    } else if (plan.waypoints.length > 0) {
      setIsWalking(true);
    }
  }, [agent.activity, profile, reducedMotion, onPositionReport]);

  useFrame(({ clock }, delta) => {
    const root = rootRef.current;
    if (!root) return;

    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    const lerpRate = reducedMotion ? 1 : Math.min(1, dt * 8.5);
    const seed = profile.boardroomSeatIndex * 1.37 + 0.5;

    let moving = false;
    const pts = routeRef.current;
    if (pts.length > 0 && routeIdxRef.current < pts.length) {
      const target = pts[routeIdxRef.current];
      const dx = target.x - root.position.x;
      const dz = target.z - root.position.z;
      const dist = Math.hypot(dx, dz);
      const speed = 2.05;

      if (dist < 0.08) {
        root.position.x = target.x;
        root.position.z = target.z;
        routeIdxRef.current += 1;
        if (routeIdxRef.current >= pts.length) {
          routeRef.current = [];
          setIsWalking(false);
          onPositionReport?.(profile.id, target);
        } else {
          moving = true;
        }
      } else {
        moving = true;
        const step = Math.min(dist, speed * dt);
        root.position.x += (dx / dist) * step;
        root.position.z += (dz / dist) * step;
        // Local forward is -Z => yaw = atan2(-dx, -dz)
        const moveYaw = Math.atan2(-dx, -dz);
        root.rotation.y = lerpAngle(root.rotation.y, moveYaw, Math.min(1, dt * 11));
      }
    } else {
      // Arrived at destination
      let desiredYaw = finalYawRef.current;
      if (agent.activity === 'desk' && agent.state === 'waiting') {
        desiredYaw += 0.35;
      }
      root.rotation.y = lerpAngle(root.rotation.y, desiredYaw, lerpRate);
    }

    // Periodically share position for follow-camera & live handoff arcs
    reportTimerRef.current += dt;
    if (reportTimerRef.current > 0.25) {
      reportTimerRef.current = 0;
      onPositionReport?.(profile.id, { x: root.position.x, z: root.position.z });
    }

    const standing = moving || !seatedAtEndRef.current;
    const walkCycle = t * 8.2 + seed;

    // Pelvis height (seated on chair cushion vs standing + walk stride bounce)
    if (hipsRef.current) {
      const bounce = moving && !reducedMotion ? Math.abs(Math.sin(walkCycle)) * 0.04 : 0;
      const breath = !moving && !reducedMotion ? Math.sin(t * 2.0 + seed) * 0.006 : 0;
      const targetY = (standing ? 0.72 : 0.49) + bounce + breath;
      hipsRef.current.position.y = THREE.MathUtils.lerp(hipsRef.current.position.y, targetY, lerpRate);
    }

    // Articulated legs (+X rotation swings thigh FORWARD toward -Z!)
    if (leftHipRef.current && rightHipRef.current && leftKneeRef.current && rightKneeRef.current) {
      if (moving) {
        const swing = reducedMotion ? 0 : Math.sin(walkCycle) * 0.54;
        leftHipRef.current.rotation.x = THREE.MathUtils.lerp(leftHipRef.current.rotation.x, swing, 0.36);
        rightHipRef.current.rotation.x = THREE.MathUtils.lerp(rightHipRef.current.rotation.x, -swing, 0.36);
        leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(
          leftKneeRef.current.rotation.x,
          -Math.max(0, -swing) * 0.85 - 0.06,
          0.36
        );
        rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(
          rightKneeRef.current.rotation.x,
          -Math.max(0, swing) * 0.85 - 0.06,
          0.36
        );
      } else if (standing) {
        leftHipRef.current.rotation.x = THREE.MathUtils.lerp(leftHipRef.current.rotation.x, 0, lerpRate);
        rightHipRef.current.rotation.x = THREE.MathUtils.lerp(rightHipRef.current.rotation.x, 0, lerpRate);
        leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, 0, lerpRate);
        rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, 0, lerpRate);
      } else {
        leftHipRef.current.rotation.x = THREE.MathUtils.lerp(leftHipRef.current.rotation.x, Math.PI / 2, lerpRate);
        rightHipRef.current.rotation.x = THREE.MathUtils.lerp(rightHipRef.current.rotation.x, Math.PI / 2, lerpRate);
        leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, -Math.PI / 2, lerpRate);
        rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, -Math.PI / 2, lerpRate);
      }
    }

    // Torso lean
    if (torsoRef.current) {
      const targetLean = moving
        ? -0.07
        : !standing && agent.state === 'working'
          ? -0.11
          : agent.state === 'completed'
            ? 0.04
            : -0.02;
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, targetLean, lerpRate);
    }

    // Head glances (between dual monitors, nodding in meeting, scanning whiteboard)
    if (headRef.current) {
      let hy = 0;
      let hx = 0;
      if (!moving && !reducedMotion) {
        if (agent.activity === 'whiteboard' || agent.activity === 'arch_board' || agent.activity === 'slides_tv') {
          hy = Math.sin(t * 1.9 + seed) * 0.24;
          hx = 0.14;
        } else if (agent.activity === 'boardroom') {
          hy = Math.sin(t * 1.1 + seed) * 0.32;
          hx = Math.sin(t * 2.2 + seed) * 0.06;
        } else if (agent.state === 'working') {
          hy = Math.sin(t * 1.3 + seed) * 0.28;
          hx = -0.1;
        } else if (agent.state === 'error') {
          hy = Math.sin(t * 5) * 0.15;
        } else if (agent.activity === 'lounge' || agent.activity === 'coffee') {
          hy = Math.sin(t * 1.2 + seed) * 0.22;
        }
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, hy, lerpRate);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, hx, lerpRate);
    }

    // Arms & Forearms (+X rotates FORWARD toward -Z!)
    if (leftShoulderRef.current && rightShoulderRef.current && leftForearmRef.current && rightForearmRef.current) {
      if (moving) {
        const armSwing = reducedMotion ? 0 : Math.sin(walkCycle) * 0.44;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -armSwing, 0.35);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          agent.holdingProp !== 'none' ? 0.52 : armSwing,
          0.35
        );
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.25, 0.35);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightForearmRef.current.rotation.x,
          agent.holdingProp !== 'none' ? 0.82 : 0.25,
          0.35
        );
      } else if (
        agent.activity === 'whiteboard' ||
        agent.activity === 'arch_board' ||
        agent.activity === 'slides_tv'
      ) {
        // Pointing at wallboard / diagram!
        const gesture = reducedMotion ? 0 : Math.sin(t * 2.4 + seed) * 0.12;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.4, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          1.25 + gesture,
          lerpRate
        );
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.72, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.38, lerpRate);
      } else if (agent.holdingProp === 'coffee') {
        // Occasional coffee sip!
        const sip = reducedMotion ? 0 : Math.max(0, Math.sin(t * 0.9 + seed)) * 0.42;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.15, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.65 + sip, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.35, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.95 + sip * 0.4, lerpRate);
      } else if (agent.activity === 'boardroom') {
        // Conversational table gestures
        const talk = reducedMotion ? 0 : Math.sin(t * 2.6 + seed) * 0.14;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.5 + talk, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.55 - talk, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.85, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.88, lerpRate);
      } else if (agent.state === 'working' || agent.state === 'planning') {
        // Crisp forward typing over desk keyboard
        const typeL = reducedMotion ? 0 : Math.sin(t * 14 + seed) * 0.1;
        const typeR = reducedMotion ? 0 : Math.sin(t * 14 + seed + 2.3) * 0.1;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.62, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.62, lerpRate);
        leftForearmRef.current.rotation.x = 0.86 + typeL;
        rightForearmRef.current.rotation.x = 0.86 + typeR;
      } else if (agent.state === 'waiting') {
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.32, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.96, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.6, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.68, lerpRate);
      } else if (agent.state === 'error') {
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.9, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.9, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.82, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.82, lerpRate);
      } else {
        // Relaxed on armrests
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.24, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.24, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.85, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.85, lerpRate);
      }
    }

    if (alertPropRef.current && !reducedMotion) {
      alertPropRef.current.rotation.y = t * 1.9;
      alertPropRef.current.position.y = 1.92 + Math.sin(t * 3.5) * 0.04;
    }
  });

  const meta = STATE_META[agent.state];
  const app = profile.appearance;

  const isCheckpointOwner =
    Boolean(checkpoint) &&
    ((checkpoint?.kind === 'scope_question' && profile.id === 'director') ||
      (checkpoint?.kind === 'offer_approval' && (profile.id === 'offers' || profile.id === 'director')));

  const showBubble =
    bubbleMode === 'all' ||
    (bubbleMode === 'smart' &&
      (selected ||
        hovered ||
        isWalking ||
        isCheckpointOwner ||
        agent.state === 'working' ||
        agent.state === 'waiting' ||
        agent.state === 'error' ||
        agent.activity !== 'desk'));

  return (
    <group
      ref={rootRef}
      position={[profile.seatPos.x, 0, profile.seatPos.z]}
      rotation={[0, profile.deskYaw, 0]}
      scale={[app.heightScale, app.heightScale, app.heightScale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(profile.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Crisp Floor Selection / Status Halo */}
      {(selected || hovered || agent.state === 'working' || agent.state === 'waiting') && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, selected ? 0.48 : 0.44, 32]} />
          <meshBasicMaterial
            color={selected ? '#00B0F0' : meta.color}
            transparent
            opacity={selected ? 0.92 : 0.55}
          />
        </mesh>
      )}

      {/* Pelvis / Articulated Body Root */}
      <group ref={hipsRef} position={[0, 0.49, 0]}>
        <mesh position={[0, 0.02, 0]} scale={[1.08, 0.78, 0.82]} castShadow>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color={app.pants} roughness={0.82} />
        </mesh>

        {/* Left Leg */}
        <group ref={leftHipRef} position={[-0.105, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.068, 0.21, 6, 10]} />
            <meshStandardMaterial color={app.pants} roughness={0.82} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.155, 0]} castShadow>
              <capsuleGeometry args={[0.056, 0.21, 6, 10]} />
              <meshStandardMaterial color={app.pants} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.32, -0.04]} castShadow>
              <boxGeometry args={[0.1, 0.065, 0.19]} />
              <meshStandardMaterial color={app.shoes} roughness={0.62} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightHipRef} position={[0.105, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.068, 0.21, 6, 10]} />
            <meshStandardMaterial color={app.pants} roughness={0.82} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.155, 0]} castShadow>
              <capsuleGeometry args={[0.056, 0.21, 6, 10]} />
              <meshStandardMaterial color={app.pants} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.32, -0.04]} castShadow>
              <boxGeometry args={[0.1, 0.065, 0.19]} />
              <meshStandardMaterial color={app.shoes} roughness={0.62} />
            </mesh>
          </group>
        </group>

        {/* Torso + Tailored Blazer + Integra Lanyard Badge + Arms + Head */}
        <group ref={torsoRef} position={[0, 0.05, 0]}>
          {/* Blazer body */}
          <mesh position={[0, 0.28, 0]} scale={[1.15, 1.0, 0.76]} castShadow>
            <capsuleGeometry args={[0.175, 0.27, 8, 14]} />
            <meshStandardMaterial color={app.blazer} roughness={0.68} />
          </mesh>
          {/* Crisp Shirt V-neck */}
          <mesh position={[0, 0.44, -0.122]} rotation={[0.14, 0, 0]}>
            <coneGeometry args={[0.085, 0.19, 4]} />
            <meshStandardMaterial color={app.shirt} roughness={0.5} />
          </mesh>
          {/* Integra Lanyard + Glowing Corporate ID Card */}
          <mesh position={[0, 0.34, -0.138]}>
            <boxGeometry args={[0.055, 0.082, 0.012]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={app.lanyardColor}
              emissiveIntensity={0.28}
            />
          </mesh>
          <mesh position={[0, 0.365, -0.145]}>
            <boxGeometry args={[0.042, 0.02, 0.008]} />
            <meshStandardMaterial color={app.lanyardColor} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.058, 0.068, 0.1, 10]} />
            <meshStandardMaterial color={app.skin} roughness={0.72} />
          </mesh>

          {/* Left Arm */}
          <group ref={leftShoulderRef} position={[-0.24, 0.46, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.052, 0.16, 6, 10]} />
              <meshStandardMaterial color={app.blazer} roughness={0.68} />
            </mesh>
            <group ref={leftForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.044, 0.15, 6, 10]} />
                <meshStandardMaterial color={app.blazer} roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.21, 0]} castShadow>
                <sphereGeometry args={[0.046, 10, 10]} />
                <meshStandardMaterial color={app.skin} roughness={0.72} />
              </mesh>
            </group>
          </group>

          {/* Right Arm + Held Interactive Props (Coffee Mug / BORRADOR Binder / Tablet) */}
          <group ref={rightShoulderRef} position={[0.24, 0.46, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.052, 0.16, 6, 10]} />
              <meshStandardMaterial color={app.blazer} roughness={0.68} />
            </mesh>
            <group ref={rightForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.044, 0.15, 6, 10]} />
                <meshStandardMaterial color={app.blazer} roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.21, 0]} castShadow>
                <sphereGeometry args={[0.046, 10, 10]} />
                <meshStandardMaterial color={app.skin} roughness={0.72} />
              </mesh>

              {/* Held Prop: Integra Coffee Cup */}
              {agent.holdingProp === 'coffee' && (
                <mesh position={[0, -0.24, -0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.042, 0.036, 0.1, 10]} />
                  <meshStandardMaterial color="#0B2A5B" roughness={0.35} />
                </mesh>
              )}

              {/* Held Prop: Golden BORRADOR Proposal Binder */}
              {agent.holdingProp === 'binder' && (
                <group position={[-0.04, -0.24, -0.06]} rotation={[0.4, 0.2, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.22, 0.28, 0.035]} />
                    <meshStandardMaterial color="#D5A13D" roughness={0.45} />
                  </mesh>
                  <mesh position={[0, 0, 0.02]}>
                    <boxGeometry args={[0.16, 0.04, 0.008]} />
                    <meshStandardMaterial color="#FFFFFF" />
                  </mesh>
                </group>
              )}

              {/* Held Prop: Sleek Surface Tablet */}
              {agent.holdingProp === 'tablet' && (
                <group position={[-0.04, -0.23, -0.05]} rotation={[0.6, 0, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.2, 0.26, 0.018]} />
                    <meshStandardMaterial color="#1A2835" roughness={0.35} />
                  </mesh>
                  <mesh position={[0, 0, 0.011]}>
                    <planeGeometry args={[0.17, 0.22]} />
                    <meshStandardMaterial
                      color="#00B0F0"
                      emissive="#00B0F0"
                      emissiveIntensity={0.45}
                    />
                  </mesh>
                </group>
              )}
            </group>
          </group>

          {/* Head + Hair + Facial Features + Glasses / Headset */}
          <group ref={headRef} position={[0, 0.76, 0]}>
            <mesh scale={[0.95, 1.04, 0.96]} castShadow>
              <sphereGeometry args={[0.182, 18, 16]} />
              <meshStandardMaterial color={app.skin} roughness={0.72} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.175, -0.01, 0.01]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color={app.skin} roughness={0.72} />
            </mesh>
            <mesh position={[0.175, -0.01, 0.01]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color={app.skin} roughness={0.72} />
            </mesh>

            <HairSculpt style={app.hairStyle} color={app.hairColor} />

            {/* Eyes & Eyebrows */}
            <mesh position={[-0.058, 0.01, -0.168]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial color="#17222D" roughness={0.25} />
            </mesh>
            <mesh position={[0.058, 0.01, -0.168]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial color="#17222D" roughness={0.25} />
            </mesh>
            <mesh position={[-0.058, 0.045, -0.165]}>
              <boxGeometry args={[0.042, 0.01, 0.01]} />
              <meshStandardMaterial color={app.hairColor} />
            </mesh>
            <mesh position={[0.058, 0.045, -0.165]}>
              <boxGeometry args={[0.042, 0.01, 0.01]} />
              <meshStandardMaterial color={app.hairColor} />
            </mesh>

            {/* Optional Neat Beard */}
            {app.beard && (
              <mesh position={[0, -0.09, -0.11]} scale={[0.95, 0.65, 0.72]}>
                <sphereGeometry args={[0.125, 12, 10]} />
                <meshStandardMaterial color={app.hairColor} roughness={0.9} />
              </mesh>
            )}

            {/* Optional Glasses */}
            {app.glasses && (
              <group position={[0, 0.01, -0.18]}>
                <mesh position={[-0.06, 0, 0]}>
                  <torusGeometry args={[0.038, 0.0065, 8, 16]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.45} roughness={0.35} />
                </mesh>
                <mesh position={[0.06, 0, 0]}>
                  <torusGeometry args={[0.038, 0.0065, 8, 16]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.45} roughness={0.35} />
                </mesh>
                <mesh position={[0, 0.004, 0]}>
                  <boxGeometry args={[0.038, 0.007, 0.007]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.45} roughness={0.35} />
                </mesh>
              </group>
            )}

            {/* Optional CRM Headset */}
            {app.headset && (
              <group>
                <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
                  <torusGeometry args={[0.192, 0.01, 8, 20, Math.PI]} />
                  <meshStandardMaterial color="#1D2A36" metalness={0.4} roughness={0.4} />
                </mesh>
                <mesh position={[0.19, -0.01, -0.02]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.024, 10]} />
                  <meshStandardMaterial color="#00B0F0" />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      {/* Subtle 3D Status Indicator above head when waiting or error */}
      {(agent.state === 'waiting' || agent.state === 'error') && (
        <mesh ref={alertPropRef} position={[0, 1.92, 0]}>
          <octahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial
            color={meta.color}
            emissive={meta.color}
            emissiveIntensity={0.65}
          />
        </mesh>
      )}

      {/* Compact Name Tag always readable on hover/selection, full speech bubble when active */}
      {showBubble ? (
        <Html
          position={[0, isWalking || !seatedAtEndRef.current ? 2.28 : 2.02, 0]}
          center
          zIndexRange={[8, 0]}
        >
          <div
            className={`agent-bubble${selected ? ' is-selected' : ''}`}
            style={{ borderTopColor: meta.color }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(profile.id);
            }}
          >
            <div className="agent-bubble-head">
              <span className="status-dot" style={{ background: meta.color }} aria-hidden="true" />
              <strong>{profile.displayName}</strong>
              <span className="agent-bubble-state">{meta.shortLabel}</span>
            </div>
            <p className="agent-bubble-text">{agent.bubbleText}</p>
          </div>
        </Html>
      ) : (
        <Html position={[0, 1.78, 0]} center zIndexRange={[4, 0]}>
          <button
            type="button"
            className="agent-mini-tag"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(profile.id);
            }}
          >
            <span className="status-dot" style={{ background: meta.color }} aria-hidden="true" />
            <span>{profile.name}</span>
          </button>
        </Html>
      )}
    </group>
  );
}
