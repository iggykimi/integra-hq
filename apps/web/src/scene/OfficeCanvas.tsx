import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  OrthographicCamera,
  useProgress,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { AgentId } from '@contracts/types';
import {
  AGENT_ORDER,
  AGENT_PROFILES,
  CAMERA_PRESETS,
  LANDMARK_WAYPOINTS,
  type CameraPresetId,
  type LightingMood,
  type Vec2,
} from '../state/officeLayout';
import type { OfficeSceneState } from '../state/officeReducer';
import type { AmbientSimMap } from '../state/useOfficeLifeSim';
import { CampusExterior } from './CampusExterior';
import { DataFlowPulses } from './DataFlowPulses';
import { preloadKenneyModels } from './KenneyModel';
import { type LandmarkId, OfficeArchitecture } from './OfficeArchitecture';
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
  ambientMap: AmbientSimMap;
  mood: LightingMood;
  cameraPreset: CameraPresetId;
  cameraTrigger: number;
  followSelected: boolean;
  selectedAgent: AgentId | null;
  bubbleMode: BubbleVisibilityMode;
  showPulses: boolean;
  reducedMotion: boolean;
  onSelectAgent: (id: AgentId | null) => void;
  onInteractLandmark: (landmark: LandmarkId) => void;
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
    hemiIntensity: 0.7,
    sunPos: [18, 20, 12],
    sunColor: '#FFF5E5',
    sunIntensity: 1.45,
    envIntensity: 0.48,
  },
  golden: {
    bg: '#E8DDD2',
    hemiSky: '#FFE5C2',
    hemiGround: '#756D78',
    hemiIntensity: 0.72,
    sunPos: [28, 13, 8],
    sunColor: '#FFBA7A',
    sunIntensity: 1.85,
    envIntensity: 0.42,
  },
  night: {
    bg: '#0E1C2E',
    hemiSky: '#3A5A82',
    hemiGround: '#101B28',
    hemiIntensity: 0.44,
    sunPos: [16, 22, 16],
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
  const { camera, size } = useThree();
  // The whole floor needs more room than a close-up, especially beside the inspector.
  const wideScale = Math.min(1, size.width / 1520, size.height / 920);
  const detailScale = Math.min(1, size.width / 1200, size.height / 900);
  const zoomScale = presetId === 'overview' || presetId === 'campus' ? wideScale : detailScale;
  const animatingRef = useRef(false);
  const goalPos = useRef(new THREE.Vector3(31, 25, 31));
  const goalTarget = useRef(new THREE.Vector3(0.6, 0.2, 0.1));
  const goalZoom = useRef(38);
  const orbitOffset = useRef(new THREE.Vector3());
  const currentOrbit = useRef(new THREE.Spherical());
  const goalOrbit = useRef(new THREE.Spherical());

  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId) ?? CAMERA_PRESETS[0];
    goalPos.current.set(...preset.position);
    goalTarget.current.set(...preset.target);
    goalZoom.current = preset.zoom * zoomScale;
    animatingRef.current = true;
  }, [presetId, trigger, zoomScale]);

  useFrame((_state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const ortho = camera as THREE.OrthographicCamera;
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.2);

    if (followSelected && selectedAgent) {
      const pos = agentPositionsRef.current[selectedAgent] ?? AGENT_PROFILES[selectedAgent].seatPos;
      goalTarget.current.set(pos.x, 0.9, pos.z);
      goalPos.current.set(pos.x + 11, 9.6, pos.z + 11);
      goalZoom.current = 104 * detailScale;
      animatingRef.current = true;
    }

    if (animatingRef.current) {
      const offset = orbitOffset.current;
      const orbit = currentOrbit.current.setFromVector3(offset.subVectors(ortho.position, controls.target));
      const goal = goalOrbit.current.setFromVector3(offset.subVectors(goalPos.current, goalTarget.current));
      const turn = goal.theta - orbit.theta;
      // Orbit around the focus even when resetting from the opposite side of the office.
      orbit.theta += Math.atan2(Math.sin(turn), Math.cos(turn)) * alpha;
      orbit.phi = THREE.MathUtils.lerp(orbit.phi, goal.phi, alpha);
      orbit.radius = THREE.MathUtils.lerp(orbit.radius, goal.radius, alpha);
      controls.target.lerp(goalTarget.current, alpha);
      ortho.position.copy(offset.setFromSpherical(orbit).add(controls.target));
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
      minZoom={18 * wideScale}
      maxZoom={165}
      maxPolarAngle={Math.PI * 0.41}
      minPolarAngle={Math.PI / 7}
      onStart={() => {
        animatingRef.current = false;
      }}
    />
  );
}

