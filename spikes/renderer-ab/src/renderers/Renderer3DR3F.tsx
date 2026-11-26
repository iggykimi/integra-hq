import { useEffect, useMemo, useRef } from 'react';
import { ContactShadows, OrbitControls, OrthographicCamera } from '@react-three/drei';
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
  onSelect: () => void;
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
    const shade = row % 2 === 0 ? '#D4BD9B' : '#DECBA9';
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

function createMonitorTexture(scene: DeskSceneState, isRight: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  const meta = STATE_META[scene.state];

  const bg =
    scene.state === 'idle'
      ? '#263845'
      : scene.state === 'working'
        ? '#0B2A4A'
        : scene.state === 'waiting'
          ? '#3B2D12'
          : scene.state === 'completed'
            ? '#123629'
            : '#42171A';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 160);

  // Header strip
  ctx.fillStyle = meta.screenAccent;
  ctx.fillRect(0, 0, 256, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(isRight ? scene.zoneLabel.toUpperCase() : scene.roleId.toUpperCase(), 10, 16);

  // Content bars
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${meta.icon} ${meta.label}`, 12, 52);

  if (isRight) {
    // Document / card preview
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(14, 68, 228, 76);
    ctx.fillStyle = meta.screenAccent;
    ctx.fillRect(24, 80, 110, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(24, 98, 196, 6);
    ctx.fillRect(24, 112, 164, 6);
    ctx.fillRect(24, 126, 130, 6);
  } else {
    // Diagram / telemetry nodes
    const nodes = [
      [28, 80, 56, 26],
      [104, 80, 56, 26],
      [180, 80, 52, 26],
      [66, 120, 124, 22],
    ];
    for (const [x, y, w, h] of nodes) {
      ctx.fillStyle = 'rgba(0, 176, 240, 0.28)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = meta.screenAccent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

function DeskDiorama({
  scene,
  onSelect,
}: {
  scene: DeskSceneState;
  onSelect: () => void;
}) {
  const oakTex = useMemo(() => createOakFloorTexture(), []);
  const leftScreenTex = useMemo(() => createMonitorTexture(scene, false), [scene]);
  const rightScreenTex = useMemo(() => createMonitorTexture(scene, true), [scene]);

  useEffect(() => {
    return () => {
      oakTex.dispose();
    };
  }, [oakTex]);

  useEffect(() => {
    return () => {
      leftScreenTex.dispose();
      rightScreenTex.dispose();
    };
  }, [leftScreenTex, rightScreenTex]);

  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const meta = STATE_META[scene.state];

  useFrame(({ clock }) => {
    const t = scene.reducedMotion ? 0 : clock.getElapsedTime();

    if (leftArmRef.current && rightArmRef.current) {
      if (scene.state === 'working' && !scene.reducedMotion) {
        leftArmRef.current.rotation.x = -0.55 + Math.sin(t * 14) * 0.08;
        rightArmRef.current.rotation.x = -0.55 - Math.sin(t * 14) * 0.08;
      } else if (scene.state === 'waiting') {
        leftArmRef.current.rotation.x = -0.25;
        rightArmRef.current.rotation.x = -0.95;
      } else {
        leftArmRef.current.rotation.x = -0.35;
        rightArmRef.current.rotation.x = -0.35;
      }
    }

    if (headRef.current) {
      if (scene.state === 'working' && !scene.reducedMotion) {
        headRef.current.rotation.y = Math.sin(t * 1.4) * 0.14;
      } else if (scene.state === 'completed' && !scene.reducedMotion) {
        headRef.current.rotation.x = Math.sin(t * 3) * 0.06;
      } else {
        headRef.current.rotation.y = 0;
        headRef.current.rotation.x = 0;
      }
    }

    if (beaconRef.current) {
      beaconRef.current.position.y = 2.08 + (scene.reducedMotion ? 0 : Math.sin(t * 2.6) * 0.05);
      const scale =
        scene.state === 'working' && !scene.reducedMotion
          ? 1 + Math.sin(t * 5) * 0.1
          : 1;
      beaconRef.current.scale.setScalar(scale);
    }
  });

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
          <cylinderGeometry args={[0.26, 0.2, 0.56, 8]} />
          <meshStandardMaterial color="#B78770" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color="#748E69" roughness={0.85} />
        </mesh>
        <mesh position={[0.16, 0.96, 0.08]} castShadow>
          <dodecahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#8AA67D" roughness={0.85} />
        </mesh>
      </group>

      {/* White architectural desk */}
      <group position={[0.1, 0, -0.15]}>
        {/* Desktop */}
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.08, 1.15]} />
          <meshStandardMaterial color="#FBFDFC" roughness={0.45} />
        </mesh>
        {/* 4 desk legs */}
        {[
          [-1.02, -0.46],
          [1.02, -0.46],
          [-1.02, 0.46],
          [1.02, 0.46],
        ].map(([lx, lz]) => (
          <mesh key={`${lx}_${lz}`} position={[lx, 0.36, lz]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#5E727B" roughness={0.5} metalness={0.25} />
          </mesh>
        ))}

        {/* Desk mat & keyboard */}
        <mesh position={[0, 0.805, 0.22]} receiveShadow>
          <boxGeometry args={[1.08, 0.012, 0.42]} />
          <meshStandardMaterial color="#273845" roughness={0.85} />
        </mesh>
        <mesh position={[-0.04, 0.822, 0.22]} castShadow>
          <boxGeometry args={[0.62, 0.025, 0.2]} />
          <meshStandardMaterial color="#465A69" roughness={0.6} />
        </mesh>

        {/* Coffee mug */}
        <mesh position={[-0.86, 0.87, 0.25]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.13, 12]} />
          <meshStandardMaterial color="#0B2A5B" roughness={0.4} />
        </mesh>

        {/* Artifact paper stack visible on waiting/completed */}
        {(scene.artifacts.length > 0 || scene.state === 'completed' || scene.state === 'waiting') && (
          <mesh position={[0.8, 0.825, 0.18]} castShadow>
            <boxGeometry args={[0.34, 0.04, 0.42]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
          </mesh>
        )}

        {/* Dual monitors */}
        {[-0.48, 0.48].map((mx, idx) => (
          <group
            key={mx}
            position={[mx, 0.8, -0.26]}
            rotation={[0, idx === 0 ? 0.14 : -0.14, 0]}
          >
            {/* Stand */}
            <mesh position={[0, 0.16, -0.04]} castShadow>
              <boxGeometry args={[0.08, 0.32, 0.08]} />
              <meshStandardMaterial color="#2C3C47" roughness={0.5} />
            </mesh>
            {/* Bezel */}
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.84, 0.52, 0.06]} />
              <meshStandardMaterial color="#1C2933" roughness={0.45} />
            </mesh>
            {/* Live CanvasTexture Screen */}
            <mesh position={[0, 0.42, 0.034]}>
              <planeGeometry args={[0.76, 0.45]} />
              <meshStandardMaterial
                map={idx === 0 ? leftScreenTex : rightScreenTex}
                emissive={meta.screenAccent}
                emissiveIntensity={scene.state === 'idle' ? 0.05 : 0.25}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Interactive Specialist + Ergonomic Chair */}
      <group
        position={[0.08, 0, 0.72]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {/* Selection ring */}
        {scene.selected && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.58, 0.68, 32]} />
            <meshBasicMaterial color="#00B0F0" />
          </mesh>
        )}

        {/* Chair base & stem */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 0.08, 12]} />
          <meshStandardMaterial color="#374752" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#4D5F6B" roughness={0.5} />
        </mesh>
        {/* Chair seat & backrest */}
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.62, 0.09, 0.58]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.88, 0.28]} castShadow>
          <boxGeometry args={[0.6, 0.74, 0.09]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.75} />
        </mesh>

        {/* Character legs */}
        <mesh position={[-0.14, 0.29, -0.22]} castShadow>
          <boxGeometry args={[0.17, 0.44, 0.18]} />
          <meshStandardMaterial color="#243444" roughness={0.8} />
        </mesh>
        <mesh position={[0.14, 0.29, -0.22]} castShadow>
          <boxGeometry args={[0.17, 0.44, 0.18]} />
          <meshStandardMaterial color="#243444" roughness={0.8} />
        </mesh>

        {/* Character torso (business-casual blazer) */}
        <mesh position={[0, 0.84, 0.02]} castShadow>
          <boxGeometry args={[0.52, 0.62, 0.34]} />
          <meshStandardMaterial color={scene.jacketColor} roughness={0.7} />
        </mesh>

        {/* Articulated arms */}
        <mesh ref={leftArmRef} position={[-0.33, 0.92, -0.18]} castShadow>
          <boxGeometry args={[0.14, 0.42, 0.15]} />
          <meshStandardMaterial color={scene.jacketColor} roughness={0.7} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.33, 0.92, -0.18]} castShadow>
          <boxGeometry args={[0.14, 0.42, 0.15]} />
          <meshStandardMaterial color={scene.jacketColor} roughness={0.7} />
        </mesh>

        {/* Head + hair */}
        <group ref={headRef} position={[0, 1.36, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.36, 0.34]} />
            <meshStandardMaterial color="#DFB192" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.18, 0.01]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.36]} />
            <meshStandardMaterial color="#3B2F28" roughness={0.85} />
          </mesh>
        </group>

        {/* Floating state beacon */}
        <mesh ref={beaconRef} position={[0, 2.08, 0]}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial
            color={meta.color}
            emissive={meta.color}
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

export function Renderer3DR3F({
  scene,
  allowOrbit,
  onSelect,
  onMetrics,
}: Renderer3DProps) {
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
          position={[9.5, 7.6, 9.5]}
          zoom={78}
          near={0.1}
          far={100}
          onUpdate={(cam) => cam.lookAt(0, 0.85, 0)}
        />
        <hemisphereLight args={['#FFFDF7', '#94A6B0', 0.95]} />
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
        <DeskDiorama scene={scene} onSelect={onSelect} />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={8}
          blur={1.8}
          far={3.5}
        />
        {allowOrbit && (
          <OrbitControls
            target={[0, 0.85, 0]}
            enablePan={false}
            minZoom={52}
            maxZoom={130}
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
