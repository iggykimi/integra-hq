import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChatCircleDots,
  CheckCircle,
  Coffee,
  Desktop,
  GearSix,
  PhoneCall,
  Sun,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AgentId } from '@contracts/types';
import {
  type AgentActivity,
  type AgentVisualProfile,
  buildAgentRoute,
  DESK_SEAT_HEIGHT,
  type HairStyle,
  STATE_META,
  type Vec2,
} from '../state/officeLayout';
import type { AgentRuntimeState, PendingCheckpoint } from '../state/officeReducer';
import type { AmbientAgentOverride } from '../state/useOfficeLifeSim';

export type BubbleVisibilityMode = 'smart' | 'all' | 'none';

interface SpecialistAgentProps {
  profile: AgentVisualProfile;
  agent: AgentRuntimeState;
  ambient?: AmbientAgentOverride;
  selected: boolean;
  isWideView?: boolean;
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

function sculptFace() {
  const geometry = new THREE.SphereGeometry(1, 48, 32);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i += 1) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);
    const front = Math.max(0, -z);
    const jaw = 1 - 0.23 * Math.max(0, -y);
    const nose = 0.033 * front * Math.exp(-((x / 0.17) ** 2 + ((y + 0.08) / 0.27) ** 2));
    points.setXYZ(i, x * 0.167 * jaw, y * 0.194, z * 0.172 - nose);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const faceGeometry = sculptFace();

/**
 * Multi-layered architectural stylized hair sculpting tailored per specialist.
 */
