import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AgentId } from '@contracts/types';
import {
  AGENT_ORDER,
  AGENT_PROFILES,
  type AgentVisualProfile,
  type LightingMood,
  STATE_META,
} from '../state/officeLayout';
import type { AgentRuntimeState, OfficeSceneState } from '../state/officeReducer';
import { KenneyModel } from './KenneyModel';
import { createCanvasTexture, drawDeskMonitor } from './screenTextures';

interface SingleWorkstationProps {
  profile: AgentVisualProfile;
  agent: AgentRuntimeState;
  mood: LightingMood;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (id: AgentId) => void;
}

function SingleWorkstation({
  profile,
  agent,
  mood,
  selected,
  reducedMotion,
  onSelect,
}: SingleWorkstationProps) {
  const leftScreen = useMemo(() => createCanvasTexture(256, 160), []);
  const rightScreen = useMemo(() => createCanvasTexture(256, 160), []);
  const lastPhaseRef = useRef(-1);
  const binderRef = useRef<THREE.Group>(null);

  useEffect(() => {
    drawDeskMonitor(leftScreen.ctx, profile, agent, false, 0);
    drawDeskMonitor(rightScreen.ctx, profile, agent, true, 0);
    leftScreen.texture.needsUpdate = true;
    rightScreen.texture.needsUpdate = true;
  }, [profile, agent, leftScreen, rightScreen]);

  useEffect(() => {
    return () => {
      leftScreen.texture.dispose();
      rightScreen.texture.dispose();
    };
  }, [leftScreen, rightScreen]);

  useFrame(({ clock }, delta) => {
    if (agent.state === 'working' && !reducedMotion) {
      const phase = Math.floor(clock.getElapsedTime() * 2.5);
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase;
        drawDeskMonitor(leftScreen.ctx, profile, agent, false, phase);
        drawDeskMonitor(rightScreen.ctx, profile, agent, true, phase);
        leftScreen.texture.needsUpdate = true;
        rightScreen.texture.needsUpdate = true;
      }
    }

    if (binderRef.current) {
      const showArtifact = agent.artifacts.length > 0 || agent.state === 'completed' || agent.state === 'waiting';
      const target = showArtifact ? 1 : 0.001;
      const next = THREE.MathUtils.lerp(
        binderRef.current.scale.y,
        target,
        reducedMotion ? 1 : Math.min(1, delta * 8)
      );
      binderRef.current.scale.set(next, next, next);
    }
  });

  const meta = STATE_META[agent.state];
  const isDirector = profile.id === 'director';
  const deskWidth = isDirector ? 2.15 : 1.65;
  const deskDepth = isDirector ? 0.96 : 0.84;
  const screenGlow =
    agent.state === 'idle'
      ? mood === 'night'
        ? 0.22
        : 0.07
      : mood === 'night'
        ? 0.62
        : mood === 'golden'
          ? 0.36
          : 0.24;
  const lampGlow = mood === 'night' ? 1.5 : mood === 'golden' ? 0.85 : 0.08;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(profile.id);
      }}
    >
      {/* Desk Assembly centered at deskPos, rotated by deskYaw (monitors on -Z side, screens facing +Z!) */}
      <group position={[profile.deskPos.x, 0, profile.deskPos.z]} rotation={[0, profile.deskYaw, 0]}>
        {/* Real Kenney CC0 Desk Model (re-toned to crisp architectural white + brushed slate steel) */}
        <KenneyModel
          name={isDirector ? 'deskCorner' : 'desk'}
          position={isDirector ? [-0.28, 0, -0.05] : [0, 0, 0]}
          rotation={isDirector ? [0, -Math.PI / 2, 0] : [0, 0, 0]}
          scale={isDirector ? [1.75, 1.98, 1.85] : [2.25, 1.98, 1.52]}
          palette={{
            wood: { color: '#F8FAFA', roughness: 0.42 },
            metal: { color: '#4B5E6D', roughness: 0.44, metalness: 0.4 },
          }}
        />

        {/* Crisp Desk Mat + Keyboard + Mouse (Kenney CC0) positioned cleanly at desk surface Y = 0.765 */}
        <mesh position={[0, 0.768, 0.16]} receiveShadow>
          <boxGeometry args={[0.92, 0.008, 0.34]} />
          <meshStandardMaterial color="#253645" roughness={0.88} />
        </mesh>
        <KenneyModel
          name="computerKeyboard"
          position={[-0.04, 0.772, 0.18]}
          scale={1.55}
          palette={{
            metalDark: { color: '#273542', roughness: 0.5 },
            metalMedium: { color: '#4B5C6B', roughness: 0.5 },
          }}
        />
        <KenneyModel
          name="computerMouse"
          position={[0.32, 0.772, 0.18]}
          scale={1.45}
        />

        {/* Dual Architectural Monitors with Dynamic Per-Role CanvasTextures */}
        {[-0.36, 0.36].map((mx, idx) => (
          <group
            key={mx}
            position={[mx, 0.765, -0.22]}
            rotation={[0, idx === 0 ? 0.14 : -0.14, 0]}
          >
            {/* Slim metallic stand */}
            <mesh position={[0, 0.14, -0.04]} castShadow>
              <cylinderGeometry args={[0.022, 0.03, 0.28, 10]} />
              <meshStandardMaterial color="#31414D" roughness={0.42} metalness={0.45} />
            </mesh>
            <mesh position={[0, 0.012, -0.02]} castShadow>
              <boxGeometry args={[0.22, 0.018, 0.16]} />
              <meshStandardMaterial color="#31414D" roughness={0.42} metalness={0.45} />
            </mesh>
            {/* Thin-bezel monitor frame */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.66, 0.4, 0.038]} />
              <meshStandardMaterial color="#18242E" roughness={0.38} />
            </mesh>
            {/* Glowing CanvasTexture display facing +Z (directly visible from isometric camera!) */}
            <mesh position={[0, 0.35, 0.022]}>
              <planeGeometry args={[0.61, 0.355]} />
              <meshStandardMaterial
                map={idx === 0 ? leftScreen.texture : rightScreen.texture}
                emissive={meta.screenAccent}
                emissiveMap={idx === 0 ? leftScreen.texture : rightScreen.texture}
                emissiveIntensity={screenGlow}
                roughness={0.24}
              />
            </mesh>
          </group>
        ))}

        {/* Small Desk Lamp (Kenney CC0) — glows warmly in Golden Hour & Night mode */}
        <KenneyModel
          name="lampSquareTable"
          position={[-deskWidth * 0.39, 0.765, -deskDepth * 0.26]}
          scale={1.25}
          palette={{
            metal: { color: '#2F3F4C', roughness: 0.4, metalness: 0.45 },
            lamp: {
              color: '#FFF8E6',
              emissive: '#FFD68A',
              emissiveIntensity: lampGlow,
            },
          }}
        />

        {/* Integra Navy Coffee Mug on desk */}
        <mesh position={[-deskWidth * 0.38, 0.815, 0.18]} castShadow>
          <cylinderGeometry args={[0.042, 0.038, 0.095, 12]} />
          <meshStandardMaterial color="#0B2A5B" roughness={0.36} />
        </mesh>

        {/* Small personal desk plant (Kenney CC0) on alternating desks */}
        {(profile.id === 'director' || profile.id === 'consultant' || profile.id === 'designer') && (
          <KenneyModel
            name={profile.id === 'director' ? 'plantSmall1' : 'plantSmall3'}
            position={[deskWidth * 0.39, 0.765, -deskDepth * 0.26]}
            scale={1.05}
            palette={{ wood: { color: '#B78770' }, plant: { color: '#618458' } }}
          />
        )}

        {/* Deliverable Folder Stack that scales in when artifacts are created */}
        <group ref={binderRef} position={[deskWidth * 0.35, 0.77, 0.16]}>
          <mesh position={[0, 0.016, 0]} castShadow>
            <boxGeometry args={[0.26, 0.022, 0.32]} />
            <meshStandardMaterial
              color={agent.state === 'waiting' ? '#D5A13D' : '#115293'}
              roughness={0.48}
            />
          </mesh>
          <mesh position={[0.01, 0.032, -0.01]} castShadow>
            <boxGeometry args={[0.22, 0.015, 0.28]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.55} />
          </mesh>
          <mesh position={[0.05, 0.042, 0.06]}>
            <cylinderGeometry args={[0.034, 0.034, 0.008, 14]} />
            <meshStandardMaterial color={meta.color} />
          </mesh>
        </group>

        {/* Subtle desk status LED bar on front edge */}
        <mesh position={[0, 0.74, deskDepth * 0.47]}>
          <boxGeometry args={[0.55, 0.022, 0.018]} />
          <meshStandardMaterial
            color={meta.color}
            emissive={meta.color}
            emissiveIntensity={agent.state === 'idle' ? 0.15 : 0.75}
          />
        </mesh>

        {/* Under-desk waste bin (Kenney CC0 scaled to proper 40cm height) */}
        <KenneyModel
          name="trashcan"
          position={[deskWidth * 0.42, 0, 0.05]}
          scale={0.42}
        />
      </group>

      {/* Ergonomic Swivel Chair (Kenney CC0 chairDesk.glb) at seatPos */}
      <KenneyModel
        name="chairDesk"
        position={[profile.seatPos.x, 0, profile.seatPos.z]}
        rotation={[0, profile.deskYaw + Math.PI, 0]}
        scale={2.02}
        palette={{
          carpet: { color: selected ? '#115293' : '#263A4E', roughness: 0.8 },
          metalMedium: { color: '#465764', roughness: 0.45, metalness: 0.45 },
        }}
      />
    </group>
  );
}

export function WorkstationDesks({
  scene,
  mood,
  selectedAgent,
  reducedMotion,
  onSelectAgent,
}: {
  scene: OfficeSceneState;
  mood: LightingMood;
  selectedAgent: AgentId | null;
  reducedMotion: boolean;
  onSelectAgent: (id: AgentId) => void;
}) {
  return (
    <group>
      {AGENT_ORDER.map((id) => (
        <SingleWorkstation
          key={id}
          profile={AGENT_PROFILES[id]}
          agent={scene.agents[id]}
          mood={mood}
          selected={selectedAgent === id}
          reducedMotion={reducedMotion}
          onSelect={onSelectAgent}
        />
      ))}
    </group>
  );
}
