import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ContactShadows,
  Html,
  OrbitControls,
  OrthographicCamera,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  type DeskSceneState,
  type RendererMetrics,
  STATE_META,
} from '../state/deskReducer';

interface Renderer3DProps {
  scene: DeskSceneState;
  allowOrbit: boolean;
  showComments: boolean;
  onSelect: () => void;
  onQuickAction?: (action: 'approve' | 'correct') => void;
  onMetrics: (metrics: RendererMetrics) => void;
}

function createOakFloorTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#D7C2A3';
  ctx.fillRect(0, 0, 512, 512);

  const plankH = 64;
  for (let row = 0; row < 8; row += 1) {
    const shade = row % 2 === 0 ? '#D3BC99' : '#DFCCA9';
    ctx.fillStyle = shade;
    ctx.fillRect(0, row * plankH, 512, plankH - 2);
    ctx.fillStyle = '#B89E7A';
    ctx.fillRect(0, (row + 1) * plankH - 2, 512, 2);

    const seamX = ((row * 173) % 380) + 60;
    ctx.fillRect(seamX, row * plankH, 2, plankH);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function drawMonitorScreen(
  ctx: CanvasRenderingContext2D,
  scene: DeskSceneState,
  isRight: boolean,
  phase: number
) {
  const meta = STATE_META[scene.state];
  const bg =
    scene.state === 'idle'
      ? '#233542'
      : scene.state === 'working'
        ? '#0A2542'
        : scene.state === 'waiting'
          ? '#3A2B11'
          : scene.state === 'completed'
            ? '#103528'
            : '#401618';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 160);

  // Top bar
  ctx.fillStyle = meta.screenAccent;
  ctx.fillRect(0, 0, 256, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(
    isRight ? scene.zoneLabel.toUpperCase() : `AGENTE · ${scene.roleId.toUpperCase()}`,
    10,
    16
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${meta.icon} ${meta.label}`, 12, 48);

  if (scene.state === 'waiting') {
    // Checkpoint pause card
    ctx.fillStyle = 'rgba(213, 161, 61, 0.22)';
    ctx.fillRect(14, 62, 228, 82);
    ctx.strokeStyle = '#D5A13D';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 62, 228, 82);
    ctx.fillStyle = '#F7E3B5';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('CHECKPOINT · RUN PAUSADO', 24, 88);
    ctx.font = '11px monospace';
    ctx.fillText(isRight ? 'BORRADOR: 42k-58k EUR' : '0 TOKENS EN ESPERA', 24, 110);
    ctx.fillText('APROBACION REQUERIDA', 24, 130);
    return;
  }

  if (scene.state === 'error') {
    ctx.fillStyle = 'rgba(201, 79, 80, 0.28)';
    ctx.fillRect(14, 62, 228, 82);
    ctx.strokeStyle = '#C94F50';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 62, 228, 82);
    ctx.fillStyle = '#FFD7D7';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('VALIDACION RECHAZADA', 24, 92);
    ctx.font = '11px monospace';
    ctx.fillText('TARIFA FUERA DE CATALOGO', 24, 116);
    return;
  }

  if (isRight) {
    // Document / offer / deliverable live preview
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(14, 60, 228, 86);
    ctx.fillStyle = meta.screenAccent;
    ctx.fillRect(24, 72, 108, 8);
    for (let i = 0; i < 4; i += 1) {
      const w =
        scene.state === 'working'
          ? 70 + ((phase * 32 + i * 43) % 126)
          : 150 - i * 18;
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillRect(24, 90 + i * 13, w, 6);
    }
    if (scene.state === 'completed') {
      ctx.fillStyle = '#36966C';
      ctx.fillRect(166, 118, 66, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('✓ VALIDADO', 171, 132);
    }
  } else {
    // Mini architecture / workflow nodes with live pulse
    const nodes: Array<[number, number, number, number]> = [
      [22, 68, 60, 26],
      [98, 68, 60, 26],
      [174, 68, 60, 26],
      [60, 112, 136, 26],
    ];
    nodes.forEach(([x, y, w, h], idx) => {
      const active = scene.state === 'working' && phase % 4 === idx;
      ctx.fillStyle = active
        ? 'rgba(0, 176, 240, 0.55)'
        : 'rgba(0, 176, 240, 0.2)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = active ? '#FFFFFF' : meta.screenAccent;
      ctx.lineWidth = active ? 2.5 : 1.5;
      ctx.strokeRect(x, y, w, h);
    });
  }
}

function MetricsProbe({ onMetrics }: { onMetrics: (m: RendererMetrics) => void }) {
  const mountStartRef = useRef<number>(performance.now());
  const firstRenderRef = useRef<number | null>(null);
  const framesRef = useRef(0);
  const sumMsRef = useRef(0);
  const windowStartRef = useRef(performance.now());
  const onMetricsRef = useRef(onMetrics);
  onMetricsRef.current = onMetrics;

  useFrame((_state, delta) => {
    const now = performance.now();
    if (firstRenderRef.current === null) {
      firstRenderRef.current = Math.round((now - mountStartRef.current) * 10) / 10;
      onMetricsRef.current({
        fps: 60,
        frameMs: Math.round(delta * 1000 * 10) / 10,
        firstRenderMs: firstRenderRef.current,
      });
    }

    framesRef.current += 1;
    sumMsRef.current += delta * 1000;
    const elapsed = now - windowStartRef.current;
    if (elapsed >= 500) {
      const fps = Math.round((framesRef.current * 1000) / elapsed);
      const frameMs = Math.round((sumMsRef.current / framesRef.current) * 10) / 10;
      onMetricsRef.current({ fps, frameMs, firstRenderMs: firstRenderRef.current });
      framesRef.current = 0;
      sumMsRef.current = 0;
      windowStartRef.current = now;
    }
  });

  return null;
}

/**
 * Stylized rounded low-poly specialist (capsule/sphere silhouette, articulated
 * shoulders/elbows/hands, glasses, hair volume, tailored blazer & shirt collar)
 * with distinct physical posture & props per operational state.
 */
function StylizedSpecialist({
  scene,
  showComments,
  commentText,
  onSelect,
  onQuickAction,
}: {
  scene: DeskSceneState;
  showComments: boolean;
  commentText: string;
  onSelect: () => void;
  onQuickAction?: (action: 'approve' | 'correct') => void;
}) {
  const seatGroupRef = useRef<THREE.Group>(null);
  const torsoGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const envelopeRef = useRef<THREE.Group>(null);
  const doneBadgeRef = useRef<THREE.Mesh>(null);
  const errorPrismRef = useRef<THREE.Mesh>(null);

  const meta = STATE_META[scene.state];

  useFrame(({ clock }, delta) => {
    const t = scene.reducedMotion ? 0 : clock.getElapsedTime();
    const lerpRate = scene.reducedMotion ? 1 : Math.min(1, delta * 7);

    // Subtle chair swivel: face monitors when working, slight angle toward viewer when waiting/idle
    if (seatGroupRef.current) {
      const targetRotY =
        scene.state === 'waiting'
          ? 0.42
          : scene.state === 'completed'
            ? 0.24
            : scene.state === 'idle'
              ? 0.16
              : scene.state === 'error'
                ? 0.34
                : 0;
      seatGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        seatGroupRef.current.rotation.y,
        targetRotY,
        lerpRate
      );
    }

    // Torso lean & breathing
    if (torsoGroupRef.current) {
      const targetLeanX =
        scene.state === 'working'
          ? -0.11
          : scene.state === 'waiting'
            ? 0.04
            : scene.state === 'completed'
              ? 0.08
              : scene.state === 'error'
                ? 0.1
                : 0.03;
      torsoGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        torsoGroupRef.current.rotation.x,
        targetLeanX,
        lerpRate
      );
      torsoGroupRef.current.position.y =
        0.54 + (scene.reducedMotion ? 0 : Math.sin(t * 2.1) * 0.008);
    }

    // Head glances between dual monitors when working; looks toward user when waiting
    if (headGroupRef.current) {
      const targetHeadY =
        scene.state === 'working' && !scene.reducedMotion
          ? Math.sin(t * 1.35) * 0.26
          : scene.state === 'waiting'
            ? 0.18
            : scene.state === 'error' && !scene.reducedMotion
              ? Math.sin(t * 5) * 0.12
              : 0;
      const targetHeadX =
        scene.state === 'working'
          ? 0.12
          : scene.state === 'completed' && !scene.reducedMotion
            ? Math.sin(t * 3.2) * 0.09
            : -0.02;
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.y,
        targetHeadY,
        lerpRate
      );
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.x,
        targetHeadX,
        lerpRate
      );
    }

    // Articulated arms & typing / envelope holding / stop gestures
    if (
      leftShoulderRef.current &&
      rightShoulderRef.current &&
      leftForearmRef.current &&
      rightForearmRef.current
    ) {
      if (scene.state === 'working') {
        const typeL = scene.reducedMotion ? 0 : Math.sin(t * 15) * 0.12;
        const typeR = scene.reducedMotion ? 0 : Math.sin(t * 15 + 2.4) * 0.12;
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.x,
          -0.62,
          lerpRate
        );
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          -0.62,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.z,
          0.14,
          lerpRate
        );
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.z,
          -0.14,
          lerpRate
        );
        leftForearmRef.current.rotation.x = -0.82 + typeL;
        rightForearmRef.current.rotation.x = -0.82 + typeR;
      } else if (scene.state === 'waiting') {
        // Right arm raised presenting the approval envelope
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.x,
          -0.25,
          lerpRate
        );
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          -1.05,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = 0.08;
        rightShoulderRef.current.rotation.z = -0.22;
        leftForearmRef.current.rotation.x = -0.5;
        rightForearmRef.current.rotation.x =
          -0.65 + (scene.reducedMotion ? 0 : Math.sin(t * 2.8) * 0.06);
      } else if (scene.state === 'completed') {
        // Relaxed celebratory open posture
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.x,
          -0.38,
          lerpRate
        );
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          -0.88,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = 0.16;
        rightShoulderRef.current.rotation.z = -0.24;
        leftForearmRef.current.rotation.x = -0.65;
        rightForearmRef.current.rotation.x = -0.75;
      } else if (scene.state === 'error') {
        // Both hands slightly raised in alert/blocked gesture
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.x,
          -0.75,
          lerpRate
        );
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          -0.75,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = 0.28;
        rightShoulderRef.current.rotation.z = -0.28;
        leftForearmRef.current.rotation.x = -0.9;
        rightForearmRef.current.rotation.x = -0.9;
      } else {
        // Idle resting on armrests
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulderRef.current.rotation.x,
          -0.18,
          lerpRate
        );
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulderRef.current.rotation.x,
          -0.18,
          lerpRate
        );
        leftShoulderRef.current.rotation.z = 0.1;
        rightShoulderRef.current.rotation.z = -0.1;
        leftForearmRef.current.rotation.x = -0.88;
        rightForearmRef.current.rotation.x = -0.88;
      }
    }

    if (envelopeRef.current) {
      envelopeRef.current.position.y =
        1.44 + (scene.reducedMotion ? 0 : Math.sin(t * 2.8) * 0.05);
      envelopeRef.current.rotation.y = scene.reducedMotion
        ? 0.4
        : Math.sin(t * 1.4) * 0.35 + 0.35;
    }

    if (doneBadgeRef.current) {
      doneBadgeRef.current.rotation.y = scene.reducedMotion ? 0.5 : t * 1.2;
    }

    if (errorPrismRef.current) {
      errorPrismRef.current.rotation.y = scene.reducedMotion ? 0.5 : t * 2.2;
      errorPrismRef.current.position.y =
        1.92 + (scene.reducedMotion ? 0 : Math.sin(t * 4) * 0.04);
    }
  });

  const skinColor = '#E7B99B';
  const pantsColor = '#243447';
  const shoeColor = '#1B242E';

  return (
    <group
      position={[0.08, 0, 0.78]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection highlight ring */}
      {scene.selected && (
        <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.72, 36]} />
          <meshBasicMaterial color="#00B0F0" />
        </mesh>
      )}

      {/* 5-star rolling ergonomic chair base */}
      <group>
        {[0, 1, 2, 3, 4].map((idx) => {
          const angle = (idx * Math.PI * 2) / 5;
          return (
            <group key={idx} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.07, 0.17]} castShadow>
                <boxGeometry args={[0.055, 0.04, 0.34]} />
                <meshStandardMaterial color="#364652" roughness={0.5} metalness={0.35} />
              </mesh>
              <mesh position={[0, 0.032, 0.32]} castShadow>
                <cylinderGeometry args={[0.032, 0.032, 0.035, 10]} />
                <meshStandardMaterial color="#1F2933" roughness={0.7} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.36, 12]} />
          <meshStandardMaterial color="#4B5D6B" roughness={0.45} metalness={0.4} />
        </mesh>
      </group>

      {/* Swiveling chair seat + human body */}
      <group ref={seatGroupRef}>
        {/* Rounded ergonomic seat cushion */}
        <mesh position={[0, 0.46, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.08, 0.52]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.78} />
        </mesh>
        {/* Contoured mesh backrest + lumbar frame */}
        <mesh position={[0, 0.88, 0.27]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.72, 0.065]} />
          <meshStandardMaterial color="#34495E" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.62, 0.25]} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.06]} />
          <meshStandardMaterial color="#253442" roughness={0.6} />
        </mesh>
        {/* Chair armrests */}
        {[-0.3, 0.3].map((ax) => (
          <group key={ax} position={[ax, 0.58, 0.02]}>
            <mesh position={[0, 0, 0.04]} castShadow>
              <boxGeometry args={[0.045, 0.22, 0.05]} />
              <meshStandardMaterial color="#364652" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.11, -0.02]} castShadow>
              <boxGeometry args={[0.075, 0.04, 0.3]} />
              <meshStandardMaterial color="#22303D" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Seated legs: thighs + calves + shoes */}
        {[-0.125, 0.125].map((lx) => (
          <group key={lx}>
            {/* Thigh */}
            <mesh position={[lx, 0.53, -0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.078, 0.26, 6, 12]} />
              <meshStandardMaterial color={pantsColor} roughness={0.8} />
            </mesh>
            {/* Calf */}
            <mesh position={[lx, 0.3, -0.3]} castShadow>
              <capsuleGeometry args={[0.066, 0.28, 6, 12]} />
              <meshStandardMaterial color={pantsColor} roughness={0.8} />
            </mesh>
            {/* Shoe */}
            <mesh position={[lx, 0.075, -0.35]} castShadow>
              <boxGeometry args={[0.12, 0.075, 0.21]} />
              <meshStandardMaterial color={shoeColor} roughness={0.65} />
            </mesh>
          </group>
        ))}

        {/* Upper body: tailored torso, white shirt V-neck, neck, head, hair, glasses, articulated arms */}
        <group ref={torsoGroupRef} position={[0, 0.54, 0.02]}>
          {/* Rounded torso / blazer */}
          <mesh position={[0, 0.3, 0]} scale={[1.18, 1, 0.78]} castShadow>
            <capsuleGeometry args={[0.19, 0.3, 8, 16]} />
            <meshStandardMaterial color={scene.jacketColor} roughness={0.68} />
          </mesh>
          {/* Crisp white shirt collar peek at chest */}
          <mesh position={[0, 0.48, -0.13]} rotation={[0.15, 0, 0]}>
            <coneGeometry args={[0.095, 0.2, 4]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.62, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.075, 0.12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.72} />
          </mesh>

          {/* Left articulated arm (shoulder -> upper arm -> elbow -> forearm -> hand) */}
          <group ref={leftShoulderRef} position={[-0.26, 0.49, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.18, 6, 10]} />
              <meshStandardMaterial color={scene.jacketColor} roughness={0.68} />
            </mesh>
            <group ref={leftForearmRef} position={[0, -0.24, 0]}>
              <mesh position={[0, -0.11, 0]} castShadow>
                <capsuleGeometry args={[0.048, 0.16, 6, 10]} />
                <meshStandardMaterial color={scene.jacketColor} roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.22, 0]} castShadow>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color={skinColor} roughness={0.72} />
              </mesh>
            </group>
          </group>

          {/* Right articulated arm */}
          <group ref={rightShoulderRef} position={[0.26, 0.49, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.18, 6, 10]} />
              <meshStandardMaterial color={scene.jacketColor} roughness={0.68} />
            </mesh>
            <group ref={rightForearmRef} position={[0, -0.24, 0]}>
              <mesh position={[0, -0.11, 0]} castShadow>
                <capsuleGeometry args={[0.048, 0.16, 6, 10]} />
                <meshStandardMaterial color={scene.jacketColor} roughness={0.68} />
              </mesh>
              <mesh position={[0, -0.22, 0]} castShadow>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color={skinColor} roughness={0.72} />
              </mesh>
            </group>
          </group>

          {/* Stylized sculpted head */}
          <group ref={headGroupRef} position={[0, 0.8, 0]}>
            {/* Main cranium (smooth slightly oval sphere) */}
            <mesh scale={[0.95, 1.04, 0.96]} castShadow>
              <sphereGeometry args={[0.195, 20, 18]} />
              <meshStandardMaterial color={skinColor} roughness={0.72} />
            </mesh>
            {/* Subtle ears */}
            <mesh position={[-0.185, -0.01, 0.01]}>
              <sphereGeometry args={[0.036, 10, 10]} />
              <meshStandardMaterial color={skinColor} roughness={0.72} />
            </mesh>
            <mesh position={[0.185, -0.01, 0.01]}>
              <sphereGeometry args={[0.036, 10, 10]} />
              <meshStandardMaterial color={skinColor} roughness={0.72} />
            </mesh>

            {/* Hair cap + styled side volume + swept fringe */}
            <mesh position={[0, 0.06, 0.025]} scale={[1.03, 0.9, 1.04]} castShadow>
              <sphereGeometry args={[0.2, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <meshStandardMaterial color={scene.hairColor} roughness={0.82} />
            </mesh>
            <mesh position={[-0.03, 0.15, -0.13]} rotation={[0.2, 0.15, -0.18]} castShadow>
              <capsuleGeometry args={[0.048, 0.14, 6, 10]} />
              <meshStandardMaterial color={scene.hairColor} roughness={0.82} />
            </mesh>
            <mesh position={[0, 0.01, 0.14]} scale={[1.02, 0.85, 0.65]} castShadow>
              <sphereGeometry args={[0.175, 14, 12]} />
              <meshStandardMaterial color={scene.hairColor} roughness={0.82} />
            </mesh>

            {/* Expressive dark eyes (facing -Z toward monitors) */}
            <mesh position={[-0.062, 0.01, -0.178]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshStandardMaterial color="#18222C" roughness={0.25} />
            </mesh>
            <mesh position={[0.062, 0.01, -0.178]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshStandardMaterial color="#18222C" roughness={0.25} />
            </mesh>

            {/* Subtle eyebrows */}
            <mesh position={[-0.062, 0.05, -0.176]} rotation={[0, 0, scene.state === 'error' ? -0.22 : 0.05]}>
              <boxGeometry args={[0.048, 0.012, 0.012]} />
              <meshStandardMaterial color={scene.hairColor} />
            </mesh>
            <mesh position={[0.062, 0.05, -0.176]} rotation={[0, 0, scene.state === 'error' ? 0.22 : -0.05]}>
              <boxGeometry args={[0.048, 0.012, 0.012]} />
              <meshStandardMaterial color={scene.hairColor} />
            </mesh>

            {/* Optional subtle glasses for Offers / Architect roles */}
            {scene.hasGlasses && (
              <group position={[0, 0.01, -0.19]}>
                <mesh position={[-0.065, 0, 0]}>
                  <torusGeometry args={[0.042, 0.007, 8, 18]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.4} roughness={0.4} />
                </mesh>
                <mesh position={[0.065, 0, 0]}>
                  <torusGeometry args={[0.042, 0.007, 8, 18]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.4} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.004, 0]}>
                  <boxGeometry args={[0.045, 0.008, 0.008]} />
                  <meshStandardMaterial color="#1B2A38" metalness={0.4} roughness={0.4} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      {/* Physical 3D state props */}
      {scene.state === 'waiting' && (
        <group ref={envelopeRef} position={[0.42, 1.44, -0.18]}>
          {/* 3D Amber Approval Envelope */}
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.22, 0.035]} />
            <meshStandardMaterial color="#F5D38B" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.02, 0.02]}>
            <boxGeometry args={[0.28, 0.035, 0.01]} />
            <meshStandardMaterial color="#D5A13D" />
          </mesh>
          <mesh position={[0, -0.04, 0.02]}>
            <cylinderGeometry args={[0.038, 0.038, 0.015, 16]} />
            <meshStandardMaterial
              color="#D5A13D"
              emissive="#D5A13D"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      )}

      {scene.state === 'completed' && (
        <mesh ref={doneBadgeRef} position={[0.48, 1.65, 0]}>
          <torusGeometry args={[0.11, 0.026, 10, 24]} />
          <meshStandardMaterial
            color="#36966C"
            emissive="#36966C"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {scene.state === 'error' && (
        <mesh ref={errorPrismRef} position={[0, 1.92, 0]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial
            color="#C94F50"
            emissive="#C94F50"
            emissiveIntensity={0.45}
          />
        </mesh>
      )}

      {/* 3D-anchored operational speech/comment bubble */}
      {showComments && (
        <Html
          position={[0.05, 2.02, 0]}
          center
          distanceFactor={12}
          zIndexRange={[10, 0]}
        >
          <div
            className="speech-bubble-3d"
            style={{ borderTopColor: meta.color }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <div className="speech-bubble-header">
              <span
                className="state-dot"
                style={{ background: meta.color }}
                aria-hidden="true"
              />
              <strong>{scene.roleLabel}</strong>
              {scene.state === 'working' && !scene.reducedMotion && (
                <span className="typing-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <p className="speech-bubble-text">{commentText}</p>
            {scene.state === 'waiting' && onQuickAction && (
              <div className="speech-bubble-actions">
                <button
                  type="button"
                  className="bubble-btn approve"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction('approve');
                  }}
                >
                  ✓ Aprobar oferta
                </button>
                <button
                  type="button"
                  className="bubble-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAction('correct');
                  }}
                >
                  ↺ Pedir ajuste
                </button>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function CoffeeSteam({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const wisp1 = useRef<THREE.Mesh>(null);
  const wisp2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!active || reducedMotion) return;
    const t = clock.getElapsedTime();
    if (wisp1.current) {
      const p = (t * 0.45) % 1;
      wisp1.current.position.y = 0.96 + p * 0.26;
      wisp1.current.position.x = -0.86 + Math.sin(t * 2) * 0.025;
      const mat = wisp1.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.38;
    }
    if (wisp2.current) {
      const p = ((t * 0.45) + 0.5) % 1;
      wisp2.current.position.y = 0.96 + p * 0.26;
      wisp2.current.position.x = -0.85 + Math.cos(t * 2) * 0.025;
      const mat = wisp2.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.35;
    }
  });

  if (!active || reducedMotion) return null;

  return (
    <group>
      <mesh ref={wisp1} position={[-0.86, 1.0, 0.25]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>
      <mesh ref={wisp2} position={[-0.85, 1.06, 0.25]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function DeskDiorama({
  scene,
  showComments,
  commentText,
  onSelect,
  onQuickAction,
}: {
  scene: DeskSceneState;
  showComments: boolean;
  commentText: string;
  onSelect: () => void;
  onQuickAction?: (action: 'approve' | 'correct') => void;
}) {
  const oakTex = useMemo(() => createOakFloorTexture(), []);

  const leftCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    return c;
  }, []);
  const rightCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    return c;
  }, []);

  const leftScreenTex = useMemo(() => {
    const tex = new THREE.CanvasTexture(leftCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [leftCanvas]);
  const rightScreenTex = useMemo(() => {
    const tex = new THREE.CanvasTexture(rightCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [rightCanvas]);

  const deliverableRef = useRef<THREE.Group>(null);
  const lastPhaseRef = useRef<number>(-1);

  useEffect(() => {
    drawMonitorScreen(leftCanvas.getContext('2d')!, scene, false, 0);
    drawMonitorScreen(rightCanvas.getContext('2d')!, scene, true, 0);
    leftScreenTex.needsUpdate = true;
    rightScreenTex.needsUpdate = true;
  }, [scene, leftCanvas, rightCanvas, leftScreenTex, rightScreenTex]);

  useEffect(() => {
    return () => {
      oakTex.dispose();
      leftScreenTex.dispose();
      rightScreenTex.dispose();
    };
  }, [oakTex, leftScreenTex, rightScreenTex]);

  useFrame(({ clock }, delta) => {
    // Animate monitor content cleanly at ~3 Hz while working
    if (scene.state === 'working' && !scene.reducedMotion) {
      const phase = Math.floor(clock.getElapsedTime() * 3);
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        drawMonitorScreen(leftCanvas.getContext('2d')!, scene, false, phase);
        drawMonitorScreen(rightCanvas.getContext('2d')!, scene, true, phase);
        leftScreenTex.needsUpdate = true;
        rightScreenTex.needsUpdate = true;
      }
    }

    // Smooth pop-in for physical deliverable folder on desk
    if (deliverableRef.current) {
      const showDoc =
        scene.artifacts.length > 0 ||
        scene.state === 'completed' ||
        scene.state === 'waiting';
      const targetScale = showDoc ? 1 : 0.001;
      const next = THREE.MathUtils.lerp(
        deliverableRef.current.scale.y,
        targetScale,
        scene.reducedMotion ? 1 : Math.min(1, delta * 9)
      );
      deliverableRef.current.scale.set(next, next, next);
    }
  });

  const meta = STATE_META[scene.state];
  const louvers = [-1.9, -1.35, -0.8, -0.25, 0.3, 0.85, 1.4, 1.95];

  return (
    <group>
      {/* Oak floor slab */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.2, 4.8]} />
        <meshStandardMaterial map={oakTex} roughness={0.78} />
      </mesh>

      {/* Left architectural plaster wall */}
      <mesh position={[-2.35, 1.4, 0]} receiveShadow>
        <boxGeometry args={[0.12, 2.8, 4.8]} />
        <meshStandardMaterial color="#F2F5F4" roughness={0.9} />
      </mesh>

      {/* Brand signage plaque on left wall */}
      <mesh position={[-2.27, 1.95, -0.7]}>
        <boxGeometry args={[0.04, 0.55, 1.45]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      <mesh position={[-2.24, 1.95, -0.7]}>
        <boxGeometry args={[0.02, 0.08, 1.15]} />
        <meshStandardMaterial color="#00B0F0" roughness={0.35} />
      </mesh>

      {/* Right panoramic glass wall (#A9C3CC) */}
      <mesh position={[0, 1.4, -2.35]}>
        <boxGeometry args={[4.8, 2.8, 0.08]} />
        <meshPhysicalMaterial
          color="#A9C3CC"
          transparent
          opacity={0.42}
          roughness={0.15}
          metalness={0.05}
        />
      </mesh>

      {/* DAT Alierta terracotta louvers (#B78770) */}
      {louvers.map((lx, idx) => (
        <mesh key={lx} position={[lx, 1.4, -2.26]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 2.75, 0.16]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#B78770' : '#EAEFED'}
            roughness={0.75}
          />
        </mesh>
      ))}

      {/* Potted plant */}
      <group position={[-1.65, 0, -1.55]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.56, 12]} />
          <meshStandardMaterial color="#B78770" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <dodecahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color="#748E69" roughness={0.85} />
        </mesh>
        <mesh position={[0.16, 0.96, 0.08]} castShadow>
          <dodecahedronGeometry args={[0.24, 1]} />
          <meshStandardMaterial color="#8AA67D" roughness={0.85} />
        </mesh>
      </group>

      {/* White architectural desk */}
      <group position={[0.1, 0, -0.15]}>
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.35, 0.075, 1.15]} />
          <meshStandardMaterial color="#FBFDFC" roughness={0.42} />
        </mesh>
        {[
          [-1.04, -0.46],
          [1.04, -0.46],
          [-1.04, 0.46],
          [1.04, 0.46],
        ].map(([lx, lz]) => (
          <mesh key={`${lx}_${lz}`} position={[lx, 0.36, lz]} castShadow>
            <cylinderGeometry args={[0.036, 0.032, 0.72, 10]} />
            <meshStandardMaterial color="#5E727B" roughness={0.45} metalness={0.3} />
          </mesh>
        ))}

        {/* Desk mat, keyboard, mouse */}
        <mesh position={[-0.04, 0.802, 0.22]} receiveShadow>
          <boxGeometry args={[1.15, 0.01, 0.42]} />
          <meshStandardMaterial color="#273845" roughness={0.85} />
        </mesh>
        <mesh position={[-0.1, 0.818, 0.22]} castShadow>
          <boxGeometry args={[0.58, 0.022, 0.19]} />
          <meshStandardMaterial color="#465A69" roughness={0.55} />
        </mesh>
        <mesh position={[0.34, 0.816, 0.23]} castShadow>
          <capsuleGeometry args={[0.032, 0.04, 4, 8]} />
          <meshStandardMaterial color="#3B4E5C" roughness={0.5} />
        </mesh>

        {/* Coffee mug + live steam when working */}
        <mesh position={[-0.86, 0.865, 0.25]} castShadow>
          <cylinderGeometry args={[0.058, 0.052, 0.125, 14]} />
          <meshStandardMaterial color="#0B2A5B" roughness={0.38} />
        </mesh>
        <CoffeeSteam
          active={scene.state === 'working'}
          reducedMotion={scene.reducedMotion}
        />

        {/* Physical deliverable folder + document stack */}
        <group ref={deliverableRef} position={[0.82, 0.8, 0.16]}>
          <mesh position={[0, 0.018, 0]} castShadow>
            <boxGeometry args={[0.36, 0.025, 0.44]} />
            <meshStandardMaterial
              color={scene.state === 'waiting' ? '#D5A13D' : '#115293'}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0.01, 0.038, -0.01]} castShadow>
            <boxGeometry args={[0.31, 0.018, 0.39]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
          </mesh>
          <mesh position={[0.07, 0.05, 0.09]}>
            <cylinderGeometry args={[0.045, 0.045, 0.008, 16]} />
            <meshStandardMaterial color={meta.color} />
          </mesh>
        </group>

        {/* Dual thin-bezel monitors */}
        {[-0.48, 0.48].map((mx, idx) => (
          <group
            key={mx}
            position={[mx, 0.8, -0.26]}
            rotation={[0, idx === 0 ? 0.15 : -0.15, 0]}
          >
            <mesh position={[0, 0.16, -0.04]} castShadow>
              <cylinderGeometry args={[0.032, 0.04, 0.32, 10]} />
              <meshStandardMaterial color="#2C3C47" roughness={0.45} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.85, 0.52, 0.048]} />
              <meshStandardMaterial color="#1A2630" roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.42, 0.028]}>
              <planeGeometry args={[0.78, 0.46]} />
              <meshStandardMaterial
                map={idx === 0 ? leftScreenTex : rightScreenTex}
                emissive={meta.screenAccent}
                emissiveIntensity={scene.state === 'idle' ? 0.05 : 0.24}
                roughness={0.28}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Upgraded stylized specialist + ergonomic chair + comment bubble */}
      <StylizedSpecialist
        scene={scene}
        showComments={showComments}
        commentText={commentText}
        onSelect={onSelect}
        onQuickAction={onQuickAction}
      />
    </group>
  );
}

export function Renderer3DR3F({
  scene,
  allowOrbit,
  showComments,
  onSelect,
  onQuickAction,
  onMetrics,
}: Renderer3DProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    if (scene.commentSteps.length <= 1 || scene.reducedMotion) return;
    const id = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % scene.commentSteps.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [scene.commentSteps, scene.reducedMotion]);

  const commentText =
    scene.commentSteps[stepIndex % scene.commentSteps.length] || scene.taskTitle;

  return (
    <div
      className="viewport-box"
      role="region"
      aria-label={`Candidato B 3D Ortográfico R3F — ${scene.roleLabel}, estado ${STATE_META[scene.state].label}`}
    >
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#E8EEEA']} />
        <OrthographicCamera
          makeDefault
          position={[9.2, 7.4, 9.2]}
          zoom={78}
          near={0.1}
          far={100}
          onUpdate={(cam) => cam.lookAt(0, 0.95, 0)}
        />
        <hemisphereLight args={['#FFFDF7', '#94A6B0', 1.0]} />
        <directionalLight
          position={[6, 11, 5]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-4.5}
          shadow-camera-right={4.5}
          shadow-camera-top={4.5}
          shadow-camera-bottom={-4.5}
        />
        <DeskDiorama
          scene={scene}
          showComments={showComments}
          commentText={commentText}
          onSelect={onSelect}
          onQuickAction={onQuickAction}
        />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.34}
          scale={8}
          blur={1.8}
          far={3.5}
        />
        {allowOrbit && (
          <OrbitControls
            target={[0, 0.95, 0]}
            enablePan={false}
            minZoom={52}
            maxZoom={135}
            maxPolarAngle={Math.PI / 2.2}
          />
        )}
        <MetricsProbe onMetrics={onMetrics} />
      </Canvas>

      <div className="agent-overlay-pill">
        <span
          className="state-dot"
          style={{ background: STATE_META[scene.state].color }}
          aria-hidden="true"
        />
        <span>
          {STATE_META[scene.state].icon} {STATE_META[scene.state].label}
        </span>
      </div>
      <button type="button" className="agent-select-btn" onClick={onSelect}>
        {scene.selected ? 'Inspector activo' : 'Inspeccionar agente'}
      </button>
    </div>
  );
}
