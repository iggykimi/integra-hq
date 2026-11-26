import { useEffect, useMemo, useRef, useState } from 'react';
import { Html, RoundedBox, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BOARDROOM_SEATS,
  type LightingMood,
  ZONE_META,
} from '../state/officeLayout';
import type { OfficeSceneState } from '../state/officeReducer';
import { KenneyModel } from './KenneyModel';
import {
  createCanvasTexture,
  drawAcademyScreen,
  drawBoardroomScreen,
  drawDagWhiteboard,
  drawFabricArchitectureBoard,
  drawHeritageTotem,
  drawPresentationWallTv,
  drawReceptionLogoWall,
  drawRetroPcScreen,
  loadBrandSvgImage,
} from './screenTextures';

export type LandmarkId =
  | 'reception_mail'
  | 'retro_pc'
  | 'whiteboard'
  | 'boardroom'
  | 'academy'
  | 'coffee'
  | 'terrace'
  | 'phone_booth'
  | 'auditorium'
  | 'printer'
  | 'arch_board'
  | 'slides_tv';

interface OfficeArchitectureProps {
  scene: OfficeSceneState;
  mood: LightingMood;
  focusBoardroom: boolean;
  coffeeActiveOverride?: boolean;
  reducedMotion: boolean;
  onInteractLandmark: (landmark: LandmarkId) => void;
}

/**
 * Instanced biophilic interior vertical green wall (1 draw call for 110 foliage fronds!).
 */
function InstancedVerticalGarden({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 112;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const greens = ['#345732', '#446B40', '#58804F', '#294828', '#6B925E', '#7DA16E'];

    for (let i = 0; i < count; i += 1) {
      const s1 = ((i * 73 + 19) % 100) / 100;
      const s2 = ((i * 41 + 37) % 100) / 100;
      const s3 = ((i * 29 + 11) % 100) / 100;
      dummy.position.set(0.08 + s3 * 0.09, 0.25 + s1 * 2.8, -1.65 + s2 * 3.3);
      dummy.rotation.set(s1 * 1.4, s2 * 1.3, s3 * 0.9);
      dummy.scale.set(0.36 + s3 * 0.28, 0.72 + s1 * 0.56, 0.8 + s2 * 0.65);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(greens[i % greens.length]);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={position}>
      <mesh position={[0.03, 1.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.05, 3.55]} />
        <meshStandardMaterial color="#1F3320" roughness={0.95} />
      </mesh>
      {[-1.75, -0.88, 0, 0.88, 1.75].map((rz) => (
        <mesh key={rz} position={[0.06, 1.68, rz]}>
          <boxGeometry args={[0.07, 3.1, 0.06]} />
          <meshStandardMaterial color="#D2BA96" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0.06, 3.24, 0]}>
        <boxGeometry args={[0.1, 0.08, 3.65]} />
        <meshStandardMaterial color="#D2BA96" roughness={0.7} />
      </mesh>
      <mesh position={[0.06, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.08, 3.65]} />
        <meshStandardMaterial color="#D2BA96" roughness={0.7} />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <icosahedronGeometry args={[0.145, 0]} />
        <meshStandardMaterial roughness={0.86} />
      </instancedMesh>
    </group>
  );
}

/**
 * Instanced IDOM DAT Alierta horizontal terracotta ceramic brick louvers across the 28m North façade
 * (1 draw call for 180 ceramic bricks instead of 180 individual meshes!).
 */
function InstancedTerracottaLouvers() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const rows = [2.35, 2.58, 2.81, 3.04, 3.27];
  const colsPerRow = 36;
  const total = rows.length * colsPerRow;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const shades = ['#B78770', '#C5957D', '#A77760'];
    let idx = 0;

    for (let r = 0; r < rows.length; r += 1) {
      for (let c = 0; c < colsPerRow; c += 1) {
        const bx = -13.6 + c * 0.775;
        dummy.position.set(bx, rows[r] + 0.055, -0.18);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        color.set(shades[(r * 7 + c * 3) % shades.length]);
        mesh.setColorAt(idx, color);
        idx += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group>
      {rows.map((ly) => (
        <mesh key={ly} position={[0, ly, -0.14]} castShadow receiveShadow>
          <boxGeometry args={[28.2, 0.09, 0.15]} />
          <meshStandardMaterial color="#B78770" roughness={0.76} />
        </mesh>
      ))}
      <instancedMesh ref={meshRef} args={[undefined, undefined, total]} castShadow>
        <boxGeometry args={[0.38, 0.06, 0.08]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

/**
 * Working real-time 3D analog architectural wall clock on the West atrium spine.
 */
function RealTimeWallClock({ position }: { position: [number, number, number] }) {
  const hourRef = useRef<THREE.Group>(null);
  const minRef = useRef<THREE.Group>(null);
  const secRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;
    if (hourRef.current) hourRef.current.rotation.z = -(hr / 12) * Math.PI * 2;
    if (minRef.current) minRef.current.rotation.z = -(min / 60) * Math.PI * 2;
    if (secRef.current) secRef.current.rotation.z = -(sec / 60) * Math.PI * 2;
  });

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 28]} />
        <meshStandardMaterial color="#0B2A5B" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.01, 28]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
      </mesh>
      {/* 12 / 3 / 6 / 9 crisp architectural dial ticks */}
      {[0, 1, 2, 3].map((q) => (
        <mesh
          key={q}
          position={[
            Math.sin((q * Math.PI) / 2) * 0.27,
            Math.cos((q * Math.PI) / 2) * 0.27,
            0.04,
          ]}
          rotation={[0, 0, -(q * Math.PI) / 2]}
        >
          <boxGeometry args={[0.022, 0.06, 0.006]} />
          <meshStandardMaterial color="#0B2A5B" />
        </mesh>
      ))}
      {/* Properly pivoted real-time clock hands */}
      <group position={[0, 0, 0.046]}>
        <group ref={hourRef}>
          <mesh position={[0, 0.085, 0]}>
            <boxGeometry args={[0.028, 0.17, 0.008]} />
            <meshStandardMaterial color="#0B2A5B" />
          </mesh>
        </group>
        <group ref={minRef} position={[0, 0, 0.006]}>
          <mesh position={[0, 0.115, 0]}>
            <boxGeometry args={[0.02, 0.23, 0.008]} />
            <meshStandardMaterial color="#115293" />
          </mesh>
        </group>
        <group ref={secRef} position={[0, 0, 0.012]}>
          <mesh position={[0, 0.125, 0]}>
            <boxGeometry args={[0.01, 0.25, 0.006]} />
            <meshStandardMaterial color="#00B0F0" emissive="#00B0F0" emissiveIntensity={0.6} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.014, 12]} />
          <meshStandardMaterial color="#00B0F0" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Recessed Double-Height Architectural Atrium Stairwell descending visibly toward the Ground Floor.
 */
