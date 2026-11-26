import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LightingMood } from '../state/officeLayout';
import { KenneyModel } from './KenneyModel';
import {
  createCanvasTexture,
  drawExteriorMonolith,
  loadBrandSvgImage,
} from './screenTextures';

interface CampusExteriorProps {
  mood: LightingMood;
  reducedMotion: boolean;
}

/**
 * Architectural sister pavilion in the DAT Alierta / Campus Río Ebro horizon:
 * matches the IDOM white concrete slabs + ribbon glass + terracotta fins aesthetic
 * instead of generic gray blocks!
 */
function SisterTechPavilion({
  position,
  rotationY = 0,
  size = [12, 7.5, 6.5],
  mood,
}: {
  position: [number, number, number];
  rotationY?: number;
  size?: [number, number, number];
  mood: LightingMood;
}) {
  const [w, h, d] = size;
  const slabColor = mood === 'night' ? '#36495E' : '#DCE4E8';
  const glassColor = mood === 'night' ? '#1A2D42' : '#7E9FB0';

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main glass body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.3, h, d - 0.3]} />
        <meshStandardMaterial color={glassColor} roughness={0.28} metalness={0.25} />
      </mesh>
      {/* 3 Horizontal cantilevered white slabs */}
      {[0.2, h * 0.36, h * 0.7, h].map((sy) => (
        <mesh key={sy} position={[0, sy, 0]} castShadow receiveShadow>
          <boxGeometry args={[w + 0.3, 0.3, d + 0.3]} />
          <meshStandardMaterial color={slabColor} roughness={0.75} />
        </mesh>
      ))}
      {/* Warm terracotta architectural accent band */}
      <mesh position={[0, h * 0.54, d / 2 - 0.05]}>
        <boxGeometry args={[w * 0.65, 0.42, 0.16]} />
        <meshStandardMaterial color="#B78770" roughness={0.78} />
      </mesh>
      {/* Illuminated interior office floor stripes in Night/Golden mood */}
      {mood !== 'day' &&
        [h * 0.2, h * 0.52, h * 0.84].map((wy, idx) => (
          <mesh key={wy} position={[0, wy, d / 2 - 0.1]}>
            <planeGeometry args={[w * 0.82, 0.85]} />
            <meshStandardMaterial
              color={idx === 1 ? '#FFE4AD' : '#A9DCF5'}
              emissive={idx === 1 ? '#FFD282' : '#58B6E8'}
              emissiveIntensity={mood === 'night' ? 0.72 : 0.22}
            />
          </mesh>
        ))}
    </group>
  );
}

