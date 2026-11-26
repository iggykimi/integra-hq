import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  OrthographicCamera,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { AgentId } from '@contracts/types';
import {
  AGENT_ORDER,
  AGENT_PROFILES,
  CAMERA_PRESETS,
  type CameraPresetId,
  type LightingMood,
  type Vec2,
} from '../state/officeLayout';
import type { OfficeSceneState } from '../state/officeReducer';
import { DataFlowPulses } from './DataFlowPulses';
import { preloadKenneyModels } from './KenneyModel';
import { OfficeArchitecture } from './OfficeArchitecture';
import {
  type BubbleVisibilityMode,
  SpecialistAgent,
} from './SpecialistAgent';
import { WorkstationDesks } from './WorkstationDesks';

preloadKenneyModels();

export interface ViewportMetrics {
  fps: number;
  frameMs: number;
}

interface OfficeCanvasProps {
  scene: OfficeSceneState;
  mood: LightingMood;
  cameraPreset: CameraPresetId;
  cameraTrigger: number;
  followSelected: boolean;
  selectedAgent: AgentId | null;
  bubbleMode: BubbleVisibilityMode;
  showPulses: boolean;
  reducedMotion: boolean;
  onSelectAgent: (id: AgentId | null) => void;
  onInteractLandmark: (
    landmark: 'reception_mail' | 'retro_pc' | 'whiteboard' | 'boardroom' | 'coffee' | 'printer' | 'arch_board' | 'slides_tv'
  ) => void;
  onMetrics: (metrics: ViewportMetrics) => void;
}

const MOOD_LIGHTING: Record<
  LightingMood,
  {
    bg: string;
    hemiSky: string;
    hemiGround: string;
    hemiIntensity: number;
    sunPos: [number, number, number];
    sunColor: string;
    sunIntensity: number;
    envIntensity: number;
  }
> = {
  day: {
    bg: '#E6ECE9',
    hemiSky: '#FFFDF8',
    hemiGround: '#8FA1AD',
    hemiIntensity: 0.92,
    sunPos: [14, 20, 10],
    sunColor: '#FFF9ED',
    sunIntensity: 1.55,
    envIntensity: 0.55,
  },
  golden: {
    bg: '#E8DDD2',
    hemiSky: '#FFE5C2',
    hemiGround: '#756D78',
    hemiIntensity: 0.72,
    sunPos: [19, 10, 6],
    sunColor: '#FFBA7A',
    sunIntensity: 1.85,
    envIntensity: 0.42,
  },
  night: {
    bg: '#0E1C2E',
    hemiSky: '#3A5A82',
    hemiGround: '#101B28',
    hemiIntensity: 0.42,
    sunPos: [12, 18, 12],
    sunColor: '#8FB9E8',
    sunIntensity: 0.48,
    envIntensity: 0.22,
  },
};

function MetricsProbe({ onMetrics }: { onMetrics: (m: ViewportMetrics) => void }) {
  const framesRef = useRef(0);
  const sumMsRef = useRef(0);
  const lastWindowRef = useRef(performance.now());
  const cbRef = useRef(onMetrics);
  cbRef.current = onMetrics;

  useFrame((_state, delta) => {
    framesRef.current += 1;
    sumMsRef.current += delta * 1000;
    const now = performance.now();
    const elapsed = now - lastWindowRef.current;
    if (elapsed >= 700) {
      cbRef.current({
        fps: Math.round((framesRef.current * 1000) / elapsed),
        frameMs: Math.round((sumMsRef.current / framesRef.current) * 10) / 10,
      });
      framesRef.current = 0;
      sumMsRef.current = 0;
      lastWindowRef.current = now;
    }
  });
  return null;
}

/**
 * Smoothly animates orthographic camera position, target, and zoom between presets
 * or follows a selected agent, yielding immediately when the user orbits/zooms.
 */