function HairSculpt({ style, color }: { style: HairStyle; color: string }) {
  return (
    <group>
      {/* Sculpted crown cap */}
      <mesh position={[0, 0.056, 0.018]} scale={[1.05, 0.94, 1.06]} castShadow>
        <sphereGeometry args={[0.188, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>

      {style === 'sidepart' && (
        <>
          <mesh position={[-0.04, 0.145, -0.105]} rotation={[0.25, 0.22, -0.25]} castShadow>
            <capsuleGeometry args={[0.044, 0.14, 8, 12]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
          <mesh position={[0.075, 0.132, -0.095]} rotation={[0.18, -0.2, 0.3]} castShadow>
            <capsuleGeometry args={[0.036, 0.1, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
          <mesh position={[0, 0.012, 0.132]} scale={[1.03, 0.84, 0.62]} castShadow>
            <sphereGeometry args={[0.165, 14, 12]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </>
      )}

      {style === 'bob' && (
        <>
          {/* Layered sculpted modern bob with swept fringe */}
          <mesh position={[-0.165, -0.04, 0.025]} rotation={[0, 0, 0.08]} scale={[0.58, 1.18, 0.92]} castShadow>
            <capsuleGeometry args={[0.078, 0.17, 8, 12]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
          <mesh position={[0.165, -0.04, 0.025]} rotation={[0, 0, -0.08]} scale={[0.58, 1.18, 0.92]} castShadow>
            <capsuleGeometry args={[0.078, 0.17, 8, 12]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
          <mesh position={[-0.058, 0.121, -0.122]} rotation={[0.22, 0.18, -0.77]} scale={[0.74, 1, 0.66]} castShadow>
            <capsuleGeometry args={[0.052, 0.13, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.76} />
          </mesh>
          <mesh position={[0, -0.055, 0.132]} scale={[1.1, 1.16, 0.58]} castShadow>
            <sphereGeometry args={[0.172, 16, 12]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
        </>
      )}

      {style === 'ponytail' && (
        <>
          <mesh position={[-0.08, 0.125, -0.105]} rotation={[0.25, 0.2, -0.32]} castShadow>
            <capsuleGeometry args={[0.036, 0.1, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.02, 0.145]} scale={[0.98, 0.88, 0.6]} castShadow>
            <sphereGeometry args={[0.162, 14, 12]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          {/* Subtle Integra cyan hair tie */}
          <mesh position={[0, 0.04, 0.215]} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[0.046, 0.012, 8, 14]} />
            <meshStandardMaterial color="#00B0F0" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.07, 0.255]} rotation={[0.32, 0, 0]} castShadow>
            <capsuleGeometry args={[0.056, 0.2, 8, 12]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
        </>
      )}

      {style === 'bun' && (
        <>
          <mesh position={[-0.14, 0.01, -0.06]} rotation={[0.15, 0, 0.2]} castShadow>
            <capsuleGeometry args={[0.028, 0.09, 6, 8]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0.14, 0.01, -0.06]} rotation={[0.15, 0, -0.2]} castShadow>
            <capsuleGeometry args={[0.028, 0.09, 6, 8]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.03, 0.13]} scale={[0.98, 0.85, 0.6]} castShadow>
            <sphereGeometry args={[0.16, 14, 12]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.155, 0.175]} castShadow>
            <sphereGeometry args={[0.092, 14, 14]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
        </>
      )}

      {style === 'curly' && (
        <>
          {[
            [-0.1, 0.165, -0.045],
            [0.01, 0.195, -0.02],
            [0.11, 0.155, -0.04],
            [-0.135, 0.105, 0.07],
            [0.135, 0.105, 0.07],
            [0, 0.145, 0.125],
            [-0.06, 0.16, 0.08],
            [0.07, 0.15, 0.08],
          ].map(([cx, cy, cz], idx) => (
            <mesh key={idx} position={[cx, cy, cz]} castShadow>
              <dodecahedronGeometry args={[0.074, 1]} />
              <meshStandardMaterial color={color} roughness={0.86} />
            </mesh>
          ))}
        </>
      )}

      {style === 'fade' && (
        <>
          <mesh position={[0, 0.138, -0.01]} scale={[0.94, 0.48, 0.94]} castShadow>
            <cylinderGeometry args={[0.168, 0.178, 0.125, 16]} />
            <meshStandardMaterial color={color} roughness={0.84} />
          </mesh>
          <mesh position={[0, 0.172, -0.06]} rotation={[0.15, 0, 0]} scale={[1.0, 0.55, 0.72]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={color} roughness={0.84} />
          </mesh>
        </>
      )}

      {style === 'short' && (
        <>
          <mesh position={[0, 0.04, 0.12]} scale={[1.0, 0.84, 0.64]} castShadow>
            <sphereGeometry args={[0.165, 14, 12]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0.04, 0.14, -0.11]} rotation={[0.2, -0.15, 0.25]} castShadow>
            <capsuleGeometry args={[0.036, 0.12, 6, 10]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function SpecialistAgent({
  profile,
  agent,
  ambient,
  selected,
  isWideView = false,
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
  const leftEyeGroupRef = useRef<THREE.Group>(null);
  const rightEyeGroupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const alertPropRef = useRef<THREE.Mesh>(null);
  const mugRef = useRef<THREE.Group>(null);
  const mugAngles = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const mugWorldRotation = useRef(new THREE.Quaternion());

  // Effective activity merges real workflow state (always primary!) with idle ambient sim
  const isAmbientActive =
    Boolean(ambient) &&
    (agent.state === 'idle' || agent.state === 'completed') &&
    agent.activity === 'desk';

  const effectiveActivity: AgentActivity = isAmbientActive && ambient ? ambient.activity : agent.activity;
  const effectiveProp = isAmbientActive && ambient ? ambient.holdingProp : agent.holdingProp;
  const effectiveBubbleText = isAmbientActive && ambient ? ambient.bubbleText : agent.bubbleText;
  const poseHint = isAmbientActive && ambient ? ambient.poseHint : 'normal';

  const routeRef = useRef<Vec2[]>([]);
  const routeIdxRef = useRef<number>(0);
  const finalYawRef = useRef<number>(profile.deskYaw);
  const seatHeightRef = useRef<number | undefined>(DESK_SEAT_HEIGHT);
  const lastActivityRef = useRef<AgentActivity>('desk');
  const strideDistanceRef = useRef(0);
  const [isWalking, setIsWalking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reportTimerRef = useRef(0);

  // Recompute collision-free corridor route whenever effective target activity changes
  useEffect(() => {
    if (lastActivityRef.current === effectiveActivity && (!reducedMotion || routeRef.current.length === 0)) return;
    lastActivityRef.current = effectiveActivity;
    const root = rootRef.current;
    const currentPos: Vec2 = root
      ? { x: root.position.x, z: root.position.z }
      : { ...profile.seatPos };

    const plan = buildAgentRoute(profile, currentPos, effectiveActivity);
    routeRef.current = plan.waypoints;
    routeIdxRef.current = 0;
    finalYawRef.current = plan.finalYaw;
    seatHeightRef.current = plan.seatHeight;

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
  }, [effectiveActivity, profile, reducedMotion, onPositionReport]);

  useFrame(({ clock }, delta) => {
    const root = rootRef.current;
    if (!root) return;

    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const dt = Math.min(delta, 0.12);
    const lerpRate = reducedMotion ? 1 : 1 - Math.exp(-dt * 8.5);
    const seed = profile.boardroomSeatIndex * 1.37 + profile.deskPos.x * 0.21;

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
        strideDistanceRef.current += step;
        const moveYaw = Math.atan2(-dx, -dz);
        root.rotation.y = lerpAngle(root.rotation.y, moveYaw, Math.min(1, dt * 11));
      }
    } else {
      let desiredYaw = finalYawRef.current;
      if (effectiveActivity === 'desk' && agent.state === 'waiting') {
        desiredYaw += 0.35;
      }
      root.rotation.y = lerpAngle(root.rotation.y, desiredYaw, lerpRate);
    }

    reportTimerRef.current += dt;
    if (reportTimerRef.current > 0.25) {
      reportTimerRef.current = 0;
      onPositionReport?.(profile.id, { x: root.position.x, z: root.position.z });
    }

    const seatHeight = moving ? undefined : seatHeightRef.current;
    const standing = seatHeight === undefined;
    const walkCycle = strideDistanceRef.current / (1.12 * profile.appearance.heightScale) * Math.PI * 2 + seed;
    const loungeTalk = poseHint === 'chat' && !moving && !reducedMotion &&
      (t + (effectiveActivity === 'lounge_chair' ? 2.5 : 0)) % 5 < 2.15;
    const sipPhase = (t + Math.abs(seed)) % 7.4;
    const sip = effectiveProp === 'coffee' && !moving && !reducedMotion && !loungeTalk
      ? THREE.MathUtils.smoothstep(sipPhase, 4.65, 5.15) * (1 - THREE.MathUtils.smoothstep(sipPhase, 5.55, 6.2))
      : 0;

    // Natural eye blink every ~3.8s
    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      const blinkCycle = (t + Math.abs(seed)) % 4.1;
      const blinkScale = !reducedMotion && blinkCycle > 3.96 ? 0.12 : 1.0;
      leftEyeGroupRef.current.scale.y = blinkScale;
      rightEyeGroupRef.current.scale.y = blinkScale;
    }

    // Small mouth movement during conversations and calls.
    if (mouthRef.current) {
      const speaking =
        !reducedMotion &&
        !moving &&
        ((effectiveActivity === 'boardroom' && agent.state === 'collaborating') ||
          effectiveActivity === 'phone_booth' ||
          loungeTalk ||
          poseHint === 'call');
      mouthRef.current.scale.y = speaking ? 0.24 + Math.abs(Math.sin(t * 5 + seed)) * 0.2 : 0.24;
    }

    // The cushion supports the pelvis; the thigh angle keeps the soles on the floor.
    const hipHeight = seatHeight === undefined ? 0.72 : seatHeight / profile.appearance.heightScale + 0.09;
    if (hipsRef.current) {
      const bounce = moving && !reducedMotion ? Math.abs(Math.sin(walkCycle)) * 0.04 : 0;
      hipsRef.current.position.y = THREE.MathUtils.lerp(hipsRef.current.position.y, hipHeight + bounce, lerpRate);
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
        const thigh = Math.acos(THREE.MathUtils.clamp((hipHeight - 0.356) / 0.32, 0, 1));
        leftHipRef.current.rotation.x = THREE.MathUtils.lerp(leftHipRef.current.rotation.x, thigh, lerpRate);
        rightHipRef.current.rotation.x = THREE.MathUtils.lerp(rightHipRef.current.rotation.x, thigh, lerpRate);
        leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, -thigh, lerpRate);
        rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, -thigh, lerpRate);
      }
    }

    // Torso lean & stretch
    if (torsoRef.current) {
      const targetLean = moving
        ? -0.07
        : poseHint === 'stretch'
          ? 0.08
          : !standing && agent.state === 'working'
            ? -0.11
            : agent.state === 'completed'
              ? 0.04
              : -0.02;
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, targetLean, lerpRate);
    }

    // Head glances
    if (headRef.current) {
      let hy = 0;
      let hx = 0;
      if (!moving && !reducedMotion) {
        if (
          effectiveActivity === 'whiteboard' ||
          effectiveActivity === 'arch_board' ||
          effectiveActivity === 'slides_tv'
        ) {
          hy = Math.sin(t * 1.9 + seed) * 0.24;
          hx = 0.14;
        } else if (poseHint === 'chat') {
          hy = Math.sin(t * 0.8 + seed) * 0.08;
          hx = Math.sin(t * 2.6 + seed) * (loungeTalk ? 0.055 : 0.025);
        } else if (effectiveActivity === 'boardroom') {
          hy = Math.sin(t * 1.2 + seed) * 0.3;
          hx = Math.sin(t * 2.4 + seed) * 0.07;
        } else if (effectiveActivity === 'terrace') {
          hy = Math.sin(t * 0.7 + seed) * 0.38;
          hx = 0.06;
        } else if (effectiveActivity === 'phone_booth' || poseHint === 'call') {
          hy = Math.sin(t * 1.6 + seed) * 0.14;
          hx = Math.sin(t * 2.8 + seed) * 0.08;
        } else if (effectiveActivity === 'academy' || effectiveActivity === 'auditorium') {
          hy = Math.sin(t * 0.9 + seed) * 0.22;
          hx = 0.09;
        } else if (effectiveActivity === 'retro_pc') {
          hy = Math.sin(t * 1.1 + seed) * 0.16;
          hx = -0.14;
        } else if (agent.state === 'working') {
          hy = Math.sin(t * 1.3 + seed) * 0.28;
          hx = -0.1;
        } else if (agent.state === 'error') {
          hy = Math.sin(t * 5) * 0.15;
        } else {
          // Gentle seated idle curiosity glances
          hy = Math.sin(t * 0.55 + seed) * 0.18;
        }
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, hy, lerpRate);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, hx + sip * 0.08, lerpRate);
    }

    // Arms & Forearms (+X rotates FORWARD toward -Z!)
    if (leftShoulderRef.current && rightShoulderRef.current && leftForearmRef.current && rightForearmRef.current) {
      if (moving) {
        const armSwing = reducedMotion ? 0 : Math.sin(walkCycle) * 0.44;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -armSwing, 0.35);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          effectiveProp !== 'none' ? 0.54 : armSwing,
          0.35
        );
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, 0.06, lerpRate);
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, -0.06, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.26, 0.35);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightForearmRef.current.rotation.x,
          effectiveProp !== 'none' ? 0.85 : 0.26,
          0.35
        );
      } else if (poseHint === 'call' || effectiveActivity === 'phone_booth') {
        // Private call inside Acoustic Phone Booth: right hand raised holding phone to ear
        const talkGesture = reducedMotion ? 0 : Math.sin(t * 2.4 + seed) * 0.16;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.38 + talkGesture, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 1.38, lerpRate);
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, 0.1, lerpRate);
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, 0.14, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.74, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 1.48, lerpRate);
      } else if (poseHint === 'stretch') {
        // Relaxed shoulder stretch looking out the DAT Alierta panoramic window!
        const lift = reducedMotion ? 0.6 : 0.45 + Math.max(0, Math.sin(t * 0.8 + seed)) * 1.4;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, lift, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.68, lerpRate);
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, 0.28, lerpRate);
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, -0.1, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.35, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.92, lerpRate);
      } else if (poseHint === 'admire') {
        // Thoughtful chin-pose inspecting 1986 Retro PC or Vertical Garden
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.2, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.88, lerpRate);
        leftShoulderRef.current.rotation.z = 0.06;
        rightShoulderRef.current.rotation.z = 0.14;
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.45, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 1.38, lerpRate);
      } else if (
        effectiveActivity === 'whiteboard' ||
        effectiveActivity === 'arch_board' ||
        effectiveActivity === 'slides_tv'
      ) {
        const gesture = reducedMotion ? 0 : Math.sin(t * 2.4 + seed) * 0.12;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.4, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          1.25 + gesture,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = 0.06;
        rightShoulderRef.current.rotation.z = -0.1;
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.72, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.38, lerpRate);
      } else if (effectiveProp === 'coffee') {
        const talkGesture = loungeTalk ? 0.13 * (1 + Math.sin(t * 3.2 + seed)) : 0;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.35 + talkGesture, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.65 + sip * 0.41, lerpRate);
        leftShoulderRef.current.rotation.z = 0.08;
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, -0.06 - sip * 0.52, lerpRate);
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.7 + talkGesture, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.95 + sip * 0.7, lerpRate);
      } else if (effectiveActivity === 'boardroom') {
        const talk = reducedMotion ? 0 : Math.sin(t * 2.6 + seed) * 0.14;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.5 + talk, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.55 - talk, lerpRate);
        leftShoulderRef.current.rotation.z = 0.06;
        rightShoulderRef.current.rotation.z = -0.06;
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.85, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.88, lerpRate);
      } else if (agent.state === 'working' || agent.state === 'planning') {
        const typeL = reducedMotion ? 0 : Math.sin(t * 14 + seed) * 0.1;
        const typeR = reducedMotion ? 0 : Math.sin(t * 14 + seed + 2.3) * 0.1;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.62, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.62, lerpRate);
        leftShoulderRef.current.rotation.z = -0.08;
        rightShoulderRef.current.rotation.z = 0.08;
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
        // Seated relaxed idle micro-habits (occasional gentle hand check)
        const fidget = !reducedMotion && Math.sin(t * 0.6 + seed) > 0.82 ? 0.25 : 0;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.24, lerpRate);
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.24 + fidget, lerpRate);
        leftShoulderRef.current.rotation.z = 0.06;
        rightShoulderRef.current.rotation.z = -0.06;
        leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(leftForearmRef.current.rotation.x, 0.85, lerpRate);
        rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(rightForearmRef.current.rotation.x, 0.85 + fidget, lerpRate);
      }
    }

    if (mugRef.current && rightForearmRef.current) {
      const mug = mugRef.current;
      const angles = mugAngles.current.set(sip * 0.22, root.rotation.y, 0);
      rightForearmRef.current.getWorldQuaternion(mug.quaternion).invert();
      mug.quaternion.multiply(mugWorldRotation.current.setFromEuler(angles));
    }

    if (alertPropRef.current && !reducedMotion) {
      alertPropRef.current.rotation.y = t * 1.9;
      alertPropRef.current.position.y = 1.92 + Math.sin(t * 3.5) * 0.04;
    }
  });

  const meta = STATE_META[agent.state];
  const app = profile.appearance;

  const isCheckpointOwner =
    profile.id === 'director' || (checkpoint?.kind === 'offer_approval' && profile.id === 'offers');

  const hasRichActivity =
    !isAmbientActive &&
    (isWalking ||
      agent.state === 'working' ||
      agent.state === 'planning' ||
      agent.state === 'collaborating' ||
      agent.state === 'waiting' ||
      agent.state === 'error' ||
      effectiveActivity !== 'desk');

  const showLabel = checkpoint ? isCheckpointOwner : !isWideView || hasRichActivity || hovered || selected || bubbleMode !== 'smart';

  const showFullBubble = !checkpoint && (bubbleMode === 'all' || (bubbleMode === 'smart' && (selected || hovered)));

  // In wide views (Oficina / Campus), show crisp iconic Sims/Two Point Campus pills
  // instead of overlapping 224px cards; clicking or hovering expands immediately!
  const showIconPill =
    !showFullBubble && bubbleMode === 'smart' && (checkpoint || hasRichActivity);

  const shortFirstName = profile.displayName.split('·')[0].trim();

  const renderActivityIcon = () => {
    const size = 14;
    if (agent.state === 'error' || agent.state === 'waiting') {
      return <WarningCircle size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'terrace') {
      return <Sun size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'phone_booth' || poseHint === 'call') {
      return <PhoneCall size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'lounge_sofa' || effectiveActivity === 'lounge_chair' || poseHint === 'chat') {
      return <ChatCircleDots size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'coffee' || effectiveProp === 'coffee') {
      return <Coffee size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'academy' || effectiveActivity === 'auditorium') {
      return <BookOpen size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'retro_pc') {
      return <Desktop size={size} weight="fill" aria-hidden="true" />;
    }
    if (effectiveActivity === 'boardroom' || agent.state === 'collaborating') {
      return <UsersThree size={size} weight="fill" aria-hidden="true" />;
    }
    if (agent.state === 'completed') {
      return <CheckCircle size={size} weight="fill" aria-hidden="true" />;
    }
    return <GearSix size={size} weight="fill" aria-hidden="true" />;
  };

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
      {/* Floor Selection / Active Status Ring */}
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
        {/* Sculpted hips + tailored leather belt with metallic buckle */}
        <mesh position={[0, 0.015, 0]} scale={[1.08, 0.78, 0.82]} castShadow>
          <sphereGeometry args={[0.16, 14, 10]} />
          <meshStandardMaterial color={app.pants} roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.085, 0]} scale={[1.06, 1, 0.8]}>
          <cylinderGeometry args={[0.155, 0.16, 0.036, 16]} />
          <meshStandardMaterial color="#231D1A" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.085, -0.126]}>
          <boxGeometry args={[0.042, 0.032, 0.012]} />
          <meshStandardMaterial color="#CBD5DE" metalness={0.75} roughness={0.25} />
        </mesh>

        {/* Left Tailored Leg + Sculpted Loafer/Sneaker */}
        <group ref={leftHipRef} position={[-0.102, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.066, 0.21, 6, 12]} />
            <meshStandardMaterial color={app.pants} roughness={0.82} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.155, 0]} castShadow>
              <capsuleGeometry args={[0.054, 0.21, 6, 12]} />
              <meshStandardMaterial color={app.pants} roughness={0.82} />
            </mesh>
            {/* Sculpted shoe + light sneaker/loafer sole */}
            <mesh position={[0, -0.312, -0.035]} scale={[0.92, 0.72, 1.55]} castShadow>
              <sphereGeometry args={[0.062, 10, 8]} />
              <meshStandardMaterial color={app.shoes} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.342, -0.035]}>
              <boxGeometry args={[0.095, 0.018, 0.185]} />
              <meshStandardMaterial color="#E6EAEE" roughness={0.75} />
            </mesh>
          </group>
        </group>

        {/* Right Tailored Leg + Sculpted Loafer/Sneaker */}
        <group ref={rightHipRef} position={[0.102, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.066, 0.21, 6, 12]} />
            <meshStandardMaterial color={app.pants} roughness={0.82} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.155, 0]} castShadow>
              <capsuleGeometry args={[0.054, 0.21, 6, 12]} />
              <meshStandardMaterial color={app.pants} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.312, -0.035]} scale={[0.92, 0.72, 1.55]} castShadow>
              <sphereGeometry args={[0.062, 10, 8]} />
              <meshStandardMaterial color={app.shoes} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.342, -0.035]}>
              <boxGeometry args={[0.095, 0.018, 0.185]} />
              <meshStandardMaterial color="#E6EAEE" roughness={0.75} />
            </mesh>
          </group>
        </group>

        {/* Sculpted Upper Torso + Layered Tailored Blazer + Lapels + Shirt + Accessories */}
        <group ref={torsoRef} position={[0, 0.06, 0]}>
          {/* Tapered tailored torso core */}
          <mesh position={[0, 0.26, 0]} scale={[1.18, 1.0, 0.76]} castShadow>
            <cylinderGeometry args={[0.182, 0.145, 0.44, 16]} />
            <meshStandardMaterial color={app.blazer} roughness={0.66} />
          </mesh>
          {/* Rounded architectural shoulder yoke */}
          <mesh position={[0, 0.46, 0]} scale={[1.38, 0.52, 0.8]} castShadow>
            <sphereGeometry args={[0.165, 16, 12]} />
            <meshStandardMaterial color={app.blazer} roughness={0.66} />
          </mesh>
          {/* Blazer lower skirt hem */}
          <mesh position={[0, 0.055, 0]} scale={[1.12, 1, 0.78]} castShadow>
            <cylinderGeometry args={[0.15, 0.165, 0.12, 16]} />
            <meshStandardMaterial color={app.blazer} roughness={0.66} />
          </mesh>

          {/* Crisp Shirt Front + Sculpted Blazer Lapels */}
          <mesh position={[0, 0.34, -0.124]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[0.11, 0.32, 0.024]} />
            <meshStandardMaterial color={app.shirt} roughness={0.48} />
          </mesh>
          {/* Left & right angled blazer lapels */}
          <mesh position={[-0.065, 0.37, -0.132]} rotation={[0.06, 0.12, -0.22]} castShadow>
            <boxGeometry args={[0.055, 0.24, 0.022]} />
            <meshStandardMaterial color={app.blazer} roughness={0.62} />
          </mesh>
          <mesh position={[0.065, 0.37, -0.132]} rotation={[0.06, -0.12, 0.22]} castShadow>
            <boxGeometry args={[0.055, 0.24, 0.022]} />
            <meshStandardMaterial color={app.blazer} roughness={0.62} />
          </mesh>

          {/* Role-distinct neckwear: tie for Offers, Integra scarf accent for Director/Designer */}
          {profile.id === 'offers' && (
            <mesh position={[0, 0.33, -0.138]}>
              <boxGeometry args={[0.032, 0.22, 0.01]} />
              <meshStandardMaterial color="#00B0F0" roughness={0.45} />
            </mesh>
          )}
          {(profile.id === 'director' || profile.id === 'designer') && (
            <mesh position={[0, 0.546, -0.008]} rotation={[1.44, 0, 0.16]} castShadow>
              <torusGeometry args={[0.062, 0.016, 10, 24]} />
              <meshStandardMaterial
                color={profile.id === 'director' ? '#5FB3BC' : '#B64E72'}
                roughness={0.82}
              />
            </mesh>
          )}

          {/* Integra Lanyard Strap + Corporate ID Badge */}
          <mesh position={[0.065, 0.24, -0.136]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.056, 0.082, 0.012]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={app.lanyardColor}
              emissiveIntensity={0.28}
            />
          </mesh>
          <mesh position={[0.065, 0.266, -0.143]}>
            <boxGeometry args={[0.044, 0.02, 0.008]} />
            <meshStandardMaterial color={app.lanyardColor} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.565, 0]} castShadow>
            <cylinderGeometry args={[0.056, 0.066, 0.11, 12]} />
            <meshStandardMaterial color={app.skin} roughness={0.7} />
          </mesh>

          {/* Left Arm + Shirt Cuff + Watch + Sculpted Hand */}
          <group ref={leftShoulderRef} position={[-0.245, 0.455, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.054, 0.16, 6, 12]} />
              <meshStandardMaterial color={app.blazer} roughness={0.66} />
            </mesh>
            <group ref={leftForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.095, 0]} castShadow>
                <capsuleGeometry args={[0.045, 0.145, 6, 12]} />
                <meshStandardMaterial color={app.blazer} roughness={0.66} />
              </mesh>
              {/* Crisp shirt cuff */}
              <mesh position={[0, -0.175, 0]}>
                <cylinderGeometry args={[0.044, 0.042, 0.026, 10]} />
                <meshStandardMaterial color={app.shirt} roughness={0.5} />
              </mesh>
              {/* Smartwatch / Wristwatch */}
              <mesh position={[0, -0.192, -0.02]}>
                <boxGeometry args={[0.036, 0.024, 0.046]} />
                <meshStandardMaterial
                  color="#1B2834"
                  emissive={profile.id === 'architect' ? '#00B0F0' : '#000000'}
                  emissiveIntensity={profile.id === 'architect' ? 0.65 : 0}
                />
              </mesh>
              <mesh position={[0, -0.222, 0]} scale={[0.92, 1.05, 0.88]} castShadow>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color={app.skin} roughness={0.7} />
              </mesh>
            </group>
          </group>

          {/* Right Arm + Shirt Cuff + Held Interactive Props */}
          <group ref={rightShoulderRef} position={[0.245, 0.455, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.054, 0.16, 6, 12]} />
              <meshStandardMaterial color={app.blazer} roughness={0.66} />
            </mesh>
            <group ref={rightForearmRef} position={[0, -0.22, 0]}>
              <mesh position={[0, -0.095, 0]} castShadow>
                <capsuleGeometry args={[0.045, 0.145, 6, 12]} />
                <meshStandardMaterial color={app.blazer} roughness={0.66} />
              </mesh>
              <mesh position={[0, -0.175, 0]}>
                <cylinderGeometry args={[0.044, 0.042, 0.026, 10]} />
                <meshStandardMaterial color={app.shirt} roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.222, 0]} scale={[0.92, 1.05, 0.88]} castShadow>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color={app.skin} roughness={0.7} />
              </mesh>

              {/* Held Prop: Integra Navy Coffee Cup */}
              {effectiveProp === 'coffee' && (
                <group ref={mugRef} position={[-0.035, -0.245, -0.045]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.044, 0.036, 0.09, 20]} />
                    <meshStandardMaterial color="#0B2A5B" roughness={0.34} />
                  </mesh>
                  <mesh position={[0, 0.046, 0]}>
                    <cylinderGeometry args={[0.038, 0.038, 0.004, 20]} />
                    <meshStandardMaterial color="#593824" roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.046, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.042, 0.004, 6, 20]} />
                    <meshStandardMaterial color="#EEF2EC" roughness={0.33} />
                  </mesh>
                  <mesh position={[0.046, -0.003, 0]}>
                    <torusGeometry args={[0.022, 0.006, 6, 14]} />
                    <meshStandardMaterial color="#0B2A5B" roughness={0.34} />
                  </mesh>
                </group>
              )}

              {/* Held Prop: Golden BORRADOR Proposal Binder */}
              {effectiveProp === 'binder' && (
                <group position={[-0.04, -0.25, -0.06]} rotation={[0.4, 0.2, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.23, 0.29, 0.036]} />
                    <meshStandardMaterial color="#D5A13D" roughness={0.44} />
                  </mesh>
                  <mesh position={[0, 0, 0.021]}>
                    <boxGeometry args={[0.16, 0.042, 0.008]} />
                    <meshStandardMaterial color="#FFFFFF" />
                  </mesh>
                </group>
              )}

              {/* Held Prop: Matte smartphone during Acoustic Phone Booth calls */}
              {(poseHint === 'call' || effectiveActivity === 'phone_booth') && effectiveProp === 'none' && (
                <mesh position={[0.01, -0.23, -0.05]} rotation={[0.25, 0.2, 0]}>
                  <boxGeometry args={[0.055, 0.11, 0.012]} />
                  <meshStandardMaterial color="#182633" roughness={0.35} />
                </mesh>
              )}

              {/* Held Prop: Sleek Surface Tablet */}
              {effectiveProp === 'tablet' && (
                <group position={[-0.04, -0.24, -0.055]} rotation={[0.6, 0, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.21, 0.27, 0.018]} />
                    <meshStandardMaterial color="#1A2835" roughness={0.35} />
                  </mesh>
                  <mesh position={[0, 0, 0.011]}>
                    <planeGeometry args={[0.18, 0.23]} />
                    <meshStandardMaterial
                      color="#00B0F0"
                      emissive="#00B0F0"
                      emissiveIntensity={0.48}
                    />
                  </mesh>
                </group>
              )}
            </group>
          </group>

          {/* Sculpted Expressive Head + Blinking Eyes + Smile + Hair + Accessories */}
          <group ref={headRef} position={[0, 0.75, 0]}>
            <mesh geometry={faceGeometry} castShadow>
              <meshStandardMaterial color={app.skin} roughness={0.82} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.174, -0.01, 0.012]}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial color={app.skin} roughness={0.7} />
            </mesh>
            <mesh position={[0.174, -0.01, 0.012]}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial color={app.skin} roughness={0.7} />
            </mesh>

            <HairSculpt style={app.hairStyle} color={app.hairColor} />

            {/* Expressive Eyes (Sclera + Dark Iris + Specular Catchlight + Blink) */}
            <group ref={leftEyeGroupRef} position={[-0.058, 0.014, -0.166]}>
              <mesh scale={[1.13, 0.73, 0.53]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial color="#F5EDE3" roughness={0.36} />
              </mesh>
              <mesh position={[0, 0, -0.009]}>
                <sphereGeometry args={[0.011, 12, 10]} />
                <meshStandardMaterial color="#18222E" roughness={0.18} />
              </mesh>
              <mesh position={[-0.005, 0.005, -0.021]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
            <group ref={rightEyeGroupRef} position={[0.058, 0.014, -0.166]}>
              <mesh scale={[1.13, 0.73, 0.53]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial color="#F5EDE3" roughness={0.36} />
              </mesh>
              <mesh position={[0, 0, -0.009]}>
                <sphereGeometry args={[0.011, 12, 10]} />
                <meshStandardMaterial color="#18222E" roughness={0.18} />
              </mesh>
              <mesh position={[-0.005, 0.005, -0.021]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>

            {/* Expressive Eyebrows */}
            <mesh
              position={[-0.058, 0.052, -0.164]}
              rotation={[0, 0, agent.state === 'error' ? -0.22 : 0.08]}
            >
              <boxGeometry args={[0.044, 0.011, 0.011]} />
              <meshStandardMaterial color={app.hairColor} />
            </mesh>
            <mesh
              position={[0.058, 0.052, -0.164]}
              rotation={[0, 0, agent.state === 'error' ? 0.22 : -0.08]}
            >
              <boxGeometry args={[0.044, 0.011, 0.011]} />
              <meshStandardMaterial color={app.hairColor} />
            </mesh>

            {/* Expressive Animated Mouth / Smile */}
            <mesh
              ref={mouthRef}
              position={[0, -0.062, -0.166]}
              scale={[1, 0.24, 0.42]}
            >
              <sphereGeometry args={[0.024, 16, 12]} />
              <meshStandardMaterial color="#935852" roughness={0.76} />
            </mesh>

            {/* Optional Neat Beard */}
            {app.beard && (
              <mesh position={[0, -0.092, -0.108]} scale={[0.96, 0.64, 0.72]}>
                <sphereGeometry args={[0.125, 12, 10]} />
                <meshStandardMaterial color={app.hairColor} roughness={0.9} />
              </mesh>
            )}

            {/* Optional Glasses with Subtle Bridge & Ear Stems */}
            {app.glasses && (
              <group position={[0, 0.014, -0.182]}>
                <mesh position={[-0.06, 0, 0]}>
                  <torusGeometry args={[0.039, 0.0065, 8, 18]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.5} roughness={0.32} />
                </mesh>
                <mesh position={[0.06, 0, 0]}>
                  <torusGeometry args={[0.039, 0.0065, 8, 18]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.5} roughness={0.32} />
                </mesh>
                <mesh position={[0, 0.004, 0]}>
                  <boxGeometry args={[0.038, 0.007, 0.007]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.5} roughness={0.32} />
                </mesh>
                {/* Glasses ear stems */}
                <mesh position={[-0.102, 0.004, 0.085]} rotation={[0, -0.22, 0]}>
                  <boxGeometry args={[0.006, 0.007, 0.16]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.5} roughness={0.32} />
                </mesh>
                <mesh position={[0.102, 0.004, 0.085]} rotation={[0, 0.22, 0]}>
                  <boxGeometry args={[0.006, 0.007, 0.16]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.5} roughness={0.32} />
                </mesh>
              </group>
            )}

            {/* Optional CRM Headset with Mic Boom */}
            {app.headset && (
              <group>
                <mesh position={[0, 0.055, 0]}>
                  <torusGeometry args={[0.194, 0.01, 8, 22, Math.PI]} />
                  <meshStandardMaterial color="#1D2A36" metalness={0.45} roughness={0.38} />
                </mesh>
                <mesh position={[0.192, -0.01, -0.015]}>
                  <cylinderGeometry args={[0.036, 0.036, 0.024, 12]} />
                  <meshStandardMaterial color="#00B0F0" />
                </mesh>
                <mesh position={[0.13, -0.055, -0.115]} rotation={[0.2, 0.55, 0.25]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
                  <meshStandardMaterial color="#1D2A36" />
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

      {/* 3D In-World Speech Bubble / Iconic Badge (cleans wide views; expands on select/hover/zoom) */}
      {showLabel && (showFullBubble ? (
        <Html
          position={[0, isWalking || seatHeightRef.current === undefined ? 2.28 : 2.04, 0]}
          center
          zIndexRange={[8, 0]}
        >
          <button
            type="button"
            className={`agent-bubble${selected ? ' is-selected' : ''}${isAmbientActive ? ' is-ambient' : ''}`}
            style={{ borderTopColor: isAmbientActive ? '#7B90A3' : meta.color }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(profile.id);
            }}
          >
            <span className="agent-bubble-head">
              <span
                className="status-dot"
                style={{ background: isAmbientActive ? '#7B90A3' : meta.color }}
                aria-hidden="true"
              />
              <strong>{profile.displayName}</strong>
              <span className="agent-bubble-state">
                {isAmbientActive ? 'AMBIENTE' : meta.shortLabel}
              </span>
            </span>
            <span className="agent-bubble-text">{effectiveBubbleText}</span>
          </button>
        </Html>
      ) : showIconPill ? (
        <Html
          position={[0, isWalking || seatHeightRef.current === undefined ? 2.08 : 1.88, 0]}
          center
          zIndexRange={[6, 0]}
        >
          <button
            type="button"
            className={`agent-icon-pill${isAmbientActive ? ' is-ambient' : ''}`}
            style={{
              borderColor: isAmbientActive ? '#8FA2B2' : meta.color,
              color: isAmbientActive ? '#4F6578' : meta.color,
            }}
            title={`${profile.displayName}: ${effectiveBubbleText}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(profile.id);
            }}
          >
            <span className="agent-icon-badge">{renderActivityIcon()}</span>
            <span className="agent-icon-name">{shortFirstName}</span>
          </button>
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
      ))}
    </group>
  );
}