export function OfficeCanvas({
  scene,
  ambientMap,
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
  const loading = useProgress((state) => state.active);
  const agentPositionsRef = useRef<Partial<Record<AgentId, Vec2>>>({});
  const [pulsePositions, setPulsePositions] = useState<Partial<Record<AgentId, Vec2>>>({});

  const coffeeVisitors = AGENT_ORDER.filter(
    (id) => scene.agents[id].activity === 'coffee' || ambientMap[id]?.activity === 'coffee'
  );
  const coffeeCounter = LANDMARK_WAYPOINTS.coffee.pos;
  const coffeeGuestPresent = () => coffeeVisitors.some((id) => {
    const pos = agentPositionsRef.current[id];
    return pos && Math.hypot(pos.x - coffeeCounter.x, pos.z - coffeeCounter.z) < 0.3;
  });
  const isWideView = !followSelected && (cameraPreset === 'overview' || cameraPreset === 'campus');

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
      aria-label="Maqueta 3D de la oficina de Integra en el DAT Alierta"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onPointerMissed={() => onSelectAgent(null)}
      >
        <color attach="background" args={[light.bg]} />
        <fog attach="fog" args={[light.bg, 78, 156]} />

        <OrthographicCamera
          makeDefault
          position={[31, 25, 31]}
          zoom={38}
          near={0.1}
          far={240}
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
          shadow-camera-left={-38}
          shadow-camera-right={38}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={1}
          shadow-camera-far={95}
          shadow-bias={-0.00025}
          shadow-normalBias={0.018}
        />

        {/* Subtle accent interior lights in Evening/Night mode (capped at 3 for GPU smoothness) */}
        {mood === 'night' && (
          <>
            <pointLight position={[-1.2, 2.9, -5.8]} color="#90D6F7" intensity={2.2} distance={11} decay={2} />
            <pointLight position={[-9.2, 2.8, 4.2]} color="#C8ECFF" intensity={2.0} distance={11} decay={2} />
            <pointLight position={[11.0, 2.8, -5.0]} color="#FFD699" intensity={2.5} distance={11} decay={2} />
          </>
        )}

        <Suspense fallback={null}>
          <CampusExterior mood={mood} reducedMotion={reducedMotion} />

          <OfficeArchitecture
            scene={scene}
            mood={mood}
            focusedView={followSelected ? null : cameraPreset}
            coffeeGuestPresent={coffeeGuestPresent}
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
              ambient={ambientMap[id]}
              selected={selectedAgent === id}
              isWideView={isWideView}
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

          <ContactShadows
            frames={1}
            resolution={512}
            position={[0, 0.028, 0]}
            opacity={0.32}
            scale={36}
            blur={2.1}
            far={3.5}
          />
        </Suspense>

        <CameraRig
          presetId={cameraPreset}
          trigger={cameraTrigger}
          followSelected={followSelected}
          selectedAgent={selectedAgent}
          agentPositionsRef={agentPositionsRef}
          reducedMotion={reducedMotion}
        />

        <EffectComposer multisampling={2}>
          <Bloom
            mipmapBlur
            luminanceThreshold={1.08}
            intensity={mood === 'night' ? 0.42 : mood === 'golden' ? 0.22 : 0.1}
            radius={0.62}
          />
        </EffectComposer>

        <MetricsProbe onMetrics={onMetrics} />
      </Canvas>
      {loading && <span className="viewport-loading" role="status">Cargando la oficina…</span>}
    </div>
  );
}