function CameraRig({
  presetId,
  trigger,
  followSelected,
  selectedAgent,
  agentPositionsRef,
  reducedMotion,
}: {
  presetId: CameraPresetId;
  trigger: number;
  followSelected: boolean;
  selectedAgent: AgentId | null;
  agentPositionsRef: React.MutableRefObject<Partial<Record<AgentId, Vec2>>>;
  reducedMotion: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const animatingRef = useRef(false);
  const goalPos = useRef(new THREE.Vector3(22, 18.5, 22));
  const goalTarget = useRef(new THREE.Vector3(0, 0.55, 0.2));
  const goalZoom = useRef(52);

  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId) ?? CAMERA_PRESETS[0];
    goalPos.current.set(...preset.position);
    goalTarget.current.set(...preset.target);
    goalZoom.current = preset.zoom;
    animatingRef.current = true;
  }, [presetId, trigger]);

  useFrame((_state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const ortho = camera as THREE.OrthographicCamera;
    const alpha = reducedMotion ? 1 : Math.min(1, delta * 5.2);

    if (followSelected && selectedAgent) {
      const pos = agentPositionsRef.current[selectedAgent] ?? AGENT_PROFILES[selectedAgent].seatPos;
      goalTarget.current.set(pos.x, 0.9, pos.z);
      goalPos.current.set(pos.x + 11, 9.6, pos.z + 11);
      goalZoom.current = 104;
      animatingRef.current = true;
    }

    if (animatingRef.current) {
      ortho.position.lerp(goalPos.current, alpha);
      controls.target.lerp(goalTarget.current, alpha);
      ortho.zoom = THREE.MathUtils.lerp(ortho.zoom, goalZoom.current, alpha);
      ortho.updateProjectionMatrix();
      controls.update();

      const done =
        ortho.position.distanceTo(goalPos.current) < 0.08 &&
        controls.target.distanceTo(goalTarget.current) < 0.05 &&
        Math.abs(ortho.zoom - goalZoom.current) < 0.4;
      if (done && !followSelected) {
        animatingRef.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      minZoom={34}
      maxZoom={155}
      maxPolarAngle={Math.PI / 2.15}
      minPolarAngle={Math.PI / 7}
      onStart={() => {
        animatingRef.current = false;
      }}
    />
  );
}

export function OfficeCanvas({
  scene,
  mood,
  cameraPreset,
  cameraTrigger,
  followSelected,
  selectedAgent,
  bubbleMode,
  showPulses,
  reducedMotion,
  onSelectAgent,
  onInteractLandmark,
  onMetrics,
}: OfficeCanvasProps) {
  const light = MOOD_LIGHTING[mood];
  const agentPositionsRef = useRef<Partial<Record<AgentId, Vec2>>>({});
  const [pulsePositions, setPulsePositions] = useState<Partial<Record<AgentId, Vec2>>>({});

  const handlePositionReport = useCallback((id: AgentId, pos: Vec2) => {
    agentPositionsRef.current[id] = pos;
    setPulsePositions((prev) => {
      const cur = prev[id];
      if (cur && Math.hypot(cur.x - pos.x, cur.z - pos.z) < 0.3) return prev;
      return { ...prev, [id]: pos };
    });
  }, []);

  return (
    <div
      className="viewport-canvas-wrap"
      aria-label="Escena 3D interactiva de Integra HQ DAT Alierta 2029 con 8 agentes en 5 zonas"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onPointerMissed={() => onSelectAgent(null)}
      >
        <color attach="background" args={[light.bg]} />

        <OrthographicCamera
          makeDefault
          position={[22, 18.5, 22]}
          zoom={58}
          near={0.1}
          far={120}
        />

        {/* Real Poly Haven CC0 studio HDRI for subtle PBR glass & metal reflections */}
        <Suspense fallback={null}>
          <Environment
            files="/assets/textures/brown_photostudio_03_1k.hdr"
            environmentIntensity={light.envIntensity}
          />
        </Suspense>

        <hemisphereLight args={[light.hemiSky, light.hemiGround, light.hemiIntensity]} />

        <directionalLight
          position={light.sunPos}
          color={light.sunColor}
          intensity={light.sunIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-13}
          shadow-camera-right={13}
          shadow-camera-top={11}
          shadow-camera-bottom={-11}
          shadow-camera-near={1}
          shadow-camera-far={55}
          shadow-bias={-0.0004}
        />

        {/* Subtle accent interior lights in Evening/Night mode */}
        {mood === 'night' && (
          <>
            <pointLight position={[0, 2.7, -3.7]} color="#90D6F7" intensity={1.8} distance={7.5} decay={2} />
            <pointLight position={[-6.8, 2.6, 3.3]} color="#C8ECFF" intensity={1.6} distance={7} decay={2} />
            <pointLight position={[6.3, 2.5, -3.2]} color="#FFD699" intensity={2.2} distance={8} decay={2} />
          </>
        )}

        <Suspense fallback={null}>
          <OfficeArchitecture
            scene={scene}
            mood={mood}
            reducedMotion={reducedMotion}
            onInteractLandmark={onInteractLandmark}
          />

          <WorkstationDesks
            scene={scene}
            mood={mood}
            selectedAgent={selectedAgent}
            reducedMotion={reducedMotion}
            onSelectAgent={(id) => onSelectAgent(id)}
          />

          {AGENT_ORDER.map((id) => (
            <SpecialistAgent
              key={id}
              profile={AGENT_PROFILES[id]}
              agent={scene.agents[id]}
              selected={selectedAgent === id}
              bubbleMode={bubbleMode}
              reducedMotion={reducedMotion}
              checkpoint={scene.checkpoint}
              onSelect={(aid) => onSelectAgent(aid)}
              onPositionReport={handlePositionReport}
            />
          ))}

          <DataFlowPulses
            pulses={scene.activePulses}
            agentPositions={pulsePositions}
            enabled={showPulses}
            reducedMotion={reducedMotion}
          />
        </Suspense>

        <ContactShadows
          position={[0, 0.014, 0]}
          opacity={mood === 'night' ? 0.45 : 0.28}
          scale={22}
          blur={1.8}
          far={4}
        />

        <CameraRig
          presetId={cameraPreset}
          trigger={cameraTrigger}
          followSelected={followSelected}
          selectedAgent={selectedAgent}
          agentPositionsRef={agentPositionsRef}
          reducedMotion={reducedMotion}
        />

        <MetricsProbe onMetrics={onMetrics} />
      </Canvas>
    </div>
  );
}