function AtriumStairwell({ position }: { position: [number, number, number] }) {
  const steps = Array.from({ length: 10 }, (_, i) => i);
  return (
    <group position={position}>
      {/* Recessed dark stairwell opening illusion */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[3.4, 0.06, 2.35]} />
        <meshStandardMaterial color="#1B2A38" roughness={0.9} />
      </mesh>
      {/* Warm architectural oak cantilevered stair treads going down into the ground lobby */}
      {steps.map((i) => (
        <mesh key={i} position={[-1.4 + i * 0.3, -0.14 - i * 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.08, 2.05]} />
          <meshStandardMaterial color="#D6BE9B" roughness={0.72} />
        </mesh>
      ))}
      {/* Clear architectural glass safety balustrade around stairwell */}
      {[
        { pos: [0, 0.56, -1.18] as [number, number, number], size: [3.45, 1.05, 0.05] as [number, number, number] },
        { pos: [0, 0.56, 1.18] as [number, number, number], size: [3.45, 1.05, 0.05] as [number, number, number] },
        { pos: [1.72, 0.56, 0] as [number, number, number], size: [0.05, 1.05, 2.38] as [number, number, number] },
      ].map((b, idx) => (
        <group key={idx}>
          <mesh position={b.pos}>
            <boxGeometry args={b.size} />
            <meshPhysicalMaterial
              color="#B8D4DD"
              transparent
              opacity={0.34}
              roughness={0.12}
            />
          </mesh>
          <mesh position={[b.pos[0], 1.1, b.pos[2]]}>
            <boxGeometry args={[b.size[0] + 0.02, 0.045, b.size[2] + 0.02]} />
            <meshStandardMaterial color="#344452" roughness={0.38} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Acoustic Solo Video-Call Phone Booth (oak interior + glass front door + tiny stool/shelf).
 */
function AcousticPhoneBooth({
  position,
  rotationY = 0,
  hovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  position: [number, number, number];
  rotationY?: number;
  hovered?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        if (!onPointerOver) return;
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={onPointerOut}
    >
      {/* Sleek cutaway acoustic phone booth (open-top architectural view + glass front/side) */}
      <mesh position={[0, 1.04, -0.58]} castShadow receiveShadow>
        <boxGeometry args={[1.22, 2.08, 0.07]} />
        <meshStandardMaterial color={hovered ? '#115293' : '#3E5263'} roughness={0.85} />
      </mesh>
      <mesh position={[-0.59, 1.04, 0]} castShadow>
        <boxGeometry args={[0.07, 2.08, 1.2]} />
        <meshStandardMaterial color="#3E5263" roughness={0.85} />
      </mesh>
      {/* Glass side & front doors with oak & steel cutaway top rim */}
      <mesh position={[0.59, 1.04, 0]}>
        <boxGeometry args={[0.04, 2.04, 1.18]} />
        <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.28} roughness={0.1} />
      </mesh>
      <mesh position={[0.38, 1.04, 0.58]}>
        <boxGeometry args={[0.42, 2.04, 0.04]} />
        <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.28} roughness={0.1} />
      </mesh>
      {/* Open-top cutaway oak perimeter frame (lets isometric camera see right inside!) */}
      <mesh position={[0, 2.1, -0.58]}>
        <boxGeometry args={[1.26, 0.07, 0.09]} />
        <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.1, 0.58]}>
        <boxGeometry args={[1.26, 0.07, 0.09]} />
        <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
      </mesh>
      <mesh position={[-0.59, 2.1, 0]}>
        <boxGeometry args={[0.09, 0.07, 1.22]} />
        <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
      </mesh>
      <mesh position={[0.59, 2.1, 0]}>
        <boxGeometry args={[0.09, 0.07, 1.22]} />
        <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
      </mesh>
      {/* Interior oak desk shelf + warm status LED bar */}
      <mesh position={[0, 1.02, -0.38]} castShadow>
        <boxGeometry args={[1.05, 0.05, 0.36]} />
        <meshStandardMaterial color="#D7C2A3" roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.98, -0.52]}>
        <boxGeometry args={[0.85, 0.035, 0.04]} />
        <meshStandardMaterial color="#FFF6E0" emissive="#FFE3A3" emissiveIntensity={1.15} />
      </mesh>
    </group>
  );
}