function CampusVehicle({
  model,
  laneZ,
  direction,
  speed,
  offset,
  mood,
  reducedMotion,
}: {
  model: 'ext-cars/sedan' | 'ext-cars/suv-luxury' | 'ext-cars/hatchback-sports';
  laneZ: number;
  direction: 1 | -1;
  speed: number;
  offset: number;
  mood: LightingMood;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const span = 76;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const raw = (t * speed + offset) % span;
    ref.current.position.x = direction === 1 ? -span / 2 + raw : span / 2 - raw;
  });

  const headLightsOn = mood !== 'day';

  return (
    <group
      ref={ref}
      position={[offset - 28, -3.48, laneZ]}
      rotation={[0, direction === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <KenneyModel name={model} scale={1.22} preserveTexture />
      {headLightsOn && (
        <>
          <mesh position={[-0.58, 0.56, 1.56]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#FFF6CC" emissive="#FFF0A8" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[0.58, 0.56, 1.56]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#FFF6CC" emissive="#FFF0A8" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[-0.55, 0.58, -1.56]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FF4747" emissive="#FF3333" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0.55, 0.58, -1.56]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FF4747" emissive="#FF3333" emissiveIntensity={1.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

function CampusCyclist({ reducedMotion, mood }: { reducedMotion: boolean; mood: LightingMood }) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelFRef = useRef<THREE.Mesh>(null);
  const wheelRRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = reducedMotion ? 2 : clock.getElapsedTime();
    const span = 66;
    groupRef.current.position.x = -span / 2 + ((t * 2.8 + 20) % span);
    if (!reducedMotion && wheelFRef.current && wheelRRef.current) {
      wheelFRef.current.rotation.z = -t * 7.2;
      wheelRRef.current.rotation.z = -t * 7.2;
    }
  });

  return (
    <group ref={groupRef} position={[4, -3.48, -13.9]}>
      <mesh ref={wheelRRef} position={[-0.45, 0.34, 0]} castShadow>
        <torusGeometry args={[0.32, 0.036, 8, 18]} />
        <meshStandardMaterial color="#1F2A33" roughness={0.7} />
      </mesh>
      <mesh ref={wheelFRef} position={[0.45, 0.34, 0]} castShadow>
        <torusGeometry args={[0.32, 0.036, 8, 18]} />
        <meshStandardMaterial color="#1F2A33" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.78, 0.045, 0.045]} />
        <meshStandardMaterial color="#00B0F0" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.36, 0.62, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[0.045, 0.58, 0.045]} />
        <meshStandardMaterial color="#1D2B38" />
      </mesh>
      <mesh position={[-0.08, 0.85, 0]} rotation={[0, 0, -0.32]} castShadow>
        <capsuleGeometry args={[0.13, 0.28, 6, 10]} />
        <meshStandardMaterial color="#1F3652" roughness={0.75} />
      </mesh>
      <mesh position={[-0.22, 0.95, 0]} rotation={[0, 0, -0.32]} castShadow>
        <boxGeometry args={[0.14, 0.28, 0.22]} />
        <meshStandardMaterial color="#34495E" roughness={0.8} />
      </mesh>
      <mesh position={[0.04, 1.24, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#E6BA9C" roughness={0.72} />
      </mesh>
      <mesh position={[0.03, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.142, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {mood !== 'day' && (
        <mesh position={[0.48, 0.78, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FFF7C8" emissive="#FFF0A8" emissiveIntensity={2.0} />
        </mesh>
      )}
    </group>
  );
}

function CampusWalker({
  pathZ,
  direction,
  speed,
  offset,
  coatColor,
  reducedMotion,
}: {
  pathZ: number;
  direction: 1 | -1;
  speed: number;
  offset: number;
  coatColor: string;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    const t = reducedMotion ? 1.2 : clock.getElapsedTime();
    const span = 52;
    const raw = (t * speed + offset) % span;
    rootRef.current.position.x = direction === 1 ? -span / 2 + raw : span / 2 - raw;
    if (!reducedMotion && leftLegRef.current && rightLegRef.current) {
      const s = Math.sin(t * 5.2 + offset) * 0.42;
      leftLegRef.current.rotation.z = s;
      rightLegRef.current.rotation.z = -s;
    }
  });

  return (
    <group ref={rootRef} position={[0, -3.48, pathZ]}>
      <mesh ref={leftLegRef} position={[0, 0.34, -0.08]} castShadow>
        <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
        <meshStandardMaterial color="#253240" roughness={0.85} />
      </mesh>
      <mesh ref={rightLegRef} position={[0, 0.34, 0.08]} castShadow>
        <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
        <meshStandardMaterial color="#253240" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.145, 0.34, 6, 10]} />
        <meshStandardMaterial color={coatColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.34, 0]} castShadow>
        <sphereGeometry args={[0.135, 12, 10]} />
        <meshStandardMaterial color="#E2B496" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.142, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        <meshStandardMaterial color="#3B2A22" roughness={0.85} />
      </mesh>
    </group>
  );
}

function DriftingClouds({ mood, reducedMotion }: { mood: LightingMood; reducedMotion: boolean }) {
  const c1 = useRef<THREE.Group>(null);
  const c2 = useRef<THREE.Group>(null);
  const c3 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (c1.current) c1.current.position.x = -36 + ((t * 0.45 + 10) % 76);
    if (c2.current) c2.current.position.x = -36 + ((t * 0.32 + 38) % 76);
    if (c3.current) c3.current.position.x = -36 + ((t * 0.38 + 58) % 76);
  });

  if (mood === 'night') return null;

  const cloudColor = mood === 'golden' ? '#FFE2C7' : '#FFFFFF';
  const cloudOpacity = mood === 'golden' ? 0.58 : 0.65;

  return (
    <group>
      {[
        { ref: c1, pos: [-14, 12.5, -26] as [number, number, number], s: 1.35 },
        { ref: c2, pos: [10, 13.8, -30] as [number, number, number], s: 1.65 },
        { ref: c3, pos: [-26, 12.0, -14] as [number, number, number], s: 1.15 },
      ].map((c, idx) => (
        <group key={idx} ref={c.ref} position={c.pos} scale={c.s}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[1.1, -0.15, 0.1]}>
            <sphereGeometry args={[0.88, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[-1.05, -0.2, -0.1]}>
            <sphereGeometry args={[0.82, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Grand Multi-Story DAT Alierta 2029 Campus Surrounding the 28m x 20m Cutaway HQ:
 * - Matching 28m x 20m Ground-Floor Podium + Warm Lobby + Terracotta Louvers + Rooftop Solar Deck
 * - Exterior Entrance Monolith with Real Integra White SVG Logo
 * - EV Charging Parking Lot with 3 Parked CC0 Cars + Glowing Cyan EV Chargers
 * - Sister Architectural Tech Park Pavilions (IDOM aesthetic)
 * - Seamlessly fog-blended 96m x 86m park meadow, avenue, bike lane, cyclist, cruising cars & walkers
 */
export function CampusExterior({ mood, reducedMotion }: CampusExteriorProps) {
  const [logoWhite, setLogoWhite] = useState<HTMLImageElement | null>(null);
  const monolithTex = useMemo(() => createCanvasTexture(320, 320), []);

  useEffect(() => {
    let mounted = true;
    loadBrandSvgImage('/assets/branding/logo-integra-blanco.svg')
      .then((img) => {
        if (mounted) setLogoWhite(img);
      })
      .catch(() => {});
    return () => {
      mounted = false;
      monolithTex.texture.dispose();
    };
  }, [monolithTex]);

  useEffect(() => {
    drawExteriorMonolith(monolithTex.ctx, logoWhite);
    monolithTex.texture.needsUpdate = true;
  }, [logoWhite, monolithTex]);

  const lobbyGlow = mood === 'night' ? 1.35 : mood === 'golden' ? 0.65 : 0.18;
  const lampGlow = mood === 'night' ? 2.1 : mood === 'golden' ? 0.95 : 0.0;
  const grassTint = mood === 'night' ? '#2B3E2B' : mood === 'golden' ? '#8C9B60' : '#8CA66A';
  const roadColor = mood === 'night' ? '#252F3A' : '#4C5660';
  const plazaColor = mood === 'night' ? '#4F5C6A' : '#DFE3DF';

  const parkTrees = useMemo(
    () => [
      { model: 'ext/tree_detailed', pos: [-19.5, -3.48, -12.5] as [number, number, number], scale: 3.4, rot: 0.4 },
      { model: 'ext/tree_oak', pos: [-19.0, -3.48, -4.5] as [number, number, number], scale: 3.5, rot: 1.2 },
      { model: 'ext/tree_default_fall', pos: [-20.2, -3.48, 5.2] as [number, number, number], scale: 3.3, rot: 0.7 },
      { model: 'ext/tree_plateau', pos: [-16.5, -3.48, 13.8] as [number, number, number], scale: 3.2, rot: 2.1 },
      { model: 'ext/tree_detailed', pos: [-9.2, -3.48, -12.4] as [number, number, number], scale: 3.1, rot: 0.9 },
      { model: 'ext/tree_tall', pos: [0.4, -3.48, -12.3] as [number, number, number], scale: 3.2, rot: 1.5 },
      { model: 'ext/tree_oak', pos: [10.2, -3.48, -12.4] as [number, number, number], scale: 3.4, rot: 0.2 },
      { model: 'ext/tree_default_fall', pos: [19.8, -3.48, -11.5] as [number, number, number], scale: 3.4, rot: 1.9 },
      { model: 'ext/tree_detailed', pos: [21.0, -3.48, -2.5] as [number, number, number], scale: 3.5, rot: 2.7 },
      { model: 'ext/tree_plateau', pos: [19.2, -3.48, 7.6] as [number, number, number], scale: 3.1, rot: 0.6 },
      { model: 'ext/tree_oak', pos: [10.5, -3.48, 14.5] as [number, number, number], scale: 3.0, rot: 1.1 },
      { model: 'ext/tree_tall', pos: [-1.5, -3.48, 14.8] as [number, number, number], scale: 2.9, rot: 2.3 },
      { model: 'ext/tree_oak', pos: [-14.0, -3.48, -23.5] as [number, number, number], scale: 3.6, rot: 0.5 },
      { model: 'ext/tree_detailed', pos: [-1.0, -3.48, -24.0] as [number, number, number], scale: 3.6, rot: 1.4 },
      { model: 'ext/tree_default_fall', pos: [14.5, -3.48, -23.5] as [number, number, number], scale: 3.5, rot: 2.2 },
    ],
    []
  );

  return (
    <group>
      {/* ==================== 28m x 20m GROUND-FLOOR ARCHITECTURAL PODIUM (Y = -3.48 to -0.36) ==================== */}
      <group>
        <mesh position={[0, -3.4, 0]} receiveShadow>
          <boxGeometry args={[29.8, 0.2, 21.8]} />
          <meshStandardMaterial color="#E6EAE8" roughness={0.8} />
        </mesh>

        {/* Ground-floor recessed glass atrium shell */}
        <mesh position={[0, -1.88, 0]} castShadow receiveShadow>
          <boxGeometry args={[27.8, 2.95, 19.8]} />
          <meshStandardMaterial color="#1F3447" roughness={0.32} metalness={0.25} />
        </mesh>

        {/* Warm illuminated ground-floor lobby windows */}
        <mesh position={[0, -1.84, 9.93]}>
          <planeGeometry args={[26.6, 2.25]} />
          <meshStandardMaterial
            color={mood === 'night' ? '#FFE2B3' : '#95B7C6'}
            emissive="#FFCF86"
            emissiveIntensity={lobbyGlow}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[13.93, -1.84, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[18.6, 2.25]} />
          <meshStandardMaterial
            color={mood === 'night' ? '#FFE2B3' : '#95B7C6'}
            emissive="#FFCF86"
            emissiveIntensity={lobbyGlow}
            roughness={0.22}
          />
        </mesh>

        {/* Structural white columns around Ground Floor */}
        {[-12.8, -8.5, -4.2, 0, 4.2, 8.5, 12.8].map((cx) => (
          <mesh key={`col-s-${cx}`} position={[cx, -1.88, 10.02]} castShadow>
            <boxGeometry args={[0.28, 3.08, 0.28]} />
            <meshStandardMaterial color="#F2F4F3" roughness={0.72} />
          </mesh>
        ))}
        {[-8.4, -4.2, 0, 4.2, 8.4].map((cz) => (
          <mesh key={`col-e-${cz}`} position={[14.02, -1.88, cz]} castShadow>
            <boxGeometry args={[0.28, 3.08, 0.28]} />
            <meshStandardMaterial color="#F2F4F3" roughness={0.72} />
          </mesh>
        ))}

        {/* Horizontal terracotta louver spandrel bands wrapping Ground Floor */}
        {[-0.68, -0.92, -1.16].map((ly) => (
          <group key={ly}>
            <mesh position={[0, ly, 10.08]} castShadow>
              <boxGeometry args={[28.3, 0.085, 0.14]} />
              <meshStandardMaterial color="#B78770" roughness={0.78} />
            </mesh>
            <mesh position={[14.08, ly, 0]} castShadow>
              <boxGeometry args={[0.14, 0.085, 20.3]} />
              <meshStandardMaterial color="#B78770" roughness={0.78} />
            </mesh>
          </group>
        ))}

        {/* Structural columns supporting the cantilevered East Terrace (X = +16.2, Z = -5.2) */}
        {[-8.6, -1.8].map((cz) => (
          <mesh key={cz} position={[18.1, -1.86, cz]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 3.15, 12]} />
            <meshStandardMaterial color="#E8ECEB" roughness={0.68} />
          </mesh>
        ))}

        {/* Grand Main Entrance Canopy on South-West corner */}
        <group position={[-10.2, -1.1, 11.25]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.8, 0.24, 2.4]} />
            <meshStandardMaterial color="#F5F7F6" roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.02, 1.22]}>
            <boxGeometry args={[5.5, 0.09, 0.04]} />
            <meshStandardMaterial
              color="#00B0F0"
              emissive="#00B0F0"
              emissiveIntensity={mood === 'night' ? 1.8 : 0.45}
            />
          </mesh>
          {[-2.55, 2.55].map((px) => (
            <mesh key={px} position={[px, -1.2, 0.95]} castShadow>
              <cylinderGeometry args={[0.085, 0.085, 2.38, 10]} />
              <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.5} />
            </mesh>
          ))}
        </group>

        {/* Sustainable Upper Roof Solar Array behind North-West edge */}
        <group position={[-5.5, 3.84, -10.75]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[14.0, 0.18, 1.65]} />
            <meshStandardMaterial color="#EFF2F1" roughness={0.75} />
          </mesh>
          {[-5.4, -3.2, -1.0, 1.2, 3.4, 5.6].map((sx) => (
            <mesh key={sx} position={[sx, 0.28, -0.05]} rotation={[0.32, 0, 0]} castShadow>
              <boxGeometry args={[1.65, 0.05, 1.0]} />
              <meshStandardMaterial color="#18385E" roughness={0.22} metalness={0.65} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================== EXPANSIVE SEAMLESS DAT ALIERTA CAMPUS GROUNDS (104m x 96m) ==================== */}
      <group>
        {/* Broad park meadow softly dissolving into scene fog */}
        <mesh position={[0, -3.65, -4.0]} receiveShadow>
          <boxGeometry args={[112, 0.34, 104]} />
          <meshStandardMaterial color={grassTint} roughness={0.96} />
        </mesh>

        {/* Architectural Light-Stone Campus Plaza surrounding the building */}
        <mesh position={[1.0, -3.47, 0.6]} receiveShadow>
          <boxGeometry args={[39.0, 0.06, 29.0]} />
          <meshStandardMaterial color={plazaColor} roughness={0.86} />
        </mesh>

        {/* Exterior DAT Alierta · INTEGRA Entrance Monolith Sign */}
        <group position={[-15.2, -3.44, 12.2]} rotation={[0, 0.35, 0]}>
          <mesh position={[0, 1.45, 0]} castShadow>
            <boxGeometry args={[1.95, 2.9, 0.36]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.42} />
          </mesh>
          <mesh position={[0, 1.5, 0.19]}>
            <planeGeometry args={[1.82, 2.45]} />
            <meshStandardMaterial
              map={monolithTex.texture}
              emissive="#FFFFFF"
              emissiveMap={monolithTex.texture}
              emissiveIntensity={mood === 'night' ? 0.55 : 0.08}
              roughness={0.28}
            />
          </mesh>
        </group>

        {/* Tranquil Shallow Reflecting Pool outside Reception Entrance */}
        <group position={[-10.2, -3.45, 14.8]}>
          <mesh receiveShadow>
            <boxGeometry args={[6.8, 0.08, 2.5]} />
            <meshStandardMaterial color="#CDD5D7" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.4, 2.1]} />
            <meshPhysicalMaterial
              color={mood === 'night' ? '#173A57' : '#6DB6CC'}
              roughness={0.08}
              metalness={0.14}
              reflectivity={0.85}
            />
          </mesh>
        </group>

        {/* EV Charging Parking Bay (West/South-West plaza edge with 3 parked CC0 cars + cyan EV posts!) */}
        <group position={[-22.5, -3.46, 0.5]}>
          <mesh receiveShadow>
            <boxGeometry args={[6.4, 0.04, 13.5]} />
            <meshStandardMaterial color={roadColor} roughness={0.9} />
          </mesh>
          {[-4.2, -1.4, 1.4, 4.2].map((pz, idx) => (
            <group key={pz} position={[0, 0.02, pz]}>
              <mesh position={[0, 0.01, -1.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[5.4, 0.09]} />
                <meshBasicMaterial color="#DCE6EC" transparent opacity={0.75} />
              </mesh>
              {/* Sleek EV Charging Post */}
              <mesh position={[-2.65, 0.65, 0]} castShadow>
                <boxGeometry args={[0.24, 1.3, 0.24]} />
                <meshStandardMaterial color="#1C2E40" roughness={0.4} />
              </mesh>
              <mesh position={[-2.52, 0.92, 0]}>
                <boxGeometry args={[0.04, 0.34, 0.14]} />
                <meshStandardMaterial
                  color="#00B0F0"
                  emissive="#00B0F0"
                  emissiveIntensity={mood === 'night' ? 1.8 : 0.7}
                />
              </mesh>
              {idx < 3 && (
                <KenneyModel
                  name={idx === 0 ? 'ext-cars/sedan' : idx === 1 ? 'ext-cars/suv-luxury' : 'ext-cars/hatchback-sports'}
                  position={[0.3, 0, 0]}
                  rotation={[0, -Math.PI / 2, 0]}
                  scale={1.15}
                  preserveTexture
                />
              )}
            </group>
          ))}
        </group>

        {/* Paved Bike & Pedestrian Promenade along North side */}
        <mesh position={[0, -3.46, -13.9]} receiveShadow>
          <boxGeometry args={[92, 0.04, 2.8]} />
          <meshStandardMaterial color={mood === 'night' ? '#495562' : '#D2D7D5'} roughness={0.86} />
        </mesh>
        <mesh position={[0, -3.435, -13.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[92, 1.0]} />
          <meshStandardMaterial color={mood === 'night' ? '#255360' : '#65A4AC'} roughness={0.88} />
        </mesh>

        {/* 2-Lane DAT Alierta Campus Avenue (Z = -18.8) */}
        <mesh position={[0, -3.46, -18.8]} receiveShadow>
          <boxGeometry args={[108, 0.04, 5.8]} />
          <meshStandardMaterial color={roadColor} roughness={0.9} />
        </mesh>
        {Array.from({ length: 24 }, (_, i) => -44 + i * 3.8).map((rx) => (
          <mesh key={rx} position={[rx, -3.43, -18.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.7, 0.15]} />
            <meshBasicMaterial color="#E6ECEF" transparent opacity={0.75} />
          </mesh>
        ))}

        {/* South Pedestrian Promenade */}
        <mesh position={[0, -3.46, 12.8]} receiveShadow>
          <boxGeometry args={[80, 0.04, 2.4]} />
          <meshStandardMaterial color={mood === 'night' ? '#495562' : '#D7DCD9'} roughness={0.88} />
        </mesh>

        {/* Park Benches + Relaxed Seated Campus Visitor */}
        {[-3.2, 4.2, 12.6].map((bx, i) => (
          <group key={`bench-${bx}`} position={[bx, -3.44, 11.4]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[1.75, 0.08, 0.5]} />
              <meshStandardMaterial color="#C8AC85" roughness={0.75} />
            </mesh>
            {[-0.7, 0.7].map((lx) => (
              <mesh key={lx} position={[lx, 0.2, 0]} castShadow>
                <boxGeometry args={[0.08, 0.4, 0.44]} />
                <meshStandardMaterial color="#2C3842" roughness={0.45} metalness={0.5} />
              </mesh>
            ))}
            {i === 1 && (
              /* Campus visitor seated relaxing on bench */
              <group position={[0.2, 0.46, 0]}>
                <mesh position={[0, 0.34, 0]} castShadow>
                  <capsuleGeometry args={[0.13, 0.28, 6, 8]} />
                  <meshStandardMaterial color="#2F6657" roughness={0.75} />
                </mesh>
                <mesh position={[0, 0.72, 0]} castShadow>
                  <sphereGeometry args={[0.125, 10, 10]} />
                  <meshStandardMaterial color="#E2B596" roughness={0.72} />
                </mesh>
              </group>
            )}
          </group>
        ))}

        {/* Slim Angled IDOM Campus Streetlamps */}
        {[-16, -8, 0, 8, 16, 23].map((lx) => (
          <group key={`lamp-n-${lx}`} position={[lx, -3.44, -15.4]}>
            <mesh position={[0, 2.25, 0]} castShadow>
              <cylinderGeometry args={[0.044, 0.055, 4.5, 8]} />
              <meshStandardMaterial color="#2C363F" roughness={0.42} metalness={0.55} />
            </mesh>
            <mesh position={[0.26, 4.56, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.76, 0.055, 0.08]} />
              <meshStandardMaterial color="#2C363F" roughness={0.42} metalness={0.55} />
            </mesh>
            <mesh position={[0.45, 4.62, 0]}>
              <boxGeometry args={[0.3, 0.045, 0.11]} />
              <meshStandardMaterial
                color="#FFF5D6"
                emissive="#FFE196"
                emissiveIntensity={lampGlow}
              />
            </mesh>
          </group>
        ))}

        {/* Curated Kenney CC0 Nature Kit Trees & Shrubs */}
        {parkTrees.map((t, idx) => (
          <KenneyModel
            key={`tree-${idx}`}
            name={t.model}
            position={t.pos}
            rotation={[0, t.rot, 0]}
            scale={t.scale}
          />
        ))}

        {[
          [-16.2, -11.0],
          [-11.8, -11.4],
          [5.4, -11.4],
          [16.2, -10.8],
          [19.5, 2.2],
          [-15.8, 8.8],
          [2.4, 14.0],
          [14.2, 13.8],
        ].map(([bx, bz], i) => (
          <group key={`bush-${i}`} position={[bx, -3.46, bz]}>
            <KenneyModel
              name={i % 2 === 0 ? 'ext/plant_bushDetailed' : 'ext/plant_bushLarge'}
              scale={2.35}
            />
            <KenneyModel name="ext/grass_large" position={[0.7, 0, 0.4]} scale={2.2} />
          </group>
        ))}

        {/* Modern Architectural Sister Tech Pavilions framing DAT Alierta Horizon */}
        <SisterTechPavilion position={[-19.5, -3.46, -28.5]} size={[13, 8.2, 7.0]} mood={mood} />
        <SisterTechPavilion position={[-2.5, -3.46, -29.5]} size={[15, 6.8, 6.8]} mood={mood} />
        <SisterTechPavilion position={[16.0, -3.46, -28.8]} size={[14, 7.6, 6.8]} mood={mood} />
        <SisterTechPavilion
          position={[-31.0, -3.46, -6.0]}
          rotationY={Math.PI / 2}
          size={[15, 7.2, 7.0]}
          mood={mood}
        />
      </group>

      {/* ==================== LIVING EXTERIOR MICRO-SIMULATION ==================== */}
      <CampusVehicle
        model="ext-cars/sedan"
        laneZ={-17.4}
        direction={1}
        speed={5.2}
        offset={8}
        mood={mood}
        reducedMotion={reducedMotion}
      />
      <CampusVehicle
        model="ext-cars/suv-luxury"
        laneZ={-20.1}
        direction={-1}
        speed={4.3}
        offset={34}
        mood={mood}
        reducedMotion={reducedMotion}
      />
      <CampusVehicle
        model="ext-cars/hatchback-sports"
        laneZ={-17.4}
        direction={1}
        speed={5.2}
        offset={48}
        mood={mood}
        reducedMotion={reducedMotion}
      />

      <CampusCyclist reducedMotion={reducedMotion} mood={mood} />

      <CampusWalker
        pathZ={12.8}
        direction={1}
        speed={1.1}
        offset={5}
        coatColor="#115293"
        reducedMotion={reducedMotion}
      />
      <CampusWalker
        pathZ={13.2}
        direction={-1}
        speed={0.95}
        offset={28}
        coatColor="#B78770"
        reducedMotion={reducedMotion}
      />

      <DriftingClouds mood={mood} reducedMotion={reducedMotion} />
    </group>
  );
}
