import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LightingMood } from '../state/officeLayout';
import { KenneyModel } from './KenneyModel';

interface CampusExteriorProps {
  mood: LightingMood;
  reducedMotion: boolean;
}

/**
 * Animated cruising CC0 vehicle along the DAT Alierta campus avenue (Z = -13.2 or -15.6).
 */
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
  const span = 52;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const raw = (t * speed + offset) % span;
    const x = direction === 1 ? -span / 2 + raw : span / 2 - raw;
    ref.current.position.x = x;
  });

  const headLightsOn = mood !== 'day';

  return (
    <group
      ref={ref}
      position={[offset - 20, -3.28, laneZ]}
      rotation={[0, direction === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <KenneyModel name={model} scale={1.15} preserveTexture />
      {headLightsOn && (
        <>
          <mesh position={[-0.55, 0.55, 1.48]}>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshBasicMaterial color="#FFF6CC" />
          </mesh>
          <mesh position={[0.55, 0.55, 1.48]}>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshBasicMaterial color="#FFF6CC" />
          </mesh>
          <mesh position={[-0.52, 0.56, -1.48]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color="#FF4747" />
          </mesh>
          <mesh position={[0.52, 0.56, -1.48]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color="#FF4747" />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Direct homage to the cyclist in IDOM's official DAT Alierta architectural render:
 * rides smoothly along the landscaped bike promenade outside the office windows.
 */
function CampusCyclist({
  reducedMotion,
  mood,
}: {
  reducedMotion: boolean;
  mood: LightingMood;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelFRef = useRef<THREE.Mesh>(null);
  const wheelRRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = reducedMotion ? 2 : clock.getElapsedTime();
    const span = 44;
    const x = -span / 2 + ((t * 2.5 + 14) % span);
    groupRef.current.position.x = x;
    if (!reducedMotion && wheelFRef.current && wheelRRef.current) {
      wheelFRef.current.rotation.z = -t * 7;
      wheelRRef.current.rotation.z = -t * 7;
    }
  });

  return (
    <group ref={groupRef} position={[4, -3.28, -9.85]}>
      {/* Rear & Front Bicycle Wheels */}
      <mesh ref={wheelRRef} position={[-0.45, 0.34, 0]} castShadow>
        <torusGeometry args={[0.32, 0.035, 8, 18]} />
        <meshStandardMaterial color="#1F2A33" roughness={0.7} />
      </mesh>
      <mesh ref={wheelFRef} position={[0.45, 0.34, 0]} castShadow>
        <torusGeometry args={[0.32, 0.035, 8, 18]} />
        <meshStandardMaterial color="#1F2A33" roughness={0.7} />
      </mesh>
      {/* Sleek Integra Cyan Bike Frame */}
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.78, 0.045, 0.045]} />
        <meshStandardMaterial color="#00B0F0" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.36, 0.62, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[0.045, 0.58, 0.045]} />
        <meshStandardMaterial color="#1D2B38" />
      </mesh>
      <mesh position={[0.32, 0.9, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.38]} />
        <meshStandardMaterial color="#1D2B38" />
      </mesh>
      {/* Rider with dark jacket, backpack & helmet */}
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
      {/* Helmet */}
      <mesh position={[0.03, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.142, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>
      {mood !== 'day' && (
        <mesh position={[0.48, 0.78, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#FFF7C8" />
        </mesh>
      )}
    </group>
  );
}

/**
 * Strolling campus pedestrian walking along the outer landscaped park walkway.
 */
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
    const span = 38;
    const raw = (t * speed + offset) % span;
    const x = direction === 1 ? -span / 2 + raw : span / 2 - raw;
    rootRef.current.position.x = x;
    if (!reducedMotion && leftLegRef.current && rightLegRef.current) {
      const s = Math.sin(t * 5.2 + offset) * 0.42;
      leftLegRef.current.rotation.z = s;
      rightLegRef.current.rotation.z = -s;
    }
  });

  return (
    <group ref={rootRef} position={[0, -3.28, pathZ]}>
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

/**
 * Gentle drifting atmospheric clouds floating high above the DAT Alierta campus.
 */
function DriftingClouds({ mood, reducedMotion }: { mood: LightingMood; reducedMotion: boolean }) {
  const c1 = useRef<THREE.Group>(null);
  const c2 = useRef<THREE.Group>(null);
  const c3 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (c1.current) c1.current.position.x = -26 + ((t * 0.45 + 10) % 54);
    if (c2.current) c2.current.position.x = -26 + ((t * 0.32 + 29) % 54);
    if (c3.current) c3.current.position.x = -26 + ((t * 0.38 + 42) % 54);
  });

  if (mood === 'night') return null;

  const cloudColor = mood === 'golden' ? '#FFE2C7' : '#FFFFFF';
  const cloudOpacity = mood === 'golden' ? 0.62 : 0.7;

  return (
    <group>
      {[
        { ref: c1, pos: [-10, 9.5, -18] as [number, number, number], s: 1.1 },
        { ref: c2, pos: [6, 10.6, -21] as [number, number, number], s: 1.35 },
        { ref: c3, pos: [-18, 9.2, -10] as [number, number, number], s: 0.9 },
      ].map((c, idx) => (
        <group key={idx} ref={c.ref} position={c.pos} scale={c.s}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.15, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[1.05, -0.15, 0.1]}>
            <sphereGeometry args={[0.85, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
          <mesh position={[-1.0, -0.2, -0.1]}>
            <sphereGeometry args={[0.8, 12, 10]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Full DAT Alierta 2029 Multi-Story Campus Diorama surrounding the active cutaway office floor:
 * - Ground floor architectural podium + recessed illuminated lobby + terracotta louvers
 * - Partial upper rooftop terrace deck with solar panels & rooftop greenery
 * - Campus plaza, reflecting pool, bike lane, avenue, CC0 Kenney trees/vehicles/pavilions
 * - "Vida mínima" exterior simulation (cars, IDOM cyclist, campus pedestrians, drifting clouds)
 */
export function CampusExterior({ mood, reducedMotion }: CampusExteriorProps) {
  const lobbyGlow = mood === 'night' ? 1.25 : mood === 'golden' ? 0.65 : 0.18;
  const lampGlow = mood === 'night' ? 1.8 : mood === 'golden' ? 0.85 : 0.0;
  const grassTint = mood === 'night' ? '#364A35' : mood === 'golden' ? '#8E9B63' : '#8CA66A';
  const roadColor = mood === 'night' ? '#2A333E' : '#4C5660';
  const plazaColor = mood === 'night' ? '#586470' : '#DFE3DF';

  const parkTrees = useMemo(
    () => [
      { model: 'ext/tree_detailed', pos: [-14.2, -3.28, -9.5] as [number, number, number], scale: 3.1, rot: 0.4 },
      { model: 'ext/tree_oak', pos: [-13.5, -3.28, -3.5] as [number, number, number], scale: 3.2, rot: 1.2 },
      { model: 'ext/tree_default_fall', pos: [-14.8, -3.28, 3.8] as [number, number, number], scale: 2.9, rot: 0.7 },
      { model: 'ext/tree_plateau', pos: [-11.8, -3.28, 9.2] as [number, number, number], scale: 3.0, rot: 2.1 },
      { model: 'ext/tree_detailed', pos: [-5.4, -3.28, -9.1] as [number, number, number], scale: 2.8, rot: 0.9 },
      { model: 'ext/tree_tall', pos: [1.8, -3.28, -9.2] as [number, number, number], scale: 2.9, rot: 1.5 },
      { model: 'ext/tree_oak', pos: [8.4, -3.28, -9.3] as [number, number, number], scale: 3.1, rot: 0.2 },
      { model: 'ext/tree_default_fall', pos: [13.2, -3.28, -8.5] as [number, number, number], scale: 3.0, rot: 1.9 },
      { model: 'ext/tree_detailed', pos: [13.6, -3.28, -2.0] as [number, number, number], scale: 3.2, rot: 2.7 },
      { model: 'ext/tree_plateau', pos: [12.8, -3.28, 5.2] as [number, number, number], scale: 2.8, rot: 0.6 },
      { model: 'ext/tree_oak', pos: [6.5, -3.28, 10.6] as [number, number, number], scale: 2.7, rot: 1.1 },
      { model: 'ext/tree_tall', pos: [-3.2, -3.28, 10.8] as [number, number, number], scale: 2.6, rot: 2.3 },
      // Trees across the campus avenue framing the tech park horizon
      { model: 'ext/tree_oak', pos: [-10.5, -3.28, -19.0] as [number, number, number], scale: 3.4, rot: 0.5 },
      { model: 'ext/tree_detailed', pos: [-1.5, -3.28, -19.5] as [number, number, number], scale: 3.3, rot: 1.4 },
      { model: 'ext/tree_default_fall', pos: [10.5, -3.28, -19.2] as [number, number, number], scale: 3.2, rot: 2.2 },
    ],
    []
  );

  return (
    <group>
      {/* ==================== GROUND-FLOOR PODIUM OF DAT ALIERTA BUILDING (Y = -3.28 to -0.34) ==================== */}
      <group>
        {/* Ground-floor architectural concrete slab plinth */}
        <mesh position={[0, -3.22, 0]} receiveShadow>
          <boxGeometry args={[19.4, 0.2, 14.4]} />
          <meshStandardMaterial color="#E6EAE8" roughness={0.8} />
        </mesh>

        {/* Ground-floor recessed glass atrium/lobby shell */}
        <mesh position={[0, -1.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[17.8, 2.76, 12.8]} />
          <meshStandardMaterial color="#1F3447" roughness={0.32} metalness={0.25} />
        </mesh>

        {/* Warm illuminated ground-floor lobby interior strip visible through glass */}
        <mesh position={[0, -1.75, 6.42]}>
          <planeGeometry args={[16.8, 2.1]} />
          <meshStandardMaterial
            color={mood === 'night' ? '#FFE2B3' : '#95B7C6'}
            emissive="#FFCF86"
            emissiveIntensity={lobbyGlow}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[8.92, -1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[11.8, 2.1]} />
          <meshStandardMaterial
            color={mood === 'night' ? '#FFE2B3' : '#95B7C6'}
            emissive="#FFCF86"
            emissiveIntensity={lobbyGlow}
            roughness={0.22}
          />
        </mesh>

        {/* Lower-floor vertical architectural mullions & terracotta spandrel rhythm */}
        {[-8.2, -5.4, -2.7, 0, 2.7, 5.4, 8.2].map((cx) => (
          <mesh key={`col-s-${cx}`} position={[cx, -1.78, 6.52]} castShadow>
            <boxGeometry args={[0.24, 2.9, 0.26]} />
            <meshStandardMaterial color="#F2F4F3" roughness={0.72} />
          </mesh>
        ))}
        {[-5.6, -2.8, 0, 2.8, 5.6].map((cz) => (
          <mesh key={`col-e-${cz}`} position={[9.02, -1.78, cz]} castShadow>
            <boxGeometry args={[0.26, 2.9, 0.24]} />
            <meshStandardMaterial color="#F2F4F3" roughness={0.72} />
          </mesh>
        ))}

        {/* Horizontal terracotta ceramic louver bands wrapping the ground floor (IDOM signature) */}
        {[-0.65, -0.88, -1.11].map((ly) => (
          <group key={ly}>
            <mesh position={[0, ly, 6.58]} castShadow>
              <boxGeometry args={[18.2, 0.085, 0.14]} />
              <meshStandardMaterial color="#B78770" roughness={0.78} />
            </mesh>
            <mesh position={[9.08, ly, 0]} castShadow>
              <boxGeometry args={[0.14, 0.085, 13.2]} />
              <meshStandardMaterial color="#B78770" roughness={0.78} />
            </mesh>
          </group>
        ))}

        {/* Ground-level Main Entrance Canopy + Integra Cyan Accent Strip on South-West corner */}
        <group position={[-6.4, -1.05, 7.6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.4, 0.22, 2.1]} />
            <meshStandardMaterial color="#F5F7F6" roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.02, 1.07]}>
            <boxGeometry args={[4.2, 0.08, 0.04]} />
            <meshStandardMaterial
              color="#00B0F0"
              emissive="#00B0F0"
              emissiveIntensity={mood === 'night' ? 1.1 : 0.35}
            />
          </mesh>
          {[-1.95, 1.95].map((px) => (
            <mesh key={px} position={[px, -1.12, 0.82]} castShadow>
              <cylinderGeometry args={[0.075, 0.075, 2.2, 10]} />
              <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.5} />
            </mesh>
          ))}
        </group>

        {/* Partial Sustainable Upper Roof Overhang + Solar Panels behind North-West edge (never blocks interior) */}
        <group position={[-4.8, 3.65, -7.15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8.8, 0.18, 1.5]} />
            <meshStandardMaterial color="#EFF2F1" roughness={0.75} />
          </mesh>
          {[-3.0, -1.0, 1.0, 3.0].map((sx) => (
            <mesh key={sx} position={[sx, 0.26, -0.05]} rotation={[0.32, 0, 0]} castShadow>
              <boxGeometry args={[1.55, 0.05, 0.95]} />
              <meshStandardMaterial color="#18385E" roughness={0.22} metalness={0.65} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================== EXPANDED DAT ALIERTA CAMPUS GROUNDS (56m x 46m) ==================== */}
      <group>
        {/* Main Zaragoza park meadow base */}
        <mesh position={[0, -3.45, -3.0]} receiveShadow>
          <boxGeometry args={[62, 0.34, 52]} />
          <meshStandardMaterial color={grassTint} roughness={0.96} />
        </mesh>

        {/* Architectural Light-Stone Campus Plaza surrounding the building */}
        <mesh position={[0, -3.27, 0.4]} receiveShadow>
          <boxGeometry args={[26.5, 0.06, 20.5]} />
          <meshStandardMaterial color={plazaColor} roughness={0.85} />
        </mesh>

        {/* Tranquil Shallow Reflecting Pool outside Reception entrance */}
        <group position={[-6.4, -3.25, 10.6]}>
          <mesh receiveShadow>
            <boxGeometry args={[5.4, 0.08, 2.2]} />
            <meshStandardMaterial color="#CDD5D7" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <planeGeometry args={[5.0, 1.82]} />
            <meshPhysicalMaterial
              color={mood === 'night' ? '#173A57' : '#6DB6CC'}
              roughness={0.08}
              metalness={0.12}
              reflectivity={0.85}
            />
          </mesh>
        </group>

        {/* Paved Pedestrian & Bike Promenade along North side (IDOM render homage) */}
        <mesh position={[0, -3.26, -9.85]} receiveShadow>
          <boxGeometry args={[54, 0.04, 2.6]} />
          <meshStandardMaterial color={mood === 'night' ? '#4F5A66' : '#D2D7D5'} roughness={0.86} />
        </mesh>
        {/* Subtle Integra-teal painted bike lane strip */}
        <mesh position={[0, -3.235, -9.85]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[54, 0.95]} />
          <meshStandardMaterial color={mood === 'night' ? '#255360' : '#65A4AC'} roughness={0.88} />
        </mesh>

        {/* 2-Lane DAT Alierta Campus Avenue (Z = -14.4) */}
        <mesh position={[0, -3.26, -14.4]} receiveShadow>
          <boxGeometry args={[62, 0.04, 5.4]} />
          <meshStandardMaterial color={roadColor} roughness={0.9} />
        </mesh>
        {/* Dashed white road center divider */}
        {Array.from({ length: 16 }, (_, i) => -26 + i * 3.5).map((rx) => (
          <mesh key={rx} position={[rx, -3.23, -14.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 0.14]} />
            <meshBasicMaterial color="#E6ECEF" transparent opacity={0.75} />
          </mesh>
        ))}

        {/* Pedestrian promenade along South-East plaza */}
        <mesh position={[0, -3.26, 9.0]} receiveShadow>
          <boxGeometry args={[48, 0.04, 2.2]} />
          <meshStandardMaterial color={mood === 'night' ? '#4F5A66' : '#D7DCD9'} roughness={0.88} />
        </mesh>

        {/* Architectural Park Benches & Bike Rack on the Campus Plaza */}
        {[-1.5, 4.5, 11.4].map((bx) => (
          <group key={`bench-${bx}`} position={[bx, -3.24, 8.1]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[1.65, 0.08, 0.48]} />
              <meshStandardMaterial color="#C8AC85" roughness={0.75} />
            </mesh>
            {[-0.65, 0.65].map((lx) => (
              <mesh key={lx} position={[lx, 0.2, 0]} castShadow>
                <boxGeometry args={[0.08, 0.4, 0.44]} />
                <meshStandardMaterial color="#2C3842" roughness={0.45} metalness={0.5} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Slim Angled IDOM Campus Streetlamps lining the bike promenade & plaza */}
        {[-12, -5, 2, 9, 15].map((lx) => (
          <group key={`lamp-n-${lx}`} position={[lx, -3.24, -11.3]}>
            <mesh position={[0, 2.1, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.052, 4.2, 8]} />
              <meshStandardMaterial color="#2C363F" roughness={0.42} metalness={0.55} />
            </mesh>
            <mesh position={[0.25, 4.28, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.72, 0.055, 0.08]} />
              <meshStandardMaterial color="#2C363F" roughness={0.42} metalness={0.55} />
            </mesh>
            <mesh position={[0.42, 4.34, 0]}>
              <boxGeometry args={[0.28, 0.04, 0.1]} />
              <meshStandardMaterial
                color="#FFF5D6"
                emissive="#FFE196"
                emissiveIntensity={lampGlow}
              />
            </mesh>
          </group>
        ))}

        {/* ==================== REAL KENNEY CC0 TREES, SHRUBS & ZARAGOZA GREENERY ==================== */}
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
          [-11.4, -8.3],
          [-8.2, -8.5],
          [5.4, -8.4],
          [11.6, -7.2],
          [11.8, 2.5],
          [-10.8, 6.2],
          [2.4, 9.9],
          [9.2, 9.6],
        ].map(([bx, bz], i) => (
          <group key={`bush-${i}`} position={[bx, -3.26, bz]}>
            <KenneyModel
              name={i % 2 === 0 ? 'ext/plant_bushDetailed' : 'ext/plant_bushLarge'}
              scale={2.2}
            />
            <KenneyModel
              name="ext/grass_large"
              position={[0.65, 0, 0.35]}
              scale={2.1}
            />
          </group>
        ))}

        {/* ==================== NEIGHBORING DAT ALIERTA / CAMPUS RÍO EBRO PAVILIONS (HORIZON CONTEXT) ==================== */}
        {/* Far-North Tech Park Buildings across the avenue, softly muted so Integra HQ remains the hero */}
        <group position={[-14.5, -3.26, -22.2]}>
          <KenneyModel
            name="ext-city/low-detail-building-b"
            scale={[3.2, 2.4, 2.8]}
            palette={{
              colormap: {
                color: mood === 'night' ? '#304358' : '#D5DFE6',
                roughness: 0.78,
              },
            }}
          />
        </group>
        <group position={[-3.2, -3.26, -23.0]}>
          <KenneyModel
            name="ext-city/low-detail-building-a"
            scale={[4.2, 2.1, 2.6]}
            palette={{
              colormap: {
                color: mood === 'night' ? '#2A3D52' : '#DCE4E8',
                roughness: 0.78,
              },
            }}
          />
          {/* Subtle architectural window glow stripe at night */}
          {mood === 'night' && (
            <mesh position={[0, 3.2, 2.65]}>
              <planeGeometry args={[6.8, 0.45]} />
              <meshBasicMaterial color="#9BD7F5" transparent opacity={0.55} />
            </mesh>
          )}
        </group>
        <group position={[11.2, -3.26, -22.5]}>
          <KenneyModel
            name="ext-city/low-detail-building-d"
            scale={[3.6, 2.3, 2.8]}
            palette={{
              colormap: {
                color: mood === 'night' ? '#2E4054' : '#D6DFDF',
                roughness: 0.78,
              },
            }}
          />
          {mood === 'night' && (
            <mesh position={[0, 2.9, 2.85]}>
              <planeGeometry args={[5.5, 0.4]} />
              <meshBasicMaterial color="#FFE1A8" transparent opacity={0.5} />
            </mesh>
          )}
        </group>
        {/* Neighboring West Campus Pavilion */}
        <group position={[-21.2, -3.26, -4.5]}>
          <KenneyModel
            name="ext-city/low-detail-building-a"
            rotation={[0, Math.PI / 2, 0]}
            scale={[3.6, 2.0, 2.5]}
            palette={{
              colormap: {
                color: mood === 'night' ? '#2B3E52' : '#D9E0E3',
                roughness: 0.8,
              },
            }}
          />
        </group>
      </group>

      {/* ==================== "VIDA MÍNIMA" EXTERIOR MICRO-SIMULATION ==================== */}
      <CampusVehicle
        model="ext-cars/sedan"
        laneZ={-13.2}
        direction={1}
        speed={4.6}
        offset={6}
        mood={mood}
        reducedMotion={reducedMotion}
      />
      <CampusVehicle
        model="ext-cars/suv-luxury"
        laneZ={-15.6}
        direction={-1}
        speed={3.8}
        offset={24}
        mood={mood}
        reducedMotion={reducedMotion}
      />
      <CampusVehicle
        model="ext-cars/hatchback-sports"
        laneZ={-13.2}
        direction={1}
        speed={4.6}
        offset={33}
        mood={mood}
        reducedMotion={reducedMotion}
      />

      <CampusCyclist reducedMotion={reducedMotion} mood={mood} />

      <CampusWalker
        pathZ={9.0}
        direction={1}
        speed={1.05}
        offset={4}
        coatColor="#115293"
        reducedMotion={reducedMotion}
      />
      <CampusWalker
        pathZ={9.4}
        direction={-1}
        speed={0.92}
        offset={21}
        coatColor="#B78770"
        reducedMotion={reducedMotion}
      />

      <DriftingClouds mood={mood} reducedMotion={reducedMotion} />
    </group>
  );
}