function CoffeeSteamCluster({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  useFrame(({ clock }) => {
    if (!active || reducedMotion) return;
    const t = clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const p = (t * 0.42 + i * 0.33) % 1;
      ref.current.position.y = 1.24 + p * 0.44;
      ref.current.position.x = 10.35 + Math.sin(t * 2.1 + i * 2) * 0.04;
      ref.current.scale.setScalar(0.8 + p * 0.7);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.42;
    });
  });

  if (!active || reducedMotion) return null;

  return (
    <group>
      {refs.map((ref, idx) => (
        <mesh key={idx} ref={ref} position={[10.35, 1.3 + idx * 0.1, -9.0]}>
          <sphereGeometry args={[0.044, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Grand 28m x 20m Flagship DAT Alierta Interior + Cantilevered Outdoor Terrace + Iconic Rooms:
 * - Zona Dirección + DAG Plan Whiteboard + Phone Booth #1
 * - Sala Alierta (8-seat Glass Boardroom)
 * - Academia Integra (Training Studio reactive to `includesTraining`!)
 * - Rincón Café & Lounge + Outdoor Terracotta Pergola Terrace
 * - Double-Height Atrium Stairwell + Giant Vertical Garden + Live Analog Clock
 * - Hall Recepción + Real Integra SVG Logo + 1986 Retro PC + IntegraTalks Oak Bleachers
 * - Comercial (Phone Booth #2 + Printer) + Soluciones (Glass Fabric Board + Data & AI Server Lab)
 * - Comunicación (6-Slide Presentation TV) + Operación Archive
 */
export function OfficeArchitecture({
  scene,
  mood,
  focusBoardroom,
  coffeeActiveOverride = false,
  reducedMotion,
  onInteractLandmark,
}: OfficeArchitectureProps) {
  const [floorDiff, floorNor, floorRough] = useTexture([
    '/assets/textures/laminate_floor_02_diff_1k.jpg',
    '/assets/textures/laminate_floor_02_nor_gl_1k.jpg',
    '/assets/textures/laminate_floor_02_rough_1k.jpg',
  ]);

  useMemo(() => {
    for (const tex of [floorDiff, floorNor, floorRough]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(7.5, 5.4);
      tex.anisotropy = 8;
    }
    floorDiff.colorSpace = THREE.SRGBColorSpace;
  }, [floorDiff, floorNor, floorRough]);

  const [logoColor, setLogoColor] = useState<HTMLImageElement | null>(null);
  const [logoWhite, setLogoWhite] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let mounted = true;
    loadBrandSvgImage('/assets/branding/logo-integra-color.svg')
      .then((img) => {
        if (mounted) setLogoColor(img);
      })
      .catch(() => {});
    loadBrandSvgImage('/assets/branding/logo-integra-blanco.svg')
      .then((img) => {
        if (mounted) setLogoWhite(img);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const receptionWallTex = useMemo(() => createCanvasTexture(640, 290), []);
  const heritageTotemTex = useMemo(() => createCanvasTexture(380, 440), []);
  const dagBoardTex = useMemo(() => createCanvasTexture(780, 410), []);
  const fabricBoardTex = useMemo(() => createCanvasTexture(750, 340), []);
  const slidesTvTex = useMemo(() => createCanvasTexture(512, 300), []);
  const boardroomTvTex = useMemo(() => createCanvasTexture(640, 310), []);
  const academyTvTex = useMemo(() => createCanvasTexture(560, 260), []);
  const retroPcTex = useMemo(() => createCanvasTexture(256, 170), []);

  useEffect(() => {
    drawReceptionLogoWall(receptionWallTex.ctx, logoWhite);
    receptionWallTex.texture.needsUpdate = true;
  }, [logoWhite, receptionWallTex]);

  useEffect(() => {
    drawHeritageTotem(heritageTotemTex.ctx, logoWhite);
    heritageTotemTex.texture.needsUpdate = true;
  }, [logoWhite, heritageTotemTex]);

  useEffect(() => {
    drawDagWhiteboard(dagBoardTex.ctx, scene.planTasks, scene.includesTraining, scene.status);
    dagBoardTex.texture.needsUpdate = true;
  }, [scene.planTasks, scene.includesTraining, scene.status, dagBoardTex]);

  useEffect(() => {
    drawBoardroomScreen(boardroomTvTex.ctx, scene, logoWhite);
    boardroomTvTex.texture.needsUpdate = true;
  }, [scene, logoWhite, boardroomTvTex]);

  useEffect(() => {
    drawAcademyScreen(academyTvTex.ctx, scene.includesTraining, logoWhite);
    academyTvTex.texture.needsUpdate = true;
  }, [scene.includesTraining, logoWhite, academyTvTex]);

  useEffect(() => {
    drawFabricArchitectureBoard(fabricBoardTex.ctx, scene.agents.architect.state, 0);
    fabricBoardTex.texture.needsUpdate = true;
    drawPresentationWallTv(
      slidesTvTex.ctx,
      0,
      scene.agents.designer.state,
      scene.includesTraining,
      logoWhite,
      logoColor
    );
    slidesTvTex.texture.needsUpdate = true;
    drawRetroPcScreen(retroPcTex.ctx, 0);
    retroPcTex.texture.needsUpdate = true;
  }, [
    scene.agents.architect.state,
    scene.agents.designer.state,
    scene.includesTraining,
    logoWhite,
    logoColor,
    fabricBoardTex,
    slidesTvTex,
    retroPcTex,
  ]);

  useEffect(() => {
    return () => {
      receptionWallTex.texture.dispose();
      heritageTotemTex.texture.dispose();
      dagBoardTex.texture.dispose();
      fabricBoardTex.texture.dispose();
      slidesTvTex.texture.dispose();
      boardroomTvTex.texture.dispose();
      academyTvTex.texture.dispose();
      retroPcTex.texture.dispose();
    };
  }, [
    receptionWallTex,
    heritageTotemTex,
    dagBoardTex,
    fabricBoardTex,
    slidesTvTex,
    boardroomTvTex,
    academyTvTex,
    retroPcTex,
  ]);

  const lastTickRef = useRef(-1);
  const envelopeRef = useRef<THREE.Group>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    const tick = Math.floor(t * 1.1);
    if (tick !== lastTickRef.current) {
      lastTickRef.current = tick;
      if (scene.agents.architect.state === 'working') {
        drawFabricArchitectureBoard(fabricBoardTex.ctx, 'working', tick);
        fabricBoardTex.texture.needsUpdate = true;
      }
      if (tick % 3 === 0) {
        drawPresentationWallTv(
          slidesTvTex.ctx,
          Math.floor(tick / 3),
          scene.agents.designer.state,
          scene.includesTraining,
          logoWhite,
          logoColor
        );
        slidesTvTex.texture.needsUpdate = true;
      }
      drawRetroPcScreen(retroPcTex.ctx, tick);
      retroPcTex.texture.needsUpdate = true;
    }

    if (envelopeRef.current && scene.receptionAlert) {
      envelopeRef.current.position.y = 1.12 + Math.sin(t * 4) * 0.045;
      envelopeRef.current.rotation.y = Math.sin(t * 2) * 0.25;
    }
  });

  const screenGlow = mood === 'night' ? 0.55 : mood === 'golden' ? 0.32 : 0.18;
  const lampEmissiveIntensity = mood === 'night' ? 1.8 : mood === 'golden' ? 0.9 : 0.12;
  const windowColumns = [-13.9, -9.8, -5.6, -1.4, 2.8, 7.0, 10.6, 13.9];

  const boardroomBadgeColor =
    scene.boardroomStatus === 'approval'
      ? '#D5A13D'
      : scene.boardroomStatus === 'meeting'
        ? '#00B0F0'
        : '#36966C';

  const academyBadgeColor = scene.includesTraining ? '#36966C' : '#7C8E9E';

  const setPointer = (name: string | null) => {
    setHoveredLandmark(name);
    document.body.style.cursor = name ? 'pointer' : 'auto';
  };

  return (
    <group>
      {/* ==================== MAIN 28m x 20m ARCHITECTURAL FLOORPLATE ==================== */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[28.0, 0.32, 20.0]} />
        <meshStandardMaterial
          map={floorDiff}
          normalMap={floorNor}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          roughnessMap={floorRough}
          color="#EADBC4"
          roughness={0.82}
        />
      </mesh>

      {/* IDOM Cantilevered Architectural Slab Rim + Terracotta Trim */}
      <mesh position={[0, -0.36, 0]} receiveShadow>
        <boxGeometry args={[28.45, 0.16, 20.45]} />
        <meshStandardMaterial color="#F2F4F3" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.22, 10.08]}>
        <boxGeometry args={[28.25, 0.09, 0.09]} />
        <meshStandardMaterial color="#B78770" roughness={0.78} />
      </mesh>
      <mesh position={[14.08, -0.22, 0]}>
        <boxGeometry args={[0.09, 0.09, 20.25]} />
        <meshStandardMaterial color="#B78770" roughness={0.78} />
      </mesh>

      {/* Architectural Floor Zone Stone / Carpet Inlays */}
      {/* Reception + IntegraTalks light limestone floor */}
      <mesh position={[-10.6, 0.006, 5.7]} receiveShadow>
        <boxGeometry args={[6.4, 0.012, 7.6]} />
        <meshStandardMaterial color="#E6ECEC" roughness={0.74} />
      </mesh>
      {/* Sala Alierta acoustic slate carpet */}
      <mesh position={[-3.7, 0.006, -5.8]} receiveShadow>
        <boxGeometry args={[6.7, 0.012, 7.2]} />
        <meshStandardMaterial color="#ACAFA5" roughness={1} />
      </mesh>
      {/* Academia Integra subtle cool carpet */}
      <mesh position={[3.6, 0.006, -5.8]} receiveShadow>
        <boxGeometry args={[6.4, 0.012, 7.2]} />
        <meshStandardMaterial color="#DCE6E3" roughness={0.92} />
      </mesh>
      {/* Grand Central Boulevard corridor guide */}
      <mesh position={[2.2, 0.005, 0.2]} receiveShadow>
        <boxGeometry args={[22.8, 0.008, 2.3]} />
        <meshStandardMaterial color="#E1D2BA" roughness={0.84} />
      </mesh>

      {/* Minimalist Architectural Floor Zone Strip Markers */}
      {(Object.entries(ZONE_META) as Array<[keyof typeof ZONE_META, (typeof ZONE_META)[keyof typeof ZONE_META]]>).map(
        ([zoneId, zm]) => (
          <mesh key={zoneId} position={zm.tagPos}>
            <boxGeometry args={[2.1, 0.009, 0.09]} />
            <meshStandardMaterial color={zm.color} roughness={0.5} />
          </mesh>
        )
      )}

      {/* ==================== NORTH PANORAMIC GLASS WALL + INSTANCED TERRACOTTA LOUVERS ==================== */}
      <group position={[0, 0, -10.0]}>
        <mesh position={[0, 0.24, 0]} receiveShadow>
          <boxGeometry args={[28.0, 0.48, 0.18]} />
          <meshStandardMaterial color="#EEF2F1" roughness={0.84} />
        </mesh>
        <mesh position={[0, 3.62, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[28.4, 0.22, 0.7]} />
          <meshStandardMaterial color="#F5F7F6" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.98, 0]}>
          <boxGeometry args={[27.85, 3.1, 0.06]} />
          <meshPhysicalMaterial
            color="#A9C3CC"
            transparent
            opacity={0.32}
            roughness={0.1}
            metalness={0.08}
            reflectivity={0.65}
          />
        </mesh>
        {windowColumns.map((wx) => (
          <mesh key={wx} position={[wx, 1.82, 0.02]} castShadow>
            <boxGeometry args={[0.14, 3.6, 0.2]} />
            <meshStandardMaterial color="#303D47" roughness={0.46} metalness={0.38} />
          </mesh>
        ))}
        <InstancedTerracottaLouvers />
      </group>

      {/* ==================== WEST ARCHITECTURAL SPINE WALL (X = -14.0) ==================== */}
      <group position={[-14.0, 0, 0]}>
        <mesh position={[0, 1.82, 0]} receiveShadow>
          <boxGeometry args={[0.2, 3.64, 20.0]} />
          <meshStandardMaterial color="#F3F6F5" roughness={0.88} />
        </mesh>
        <mesh position={[0.16, 3.62, 0]} castShadow>
          <boxGeometry args={[0.55, 0.22, 20.3]} />
          <meshStandardMaterial color="#F5F7F6" roughness={0.75} />
        </mesh>
        {/* Warm acoustic oak wood slats framing the atrium spine */}
        {Array.from({ length: 20 }, (_, i) => -2.6 + i * 0.22).map((sz) => (
          <mesh key={sz} position={[0.12, 1.8, sz]} castShadow>
            <boxGeometry args={[0.05, 3.3, 0.08]} />
            <meshStandardMaterial color="#C8AE88" roughness={0.74} />
          </mesh>
        ))}
      </group>

      {/* Giant Instanced Biophilic Vertical Garden + Working Real-Time Analog Wall Clock */}
      <InstancedVerticalGarden position={[-13.9, 0, -0.4]} />
      <RealTimeWallClock position={[-13.86, 2.42, 7.65]} />

      {/* Double-Height Atrium Stairwell descending visibly to Ground Floor */}
      <AtriumStairwell position={[-11.35, 0, 0.1]} />

      {/* ==================== RECEPTION FEATURE WALL (REAL INTEGRA SVG LOGO) ==================== */}
      <group position={[-13.84, 2.02, 4.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.09, 1.62, 3.55]} />
          <meshStandardMaterial color="#F7FAFC" roughness={0.4} />
        </mesh>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.03, 1.7, 3.65]} />
          <meshStandardMaterial
            color="#00B0F0"
            emissive="#00B0F0"
            emissiveIntensity={mood === 'night' ? 1.35 : 0.25}
          />
        </mesh>
        <mesh position={[0.052, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.42, 1.5]} />
          <meshStandardMaterial
            map={receptionWallTex.texture}
            roughness={0.42}
            emissive="#FFFFFF"
            emissiveMap={receptionWallTex.texture}
            emissiveIntensity={mood === 'night' ? 0.36 : mood === 'golden' ? 0.1 : 0.02}
          />
        </mesh>
      </group>

      {/* ==================== DIRECTOR'S INTERACTIVE DAG PLAN WHITEBOARD ==================== */}
      <group
        position={[-13.84, 1.78, -5.5]}
        onClick={(e) => {
          e.stopPropagation();
          onInteractLandmark('whiteboard');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setPointer('whiteboard');
        }}
        onPointerOut={() => setPointer(null)}
      >
        <mesh castShadow>
          <boxGeometry args={[0.09, 1.92, 3.65]} />
          <meshStandardMaterial
            color={hoveredLandmark === 'whiteboard' ? '#00B0F0' : '#B5C2CC'}
            roughness={0.4}
            metalness={0.28}
          />
        </mesh>
        <mesh position={[0.052, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.48, 1.78]} />
          <meshStandardMaterial
            map={dagBoardTex.texture}
            roughness={0.3}
            emissive="#FFFFFF"
            emissiveMap={dagBoardTex.texture}
            emissiveIntensity={screenGlow * 0.72}
          />
        </mesh>
        <mesh position={[1.7, -1.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.4, 28]} />
          <meshBasicMaterial color="#00B0F0" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ==================== HALL RECEPCIÓN & GRADA INTEGRATALKS (FRONT-LEFT) ==================== */}
      <group>
        {/* Reception Counter */}
        <group position={[-10.85, 0, 4.35]}>
          <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.92, 1.04, 2.7]} />
            <meshStandardMaterial color="#FBFDFC" roughness={0.42} />
          </mesh>
          <mesh position={[0.06, 1.05, 0]} castShadow>
            <boxGeometry args={[1.04, 0.06, 2.78]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
          </mesh>
          <mesh position={[0.47, 0.52, 0]}>
            <boxGeometry args={[0.02, 0.085, 2.4]} />
            <meshStandardMaterial
              color="#00B0F0"
              emissive="#00B0F0"
              emissiveIntensity={mood === 'night' ? 1.5 : 0.35}
            />
          </mesh>

          {/* Interactive Incoming CRM Mail Tray */}
          <group
            position={[0.14, 1.09, -0.68]}
            onClick={(e) => {
              e.stopPropagation();
              onInteractLandmark('reception_mail');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setPointer('reception_mail');
            }}
            onPointerOut={() => setPointer(null)}
          >
            <mesh castShadow>
              <boxGeometry args={[0.45, 0.04, 0.54]} />
              <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
            </mesh>
            <group ref={envelopeRef} position={[0, 0.06, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.34, 0.036, 0.44]} />
                <meshStandardMaterial
                  color={scene.receptionAlert ? '#00B0F0' : '#FFFFFF'}
                  emissive={scene.receptionAlert ? '#00B0F0' : '#000000'}
                  emissiveIntensity={scene.receptionAlert ? 1.2 : 0}
                  roughness={0.4}
                />
              </mesh>
            </group>
            {hoveredLandmark === 'reception_mail' && (
              <Html position={[0, 0.5, 0]} center zIndexRange={[10, 0]}>
                <div className="landmark-tooltip">Click: enviar señal CRM Nortia</div>
              </Html>
            )}
          </group>

          <KenneyModel
            name="laptop"
            position={[-0.12, 1.08, 0.55]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={0.72}
          />
        </group>

        {/* Integra 40 Años Heritage Display Totem */}
        <group position={[-13.0, 0, 2.2]} rotation={[0, 0.4, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.84, 0.1, 0.48]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.12, 0]} castShadow>
            <boxGeometry args={[0.8, 2.04, 0.12]} />
            <meshStandardMaterial color="#182736" roughness={0.4} metalness={0.35} />
          </mesh>
          <mesh position={[0, 1.15, 0.068]}>
            <planeGeometry args={[0.72, 1.72]} />
            <meshStandardMaterial
              map={heritageTotemTex.texture}
              emissive="#FFFFFF"
              emissiveMap={heritageTotemTex.texture}
              emissiveIntensity={screenGlow * 0.9}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* 1986 Retro PC Heritage Plinth */}
        <group
          position={[-12.85, 0, 6.45]}
          rotation={[0, 0.48, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('retro_pc');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('retro_pc');
          }}
          onPointerOut={() => setPointer(null)}
        >
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.92, 0.8, 0.72]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.7} />
          </mesh>
          <KenneyModel
            name="televisionVintage"
            position={[0, 0.8, -0.06]}
            scale={1.38}
            palette={{
              wood: { color: '#D8CFB8', roughness: 0.68 },
              metal: { color: '#CFC7B0', roughness: 0.6 },
              metalMedium: { color: '#999280', roughness: 0.6 },
              metalDark: { color: '#102414', roughness: 0.3 },
            }}
          />
          <mesh position={[-0.04, 1.0, 0.135]}>
            <planeGeometry args={[0.34, 0.24]} />
            <meshStandardMaterial
              map={retroPcTex.texture}
              emissive="#53FF8C"
              emissiveMap={retroPcTex.texture}
              emissiveIntensity={0.85}
              roughness={0.2}
            />
          </mesh>
          <KenneyModel
            name="computerKeyboard"
            position={[0, 0.8, 0.24]}
            scale={1.4}
            palette={{
              metalDark: { color: '#D7CEB7', roughness: 0.68 },
              metalMedium: { color: '#B7AF9A', roughness: 0.68 },
            }}
          />
          {hoveredLandmark === 'retro_pc' && (
            <Html position={[0, 1.55, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Easter Egg · PC 1986 Calatayud (Click)</div>
            </Html>
          )}
        </group>

        {/* Stepped Oak Auditorium Bleachers («Grada IntegraTalks») */}
        <group
          position={[-10.5, 0, 8.55]}
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('auditorium');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('auditorium');
          }}
          onPointerOut={() => setPointer(null)}
        >
          {[0, 1, 2].map((tier) => (
            <group key={tier} position={[0, tier * 0.38, tier * 0.56 - 0.56]}>
              <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
                <boxGeometry args={[4.4, 0.38, 0.56]} />
                <meshStandardMaterial color="#D5BD98" roughness={0.72} />
              </mesh>
              {/* Integra navy acoustic seat cushions */}
              {[-1.35, 0, 1.35].map((cx) => (
                <mesh key={cx} position={[cx, 0.4, -0.02]} castShadow>
                  <boxGeometry args={[0.96, 0.06, 0.42]} />
                  <meshStandardMaterial color={tier === 1 ? '#115293' : '#0B2A5B'} roughness={0.84} />
                </mesh>
              ))}
            </group>
          ))}
          {hoveredLandmark === 'auditorium' && (
            <Html position={[0, 1.75, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Grada IntegraTalks · Mini-Auditorio (Click)</div>
            </Html>
          )}
        </group>

        {/* Integra Brand Cubes + Greenery */}
        <group position={[-8.4, 0, 6.1]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
          </mesh>
          <mesh position={[0.45, 0.19, 0.12]} rotation={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.38, 0.38, 0.38]} />
            <meshStandardMaterial color="#00B0F0" roughness={0.42} />
          </mesh>
          <mesh position={[0.12, 0.64, -0.02]} rotation={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.32, 0.32, 0.32]} />
            <meshStandardMaterial color="#70C4BE" roughness={0.48} />
          </mesh>
        </group>

        <KenneyModel
          name="pottedPlant"
          position={[-13.2, 0, 5.45]}
          scale={2.25}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#5F8456' } }}
        />
        <KenneyModel name="coatRackStanding" position={[-13.2, 0, -8.8]} scale={2.2} />
      </group>

      {/* ==================== ZONA DIRECCIÓN AUXILIARY + PHONE BOOTH #1 ==================== */}
      <group>
        <AcousticPhoneBooth position={[-8.3, 0, -8.9]} />
        <KenneyModel
          name="bookcaseOpen"
          position={[-10.4, 0, -9.25]}
          scale={2.15}
          palette={{ wood: { color: '#D7C2A3' } }}
        />
        <KenneyModel name="books" position={[-10.4, 0.88, -9.25]} scale={2.0} />
        <KenneyModel
          name="pottedPlant"
          position={[-13.1, 0, -9.1]}
          scale={2.15}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#64875A' } }}
        />
      </group>

      {/* ==================== SALA ALIERTA · GRAND 8-SEAT GLASS BOARDROOM (X: -7.2..-0.2) ==================== */}
      <group>
        {(focusBoardroom ? [-7.2] : [-7.2, -0.2]).map((gx) => (
          <group key={gx} position={[gx, 0, -5.9]}>
            <mesh position={[0, 1.56, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[7.8, 3.08]} />
              <meshPhysicalMaterial
                color="#B8D4DD"
                transparent
                opacity={0.2}
                depthWrite={false}
                side={THREE.DoubleSide}
                roughness={0.12}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, 1.28, 0]}>
              <boxGeometry args={[0.068, 0.34, 7.6]} />
              <meshStandardMaterial color="#E6F2F6" transparent depthWrite={false} opacity={0.32} roughness={0.6} />
            </mesh>
            <mesh position={[0, 3.12, 0]}>
              <boxGeometry args={[0.09, 0.08, 7.9]} />
              <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
            </mesh>
          </group>
        ))}

        {/* Front glass panels flanking central doorway at X = -3.7 */}
        {!focusBoardroom && [-5.95, -1.45].map((fx) => (
          <group key={fx} position={[fx, 0, -2.0]}>
            <mesh position={[0, 1.56, 0]}>
              <planeGeometry args={[2.42, 3.08]} />
              <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} roughness={0.12} />
            </mesh>
            <mesh position={[0, 1.28, 0]}>
              <boxGeometry args={[2.36, 0.28, 0.068]} />
              <meshStandardMaterial color="#E6F2F6" transparent depthWrite={false} opacity={0.32} roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Header transom + glowing Sala Alierta Status Sign */}
        <mesh position={[-3.7, 3.12, -2.0]} visible={!focusBoardroom}>
          <boxGeometry args={[7.05, 0.1, 0.1]} />
          <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
        </mesh>
        {!focusBoardroom && <group position={[-3.7, 2.84, -1.94]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.34, 0.08]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.045]}>
            <boxGeometry args={[1.95, 0.048, 0.02]} />
            <meshStandardMaterial
              color={boardroomBadgeColor}
              emissive={boardroomBadgeColor}
              emissiveIntensity={1.25}
            />
          </mesh>
          <Html position={[0, 0.02, 0.08]} center zIndexRange={[6, 0]}>
            <div className="boardroom-sign" style={{ borderColor: boardroomBadgeColor }}>
              <span className="status-dot" style={{ background: boardroomBadgeColor }} />
              {scene.boardroomStatus === 'approval'
                ? 'SALA ALIERTA · APROBACIÓN'
                : scene.boardroomStatus === 'meeting'
                  ? 'SALA ALIERTA · REUNIÓN'
                  : 'SALA ALIERTA'}
            </div>
          </Html>
        </group>}

        {/* Oak meeting table with rounded corners and a recessed cable tray. */}
        <group
          position={[-3.7, 0, -5.8]}
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('boardroom');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('boardroom');
          }}
          onPointerOut={() => setPointer(null)}
        >
          <RoundedBox args={[3.08, 0.09, 1.66]} radius={0.038} position={[0, 0.72, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#C9A57B" roughness={0.58} />
          </RoundedBox>
          {[-0.94, 0.94].map((x) => (
            <RoundedBox key={x} args={[0.13, 0.68, 1.06]} radius={0.035} position={[x, 0.34, 0]} castShadow>
              <meshStandardMaterial color="#3B474D" roughness={0.55} metalness={0.32} />
            </RoundedBox>
          ))}
          <RoundedBox args={[0.64, 0.018, 0.18]} radius={0.008} position={[0, 0.768, 0]}>
            <meshStandardMaterial color="#3B474D" roughness={0.55} />
          </RoundedBox>
          <RoundedBox args={[0.30, 0.023, 0.225]} radius={0.009} position={[-1.12, 0.774, -0.19]} rotation={[0, -0.16, 0]} castShadow>
            <meshStandardMaterial color="#F0E9DB" roughness={0.9} />
          </RoundedBox>
          {hoveredLandmark === 'boardroom' && (
            <Html position={[0, 1.38, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">{scene.boardroomStatus === 'meeting' ? 'Cerrar reunión' : 'Sala Alierta'}</div>
            </Html>
          )}
        </group>

        {/* 8 Boardroom Chairs (Kenney CC0) */}
        {BOARDROOM_SEATS.map((seat, idx) => (
          <KenneyModel
            key={idx}
            name="chairModernFrameCushion"
            position={[seat.pos.x, 0, seat.pos.z]}
            rotation={[0, seat.yaw + Math.PI, 0]}
            scale={[2.25, 2.0, 2.25]}
            palette={{
              carpetBlue: { color: idx === 0 ? '#283E64' : '#506671', roughness: 0.94 },
              metal: { color: '#414E57', roughness: 0.48, metalness: 0.32 },
            }}
          />
        ))}

        {/* Executive Wall TV inside Sala Alierta */}
        <group position={[-3.7, 1.72, -9.55]}>
          <KenneyModel name="televisionModern" position={[0, -0.5, -0.05]} scale={[3.8, 2.8, 1.6]} />
          <mesh position={[0, 0.14, 0.06]}>
            <planeGeometry args={[2.42, 1.15]} />
            <meshStandardMaterial
              map={boardroomTvTex.texture}
              emissive="#FFFFFF"
              emissiveMap={boardroomTvTex.texture}
              emissiveIntensity={screenGlow}
              roughness={0.24}
            />
          </mesh>
        </group>
        <KenneyModel
          name="pottedPlant"
          position={[-6.55, 0, -9.15]}
          scale={2.15}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#618458' } }}
        />
      </group>

      {/* ==================== AULA FORMACIÓN · ACADEMIA INTEGRA (X: +0.2..+7.0) ==================== */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onInteractLandmark('academy');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setPointer('academy');
        }}
        onPointerOut={() => setPointer(null)}
      >
        {/* East glass partition */}
        <group position={[7.0, 0, -5.9]}>
          <mesh position={[0, 1.56, 0]}>
            <boxGeometry args={[0.06, 3.08, 7.8]} />
            <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.24} roughness={0.12} />
          </mesh>
          <mesh position={[0, 3.12, 0]}>
            <boxGeometry args={[0.09, 0.08, 7.9]} />
            <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
          </mesh>
        </group>

        {/* Front glass panels flanking doorway at X = +3.6 */}
        {[1.4, 5.8].map((fx) => (
          <mesh key={fx} position={[fx, 1.56, -2.0]}>
            <boxGeometry args={[2.3, 3.08, 0.06]} />
            <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.22} roughness={0.12} />
          </mesh>
        ))}
        <mesh position={[3.6, 3.12, -2.0]}>
          <boxGeometry args={[6.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
        </mesh>

        {/* Glowing Academia Integra Header Sign (lights green when includesTraining=YES!) */}
        <group position={[3.6, 2.84, -1.94]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.34, 0.08]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.045]}>
            <boxGeometry args={[1.95, 0.048, 0.02]} />
            <meshStandardMaterial
              color={academyBadgeColor}
              emissive={academyBadgeColor}
              emissiveIntensity={scene.includesTraining ? 1.25 : 0.25}
            />
          </mesh>
          <Html position={[0, 0.02, 0.08]} center zIndexRange={[6, 0]}>
            <div className="boardroom-sign" style={{ borderColor: academyBadgeColor }}>
              <span className="status-dot" style={{ background: academyBadgeColor }} />
              ACADEMIA INTEGRA
            </div>
          </Html>
        </group>

        {/* Instructor Screen on North Wall */}
        <group position={[3.6, 1.72, -9.55]}>
          <KenneyModel name="televisionModern" position={[0, -0.5, -0.05]} scale={[3.6, 2.7, 1.6]} />
          <mesh position={[0, 0.14, 0.06]}>
            <planeGeometry args={[2.28, 1.1]} />
            <meshStandardMaterial
              map={academyTvTex.texture}
              emissive="#FFFFFF"
              emissiveMap={academyTvTex.texture}
              emissiveIntensity={scene.includesTraining ? screenGlow * 1.1 : screenGlow * 0.45}
              roughness={0.24}
            />
          </mesh>
        </group>

        {/* 2 Classroom Training Rows + Laptops + Modern Chairs */}
        {[-6.2, -4.3].map((rz) => (
          <group key={rz} position={[3.6, 0, rz]}>
            <KenneyModel
              name="desk"
              position={[-1.0, 0, 0]}
              scale={[2.25, 1.98, 1.25]}
              palette={{ wood: { color: '#F8FAFA' }, metal: { color: '#586B7A' } }}
            />
            <KenneyModel
              name="desk"
              position={[1.0, 0, 0]}
              scale={[2.25, 1.98, 1.25]}
              palette={{ wood: { color: '#F8FAFA' }, metal: { color: '#586B7A' } }}
            />
            <KenneyModel name="laptop" position={[-1.0, 0.77, -0.05]} scale={0.62} />
            <KenneyModel name="laptop" position={[1.0, 0.77, -0.05]} scale={0.62} />
            <KenneyModel
              name="chairModernFrameCushion"
              position={[-1.0, 0, 0.72]}
              rotation={[0, Math.PI, 0]}
              scale={[2.1, 1.95, 2.1]}
              palette={{ carpetBlue: { color: '#2F6657' } }}
            />
            <KenneyModel
              name="chairModernFrameCushion"
              position={[1.0, 0, 0.72]}
              rotation={[0, Math.PI, 0]}
              scale={[2.1, 1.95, 2.1]}
              palette={{ carpetBlue: { color: '#2F6657' } }}
            />
          </group>
        ))}

        {hoveredLandmark === 'academy' && (
          <Html position={[3.6, 2.2, -5.2]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Academia Integra · Aula Formación (Click)</div>
          </Html>
        )}
      </group>

      {/* ==================== RINCÓN CAFÉ & INTEGRATALKS LOUNGE (X: +7.4..+13.6, Z: -9.6..-2.0) ==================== */}
      <group>
        {/* Espresso & Snack Bar along North wall */}
        <KenneyModel
          name="kitchenCabinet"
          position={[9.15, 0, -9.15]}
          scale={2.15}
          palette={{ wood: { color: '#F6F8F7' }, woodDark: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="kitchenCabinet"
          position={[10.2, 0, -9.15]}
          scale={2.15}
          palette={{ wood: { color: '#F6F8F7' }, woodDark: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="kitchenFridgeSmall"
          position={[11.3, 0, -9.15]}
          scale={2.1}
          palette={{ metalLight: { color: '#E4ECEF' }, metalDark: { color: '#0B2A5B' } }}
        />

        {/* Water Cooler Dispenser beside the bar */}
        <group position={[8.1, 0, -9.1]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.42, 0.96, 0.42]} />
            <meshStandardMaterial color="#F2F6F8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.18, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.42, 14]} />
            <meshPhysicalMaterial color="#43C6F0" transparent opacity={0.62} roughness={0.12} />
          </mesh>
        </group>

        {/* Interactive Espresso Machine */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('coffee');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('coffee');
          }}
          onPointerOut={() => setPointer(null)}
        >
          <KenneyModel
            name="kitchenCoffeeMachine"
            position={[10.35, 0.96, -9.1]}
            scale={1.9}
            palette={{
              metalMedium: { color: '#1F2C38', roughness: 0.35, metalness: 0.55 },
              metal: { color: '#D0DBE2', roughness: 0.25, metalness: 0.7 },
              carpetWhite: { color: '#00B0F0', roughness: 0.3 },
            }}
          />
          {hoveredLandmark === 'coffee' && (
            <Html position={[10.35, 1.9, -9.1]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Click: preparar café / pausa IntegraTalks</div>
            </Html>
          )}
        </group>
        <CoffeeSteamCluster
          active={scene.coffeeBrewing || coffeeActiveOverride}
          reducedMotion={reducedMotion}
        />

        {/* Lounge Seating Area (Sofa & Armchair aligned cleanly to lounge_sofa / lounge_chair seats!) */}
        <KenneyModel
          name="rugRounded"
          position={[10.45, 0.008, -4.65]}
          scale={[3.1, 1.2, 3.2]}
          palette={{
            carpet: { color: '#C89B84', roughness: 0.92 },
            carpetDarker: { color: '#B78770', roughness: 0.92 },
          }}
        />
        <KenneyModel
          name="loungeDesignSofaCorner"
          position={[11.65, 0, -5.25]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={2.05}
          palette={{ carpetBlue: { color: '#1B4973', roughness: 0.85 } }}
        />
        <KenneyModel
          name="loungeDesignChair"
          position={[8.75, 0, -4.35]}
          rotation={[0, Math.PI / 2.2, 0]}
          scale={1.95}
          palette={{ carpetBlue: { color: '#2F6657', roughness: 0.85 } }}
        />
        <KenneyModel name="tableCoffeeGlass" position={[10.1, 0, -4.65]} scale={2.05} />
        <KenneyModel
          name="lampRoundFloor"
          position={[12.8, 0, -8.2]}
          scale={2.25}
          palette={{
            metal: { color: '#2E3C47', roughness: 0.4, metalness: 0.5 },
            lamp: {
              color: '#FFF6DE',
              emissive: '#FFD68A',
              emissiveIntensity: lampEmissiveIntensity,
            },
          }}
        />
        <KenneyModel
          name="stoolBar"
          position={[9.15, 0, -7.85]}
          scale={1.95}
          palette={{ carpet: { color: '#0B2A5B' }, wood: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="pottedPlant"
          position={[12.9, 0, -2.5]}
          scale={2.2}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#5A7D52' } }}
        />
      </group>

      {/* ==================== TERRAZA EXTERIOR TRANSITABLE (CANTILEVERED EAST DECK X: +14..+18.4) ==================== */}
      <group
        position={[16.2, 0, -5.2]}
        onClick={(e) => {
          e.stopPropagation();
          onInteractLandmark('terrace');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setPointer('terrace');
        }}
        onPointerOut={() => setPointer(null)}
      >
        {/* Warm timber outdoor deck cantilevered seamlessly off the 2nd floor */}
        <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.28, 7.6]} />
          <meshStandardMaterial color="#BFA07A" roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[4.6, 0.14, 7.8]} />
          <meshStandardMaterial color="#F2F4F3" roughness={0.72} />
        </mesh>

        {/* Terracotta Architectural Pergola Overhead Beams, 4 Grounded Posts & Slats */}
        {[-2.02, 2.02].map((px) =>
          [-3.6, 3.6].map((pz) => (
            <mesh key={`${px}-${pz}`} position={[px, 1.29, pz]} castShadow>
              <boxGeometry args={[0.13, 2.58, 0.13]} />
              <meshStandardMaterial color="#303D47" roughness={0.45} metalness={0.45} />
            </mesh>
          ))
        )}
        <mesh position={[0, 2.6, -3.6]} castShadow>
          <boxGeometry args={[4.2, 0.13, 0.13]} />
          <meshStandardMaterial color="#303D47" roughness={0.45} metalness={0.45} />
        </mesh>
        <mesh position={[0, 2.6, 3.6]} castShadow>
          <boxGeometry args={[4.2, 0.13, 0.13]} />
          <meshStandardMaterial color="#303D47" roughness={0.45} metalness={0.45} />
        </mesh>
        <mesh position={[2.02, 2.6, 0]} castShadow>
          <boxGeometry args={[0.13, 0.13, 7.34]} />
          <meshStandardMaterial color="#303D47" roughness={0.45} metalness={0.45} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => -3.0 + i * 0.86).map((sz) => (
          <mesh key={sz} position={[0, 2.66, sz]} castShadow>
            <boxGeometry args={[4.05, 0.06, 0.12]} />
            <meshStandardMaterial color="#B78770" roughness={0.76} />
          </mesh>
        ))}

        {/* Warm dusk/night architectural pergola LED strip */}
        {mood !== 'day' && (
          <mesh position={[0, 2.56, 0]}>
            <boxGeometry args={[0.08, 0.04, 6.8]} />
            <meshStandardMaterial
              color="#FFE7B3"
              emissive="#FFD47F"
              emissiveIntensity={mood === 'night' ? 1.65 : 0.8}
            />
          </mesh>
        )}

        {/* Clear Glass Terrace Safety Balustrade */}
        <mesh position={[2.16, 0.56, 0]}>
          <boxGeometry args={[0.05, 1.05, 7.5]} />
          <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.32} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0.56, -3.76]}>
          <boxGeometry args={[4.35, 1.05, 0.05]} />
          <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.32} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0.56, 3.76]}>
          <boxGeometry args={[4.35, 1.05, 0.05]} />
          <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.32} roughness={0.12} />
        </mesh>

        {/* Outdoor Café Tables, Chairs & Terracotta Planters */}
        {[-1.7, 1.5].map((tz) => (
          <group key={tz} position={[0.3, 0, tz]}>
            <mesh position={[0, 0.74, 0]} castShadow>
              <cylinderGeometry args={[0.56, 0.56, 0.05, 18]} />
              <meshStandardMaterial color="#F6F8F7" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.37, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.18, 0.74, 12]} />
              <meshStandardMaterial color="#344452" roughness={0.45} metalness={0.45} />
            </mesh>
            <KenneyModel
              name="chairModernFrameCushion"
              position={[-0.78, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[1.95, 1.9, 1.95]}
              palette={{ carpetBlue: { color: '#B78770' } }}
            />
            <KenneyModel
              name="chairModernFrameCushion"
              position={[0.78, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[1.95, 1.9, 1.95]}
              palette={{ carpetBlue: { color: '#B78770' } }}
            />
          </group>
        ))}

        <KenneyModel
          name="pottedPlant"
          position={[1.45, 0, -3.1]}
          scale={2.25}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#5E8255' } }}
        />
        <KenneyModel
          name="pottedPlant"
          position={[1.45, 0, 3.1]}
          scale={2.25}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#6E8F64' } }}
        />
        {hoveredLandmark === 'terrace' && (
          <Html position={[0, 2.1, 0]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Terraza Exterior DAT Alierta · Pérgola (Click)</div>
          </Html>
        )}
      </group>

      {/* ==================== ZONA COMERCIAL · PHONE BOOTH #2 + PRINTER ==================== */}
      <group>
        <AcousticPhoneBooth
          position={[-1.95, 0, 3.45]}
          rotationY={-Math.PI / 2}
          hovered={hoveredLandmark === 'phone_booth'}
          onClick={() => onInteractLandmark('phone_booth')}
          onPointerOver={() => setPointer('phone_booth')}
          onPointerOut={() => setPointer(null)}
        />
        {hoveredLandmark === 'phone_booth' && (
          <Html position={[-1.95, 2.75, 3.45]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Cabina Acústica · Llamadas (Click)</div>
          </Html>
        )}

        {/* Proposal Printer & BORRADOR Station */}
        <group
          position={[-1.85, 0, 7.2]}
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('printer');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('printer');
          }}
          onPointerOut={() => setPointer(null)}
        >
          <KenneyModel
            name="sideTableDrawers"
            position={[0, 0, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={1.9}
            palette={{ wood: { color: '#F6F8F8' }, metal: { color: '#586A78' } }}
          />
          <mesh position={[0, 0.94, 0]} castShadow>
            <boxGeometry args={[0.64, 0.42, 0.7]} />
            <meshStandardMaterial color="#E6ECEF" roughness={0.42} />
          </mesh>
          <mesh position={[0, 1.17, 0]} castShadow>
            <boxGeometry args={[0.6, 0.05, 0.66]} />
            <meshStandardMaterial color="#273847" roughness={0.4} />
          </mesh>
          <mesh position={[-0.325, 1.06, 0.14]}>
            <boxGeometry args={[0.02, 0.04, 0.26]} />
            <meshStandardMaterial
              color={scene.agents.offers.state === 'waiting' ? '#D5A13D' : '#00B0F0'}
              emissive={scene.agents.offers.state === 'waiting' ? '#D5A13D' : '#00B0F0'}
              emissiveIntensity={1.2}
            />
          </mesh>
          {scene.artifacts.some((a) => a.agent === 'offers') && (
            <mesh position={[-0.22, 1.21, 0]} castShadow>
              <boxGeometry args={[0.28, 0.04, 0.36]} />
              <meshStandardMaterial color="#D5A13D" roughness={0.45} />
            </mesh>
          )}
          {hoveredLandmark === 'printer' && (
            <Html position={[0, 1.7, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Estación Ofertas DOCX/PDF (Click)</div>
            </Html>
          )}
        </group>
      </group>

      {/* ==================== ZONA SOLUCIONES · GLASS FABRIC BOARD + DATA & AI SERVER LAB ==================== */}
      <group>
        {/* Interactive Glass Microsoft Fabric Architecture Board */}
        <group
          position={[5.3, 0, 6.1]}
          rotation={[0, -Math.PI / 2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onInteractLandmark('arch_board');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPointer('arch_board');
          }}
          onPointerOut={() => setPointer(null)}
        >
          {[-1.02, 1.02].map((lx) => (
            <group key={lx} position={[lx, 0, 0]}>
              <mesh position={[0, 0.96, 0]} castShadow>
                <cylinderGeometry args={[0.032, 0.032, 1.92, 10]} />
                <meshStandardMaterial color="#30404D" roughness={0.4} metalness={0.5} />
              </mesh>
              <mesh position={[0, 0.04, 0]} castShadow>
                <boxGeometry args={[0.08, 0.06, 0.56]} />
                <meshStandardMaterial color="#30404D" roughness={0.4} metalness={0.5} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 1.56, 0]} castShadow>
            <boxGeometry args={[2.25, 1.2, 0.06]} />
            <meshStandardMaterial
              color={hoveredLandmark === 'arch_board' ? '#00B0F0' : '#1E2D3B'}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 1.56, 0.036]}>
            <planeGeometry args={[2.12, 1.08]} />
            <meshStandardMaterial
              map={fabricBoardTex.texture}
              emissive="#FFFFFF"
              emissiveMap={fabricBoardTex.texture}
              emissiveIntensity={screenGlow}
              roughness={0.22}
            />
          </mesh>
          <mesh position={[0, 1.56, -0.036]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[2.12, 1.08]} />
            <meshStandardMaterial
              map={fabricBoardTex.texture}
              emissive="#FFFFFF"
              emissiveMap={fabricBoardTex.texture}
              emissiveIntensity={screenGlow * 0.8}
              roughness={0.22}
            />
          </mesh>
          {hoveredLandmark === 'arch_board' && (
            <Html position={[0, 2.45, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Pizarra Microsoft Fabric · Data & AI (Click)</div>
            </Html>
          )}
        </group>

        {/* Cutaway Glass Data & AI Server Lab Pod (3 Azure/Fabric Telemetry Racks visible from above!) */}
        <group position={[5.35, 0, 3.15]}>
          {/* Raised anti-static tech floor mat */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[1.68, 0.04, 1.98]} />
            <meshStandardMaterial color="#213344" roughness={0.75} />
          </mesh>
          {/* Open-top glass walls */}
          <mesh position={[0, 1.05, -0.97]}>
            <boxGeometry args={[1.66, 2.06, 0.04]} />
            <meshPhysicalMaterial color="#A9C3CC" transparent opacity={0.24} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.05, 0.97]}>
            <boxGeometry args={[1.66, 2.06, 0.04]} />
            <meshPhysicalMaterial color="#A9C3CC" transparent opacity={0.24} roughness={0.1} />
          </mesh>
          <mesh position={[-0.82, 1.05, 0]}>
            <boxGeometry args={[0.04, 2.06, 1.94]} />
            <meshPhysicalMaterial color="#A9C3CC" transparent opacity={0.22} roughness={0.1} />
          </mesh>
          <mesh position={[0.82, 1.05, 0]}>
            <boxGeometry args={[0.04, 2.06, 1.94]} />
            <meshPhysicalMaterial color="#A9C3CC" transparent opacity={0.22} roughness={0.1} />
          </mesh>
          {/* Slim dark perimeter top rails (open cutaway center!) */}
          <mesh position={[0, 2.1, -0.97]}>
            <boxGeometry args={[1.72, 0.06, 0.07]} />
            <meshStandardMaterial color="#304150" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 2.1, 0.97]}>
            <boxGeometry args={[1.72, 0.06, 0.07]} />
            <meshStandardMaterial color="#304150" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[-0.82, 2.1, 0]}>
            <boxGeometry args={[0.07, 0.06, 1.98]} />
            <meshStandardMaterial color="#304150" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0.82, 2.1, 0]}>
            <boxGeometry args={[0.07, 0.06, 1.98]} />
            <meshStandardMaterial color="#304150" roughness={0.4} metalness={0.5} />
          </mesh>
          {[-0.54, 0, 0.54].map((rz, rIdx) => (
            <group key={rz} position={[0, 0, rz]}>
              <mesh position={[0, 0.88, 0]} castShadow>
                <boxGeometry args={[0.64, 1.72, 0.44]} />
                <meshStandardMaterial color="#182736" roughness={0.38} metalness={0.42} />
              </mesh>
              {/* Subtle cyan top status bar visible from aerial isometric view */}
              <mesh position={[0, 1.75, 0]}>
                <boxGeometry args={[0.52, 0.02, 0.34]} />
                <meshStandardMaterial
                  color={rIdx === 1 ? '#36966C' : '#00B0F0'}
                  emissive={rIdx === 1 ? '#36966C' : '#00B0F0'}
                  emissiveIntensity={1.1}
                />
              </mesh>
              {[0.38, 0.64, 0.9, 1.16, 1.42].map((ly, i) => (
                <group key={ly}>
                  <mesh position={[0.325, ly, 0]}>
                    <boxGeometry args={[0.015, 0.035, 0.32]} />
                    <meshStandardMaterial
                      color={(i + rIdx) % 3 === 0 ? '#36966C' : '#00B0F0'}
                      emissive={(i + rIdx) % 3 === 0 ? '#36966C' : '#00B0F0'}
                      emissiveIntensity={1.3}
                    />
                  </mesh>
                  <mesh position={[-0.325, ly, 0]}>
                    <boxGeometry args={[0.015, 0.035, 0.32]} />
                    <meshStandardMaterial
                      color={(i + rIdx) % 3 === 0 ? '#36966C' : '#00B0F0'}
                      emissive={(i + rIdx) % 3 === 0 ? '#36966C' : '#00B0F0'}
                      emissiveIntensity={1.1}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          ))}
        </group>
      </group>

      {/* ==================== ZONA COMUNICACIÓN · 6-SLIDE PRESENTATION WALL TV (FACING +Z!) ==================== */}
      <group
        position={[9.8, 0, 2.25]}
        onClick={(e) => {
          e.stopPropagation();
          onInteractLandmark('slides_tv');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setPointer('slides_tv');
        }}
        onPointerOut={() => setPointer(null)}
      >
        <KenneyModel
          name="bookcaseOpenLow"
          position={[0, 0, 0]}
          scale={[3.4, 1.5, 1.35]}
          palette={{ wood: { color: '#F4F7F8' } }}
        />
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[2.15, 1.24, 0.08]} />
          <meshStandardMaterial
            color={hoveredLandmark === 'slides_tv' ? '#D70A8A' : '#182430'}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, 1.4, 0.048]}>
          <planeGeometry args={[2.0, 1.12]} />
          <meshStandardMaterial
            map={slidesTvTex.texture}
            emissive="#FFFFFF"
            emissiveMap={slidesTvTex.texture}
            emissiveIntensity={screenGlow * 1.15}
            roughness={0.22}
          />
        </mesh>
        {[-0.6, 0.6].map((sx) => (
          <mesh key={sx} position={[sx, 0.72, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.28, 10]} />
            <meshStandardMaterial color="#30404D" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {hoveredLandmark === 'slides_tv' && (
          <Html position={[0, 2.3, 0]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Pantalla PPTX 6 Diapositivas · Diseño (Click)</div>
          </Html>
        )}
      </group>

      {/* ==================== ZONA OPERACIÓN ARCHIVE, DIVIDERS & INDOOR PLANTS ==================== */}
      <KenneyModel
        name="bookcaseClosedDoors"
        position={[13.2, 0, 5.2]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={2.0}
        palette={{ wood: { color: '#D7C2A3' } }}
      />
      <KenneyModel
        name="pottedPlant"
        position={[7.25, 0, 8.85]}
        scale={2.1}
        palette={{ wood: { color: '#B78770' }, plant: { color: '#5E8255' } }}
      />
      <KenneyModel
        name="pottedPlant"
        position={[-0.95, 0, 8.85]}
        scale={2.1}
        palette={{ wood: { color: '#B78770' }, plant: { color: '#6E8F64' } }}
      />
      <KenneyModel
        name="pottedPlant"
        position={[13.1, 0, 2.5]}
        scale={2.0}
        palette={{ wood: { color: '#B78770' }, plant: { color: '#5E8255' } }}
      />

      {/* Acoustic Low Glass Zone Dividers separating Comercial / Soluciones / Comunicación-Operación */}
      {[-0.95, 7.1].map((dx) => (
        <group key={dx} position={[dx, 0, 5.4]}>
          <mesh position={[0, 0.76, 0]}>
            <boxGeometry args={[0.05, 1.52, 5.4]} />
            <meshPhysicalMaterial color="#B8D4DD" transparent opacity={0.26} roughness={0.14} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.09, 0.12, 5.46]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
