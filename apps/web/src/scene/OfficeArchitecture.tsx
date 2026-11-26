import { useEffect, useMemo, useRef, useState } from 'react';
import { Html, useTexture } from '@react-three/drei';
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
  drawBoardroomScreen,
  drawDagWhiteboard,
  drawFabricArchitectureBoard,
  drawHeritageTotem,
  drawPresentationWallTv,
  drawReceptionLogoWall,
  drawRetroPcScreen,
  loadBrandSvgImage,
} from './screenTextures';

interface OfficeArchitectureProps {
  scene: OfficeSceneState;
  mood: LightingMood;
  coffeeActiveOverride?: boolean;
  reducedMotion: boolean;
  onInteractLandmark: (
    landmark: 'reception_mail' | 'retro_pc' | 'whiteboard' | 'boardroom' | 'coffee' | 'printer' | 'arch_board' | 'slides_tv'
  ) => void;
}

function CoffeeSteamCluster({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  useFrame(({ clock }) => {
    if (!active || reducedMotion) return;
    const t = clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const p = (t * 0.42 + i * 0.33) % 1;
      ref.current.position.y = 1.24 + p * 0.42;
      ref.current.position.x = 5.75 + Math.sin(t * 2.1 + i * 2) * 0.04;
      ref.current.scale.setScalar(0.8 + p * 0.7);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.4;
    });
  });

  if (!active || reducedMotion) return null;

  return (
    <group>
      {refs.map((ref, idx) => (
        <mesh key={idx} ref={ref} position={[5.75, 1.3 + idx * 0.1, -5.82]}>
          <sphereGeometry args={[0.042, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * IDOM DAT Alierta biophilic interior vertical green wall on the West spine.
 */
function VerticalGardenWall({ position }: { position: [number, number, number] }) {
  const leafClusters = useMemo(() => {
    const items: Array<{
      pos: [number, number, number];
      scale: [number, number, number];
      rot: [number, number, number];
      color: string;
    }> = [];
    const greens = ['#3B5E38', '#4A7044', '#5C8252', '#2E4C2D', '#6E9460', '#7DA16E'];
    for (let i = 0; i < 84; i += 1) {
      const s1 = ((i * 73 + 19) % 100) / 100;
      const s2 = ((i * 41 + 37) % 100) / 100;
      const s3 = ((i * 29 + 11) % 100) / 100;
      const y = 0.28 + s1 * 2.52;
      const z = -1.02 + s2 * 2.04;
      const depth = 0.075 + s3 * 0.08;
      items.push({
        pos: [depth, y, z],
        scale: [0.38 + s3 * 0.26, 0.72 + s1 * 0.52, 0.8 + s2 * 0.65],
        rot: [s1 * 1.4, s2 * 1.2, s3 * 0.8],
        color: greens[i % greens.length],
      });
    }
    return items;
  }, []);

  return (
    <group position={position}>
      {/* Deep organic moss & soil substrate */}
      <mesh position={[0.03, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.75, 2.28]} />
        <meshStandardMaterial color="#213522" roughness={0.95} />
      </mesh>
      {/* Vertical oak planter ribs */}
      {[-1.14, -0.38, 0.38, 1.14].map((rz) => (
        <mesh key={rz} position={[0.06, 1.55, rz]}>
          <boxGeometry args={[0.07, 2.78, 0.055]} />
          <meshStandardMaterial color="#D2BA96" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0.06, 2.95, 0]}>
        <boxGeometry args={[0.1, 0.07, 2.36]} />
        <meshStandardMaterial color="#D2BA96" roughness={0.7} />
      </mesh>
      <mesh position={[0.06, 0.14, 0]}>
        <boxGeometry args={[0.1, 0.08, 2.36]} />
        <meshStandardMaterial color="#D2BA96" roughness={0.7} />
      </mesh>
      {leafClusters.map((c, idx) => (
        <mesh key={idx} position={c.pos} scale={c.scale} rotation={c.rot} castShadow>
          <icosahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color={c.color} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

export function OfficeArchitecture({
  scene,
  mood,
  coffeeActiveOverride = false,
  reducedMotion,
  onInteractLandmark,
}: OfficeArchitectureProps) {
  // Real Poly Haven CC0 PBR oak plank floor textures
  const [floorDiff, floorNor, floorRough] = useTexture([
    '/assets/textures/laminate_floor_02_diff_1k.jpg',
    '/assets/textures/laminate_floor_02_nor_gl_1k.jpg',
    '/assets/textures/laminate_floor_02_rough_1k.jpg',
  ]);

  useMemo(() => {
    for (const tex of [floorDiff, floorNor, floorRough]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 3.6);
      tex.anisotropy = 8;
    }
    floorDiff.colorSpace = THREE.SRGBColorSpace;
  }, [floorDiff, floorNor, floorRough]);

  // Official Integra SVG logos loaded into HTMLImageElements for crisp 3D CanvasTextures
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

  // Dynamic CanvasTextures for every signage & screen across the office
  const receptionWallTex = useMemo(() => createCanvasTexture(640, 290), []);
  const heritageTotemTex = useMemo(() => createCanvasTexture(380, 440), []);
  const dagBoardTex = useMemo(() => createCanvasTexture(780, 410), []);
  const fabricBoardTex = useMemo(() => createCanvasTexture(750, 340), []);
  const slidesTvTex = useMemo(() => createCanvasTexture(512, 300), []);
  const boardroomTvTex = useMemo(() => createCanvasTexture(640, 310), []);
  const retroPcTex = useMemo(() => createCanvasTexture(256, 170), []);

  useEffect(() => {
    drawReceptionLogoWall(receptionWallTex.ctx, logoColor);
    receptionWallTex.texture.needsUpdate = true;
  }, [logoColor, receptionWallTex]);

  useEffect(() => {
    drawHeritageTotem(heritageTotemTex.ctx, logoWhite);
    heritageTotemTex.texture.needsUpdate = true;
  }, [logoWhite, heritageTotemTex]);

  useEffect(() => {
    drawDagWhiteboard(
      dagBoardTex.ctx,
      scene.planTasks,
      scene.includesTraining,
      scene.status
    );
    dagBoardTex.texture.needsUpdate = true;
  }, [scene.planTasks, scene.includesTraining, scene.status, dagBoardTex]);

  useEffect(() => {
    drawBoardroomScreen(boardroomTvTex.ctx, scene, logoWhite);
    boardroomTvTex.texture.needsUpdate = true;
  }, [scene, logoWhite, boardroomTvTex]);

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
      retroPcTex.texture.dispose();
    };
  }, [
    receptionWallTex,
    heritageTotemTex,
    dagBoardTex,
    fabricBoardTex,
    slidesTvTex,
    boardroomTvTex,
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

  const wallEmissive = mood === 'night' ? 0.14 : 0.03;
  const screenGlow = mood === 'night' ? 0.42 : mood === 'golden' ? 0.26 : 0.16;
  const lampEmissiveIntensity = mood === 'night' ? 1.4 : mood === 'golden' ? 0.8 : 0.1;

  // Horizontal terracotta louver rows along the North DAT Alierta panoramic façade
  const louverRows = [2.25, 2.48, 2.71, 2.94, 3.17];
  const windowColumns = [-8.9, -6.0, -3.2, 0, 3.2, 6.0, 8.9];

  const boardroomBadgeColor =
    scene.boardroomStatus === 'approval'
      ? '#D5A13D'
      : scene.boardroomStatus === 'meeting'
        ? '#00B0F0'
        : '#36966C';

  const setPointer = (name: string | null) => {
    setHoveredLandmark(name);
    document.body.style.cursor = name ? 'pointer' : 'auto';
  };

  return (
    <group>
      {/* ==================== MAIN ARCHITECTURAL FLOORPLATE (18m x 13m) ==================== */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[18.0, 0.3, 13.0]} />
        <meshStandardMaterial
          map={floorDiff}
          normalMap={floorNor}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          roughnessMap={floorRough}
          color="#EADBC4"
          roughness={0.82}
        />
      </mesh>

      {/* IDOM Cantilevered Architectural Slab Rim + Terracotta Trim */}
      <mesh position={[0, -0.34, 0]} receiveShadow>
        <boxGeometry args={[18.36, 0.14, 13.36]} />
        <meshStandardMaterial color="#F2F4F3" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.22, 6.56]}>
        <boxGeometry args={[18.18, 0.09, 0.08]} />
        <meshStandardMaterial color="#B78770" roughness={0.78} />
      </mesh>
      <mesh position={[9.06, -0.22, 0]}>
        <boxGeometry args={[0.08, 0.09, 13.18]} />
        <meshStandardMaterial color="#B78770" roughness={0.78} />
      </mesh>

      {/* Subtle Architectural Floor Zone Carpet/Stone Inlays (distinguishing the 5 zones cleanly) */}
      {/* Reception light architectural stone inlay */}
      <mesh position={[-6.9, 0.006, 3.7]} receiveShadow>
        <boxGeometry args={[3.9, 0.012, 4.9]} />
        <meshStandardMaterial color="#E6ECEC" roughness={0.72} />
      </mesh>
      {/* Sala Alierta acoustic slate carpet inlay */}
      <mesh position={[0, 0.006, -3.7]} receiveShadow>
        <boxGeometry args={[6.1, 0.012, 4.7]} />
        <meshStandardMaterial color="#D6DFE5" roughness={0.92} />
      </mesh>
      {/* Subtle central corridor walking guide strip */}
      <mesh position={[0, 0.005, 0.25]} receiveShadow>
        <boxGeometry args={[17.2, 0.008, 1.45]} />
        <meshStandardMaterial color="#E2D3BC" roughness={0.84} />
      </mesh>

      {/* Minimalist Architectural Floor Zone Strip Markers */}
      {(Object.entries(ZONE_META) as Array<[keyof typeof ZONE_META, (typeof ZONE_META)[keyof typeof ZONE_META]]>).map(
        ([zoneId, zm]) => (
          <group key={zoneId} position={zm.tagPos}>
            <mesh position={[0, 0.006, 0]}>
              <boxGeometry args={[1.55, 0.008, 0.08]} />
              <meshStandardMaterial color={zm.color} roughness={0.5} />
            </mesh>
          </group>
        )
      )}

      {/* ==================== NORTH PANORAMIC GLASS WALL + DAT ALIERTA TERRACOTTA LOUVERS ==================== */}
      <group position={[0, 0, -6.5]}>
        {/* Lower architectural knee wall */}
        <mesh position={[0, 0.22, 0]} receiveShadow>
          <boxGeometry args={[18.0, 0.44, 0.16]} />
          <meshStandardMaterial color="#EEF2F1" roughness={0.84} />
        </mesh>
        {/* Cantilevered IDOM white ceiling slab header */}
        <mesh position={[0, 3.45, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[18.3, 0.2, 0.65]} />
          <meshStandardMaterial color="#F5F7F6" roughness={0.75} />
        </mesh>
        {/* Panoramic architectural ribbon glass */}
        <mesh position={[0, 1.88, 0]}>
          <boxGeometry args={[17.85, 2.95, 0.06]} />
          <meshPhysicalMaterial
            color="#A9C3CC"
            transparent
            opacity={0.34}
            roughness={0.1}
            metalness={0.08}
            reflectivity={0.65}
          />
        </mesh>
        {/* Dark anthracite window mullions */}
        {windowColumns.map((wx) => (
          <mesh key={wx} position={[wx, 1.72, 0.02]} castShadow>
            <boxGeometry args={[0.12, 3.42, 0.18]} />
            <meshStandardMaterial color="#303D47" roughness={0.48} metalness={0.35} />
          </mesh>
        ))}
        {/* Horizontal DAT Alierta ceramic terracotta louver bands (celosías horizontales) */}
        {louverRows.map((ly) => (
          <group key={ly} position={[0, ly, -0.14]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[18.1, 0.095, 0.15]} />
              <meshStandardMaterial color="#B78770" roughness={0.76} />
            </mesh>
            {/* Perforated ceramic brick rhythm blocks */}
            {Array.from({ length: 24 }, (_, idx) => -8.6 + idx * 0.75).map((bx) => (
              <mesh key={bx} position={[bx, 0.06, -0.04]} castShadow>
                <boxGeometry args={[0.38, 0.06, 0.08]} />
                <meshStandardMaterial
                  color={idxOrTint(bx, ly)}
                  roughness={0.8}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Full DAT Alierta Campus Exterior is rendered by CampusExterior.tsx */}

      {/* ==================== WEST ARCHITECTURAL SPINE WALL (X = -9.0) ==================== */}
      <group position={[-9.0, 0, 0]}>
        <mesh position={[0, 1.72, 0]} receiveShadow>
          <boxGeometry args={[0.18, 3.44, 13.0]} />
          <meshStandardMaterial color="#F3F6F5" roughness={0.88} />
        </mesh>
        {/* Top architectural ceiling cornice */}
        <mesh position={[0.16, 3.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.2, 13.2]} />
          <meshStandardMaterial color="#F5F7F6" roughness={0.75} />
        </mesh>
        {/* Acoustic oak vertical wood slats behind reception & corridor */}
        {Array.from({ length: 14 }, (_, i) => -0.9 + i * 0.16).map((sz) => (
          <mesh key={sz} position={[0.12, 1.7, sz]} castShadow>
            <boxGeometry args={[0.05, 3.15, 0.07]} />
            <meshStandardMaterial color="#C8AE88" roughness={0.74} />
          </mesh>
        ))}
      </group>

      {/* Full-height Interior Vertical Biophilic Garden (DAT Alierta IDOM signature!) */}
      <VerticalGardenWall position={[-8.92, 0, 0.2]} />

      {/* ==================== RECEPTION FEATURE WALL (REAL INTEGRA SVG LOGO) ==================== */}
      <group position={[-8.86, 1.88, 3.55]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 1.48, 3.1]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
        </mesh>
        {/* Subtle backlit Integra cyan aura strip behind plaque */}
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.03, 1.54, 3.18]} />
          <meshStandardMaterial
            color="#00B0F0"
            emissive="#00B0F0"
            emissiveIntensity={mood === 'night' ? 0.85 : 0.22}
          />
        </mesh>
        <mesh position={[0.048, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.98, 1.36]} />
          <meshStandardMaterial
            map={receptionWallTex.texture}
            roughness={0.35}
            emissive="#FFFFFF"
            emissiveMap={receptionWallTex.texture}
            emissiveIntensity={wallEmissive}
          />
        </mesh>
      </group>

      {/* ==================== DIRECTOR'S INTERACTIVE DAG PLAN WHITEBOARD ==================== */}
      <group
        position={[-8.86, 1.62, -3.4]}
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
          <boxGeometry args={[0.08, 1.75, 3.18]} />
          <meshStandardMaterial
            color={hoveredLandmark === 'whiteboard' ? '#00B0F0' : '#B5C2CC'}
            roughness={0.4}
            metalness={0.28}
          />
        </mesh>
        <mesh position={[0.048, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.04, 1.62]} />
          <meshStandardMaterial
            map={dagBoardTex.texture}
            roughness={0.32}
            emissive="#FFFFFF"
            emissiveMap={dagBoardTex.texture}
            emissiveIntensity={screenGlow * 0.7}
          />
        </mesh>
        {/* Floor waypoint marker in front of whiteboard */}
        <mesh position={[1.35, -1.605, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.37, 28]} />
          <meshBasicMaterial color="#00B0F0" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ==================== HALL RECEPCIÓN (FRONT-LEFT) ==================== */}
      <group>
        {/* Architectural reception desk counter */}
        <group position={[-6.85, 0, 3.3]}>
          <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.85, 1.04, 2.35]} />
            <meshStandardMaterial color="#FBFDFC" roughness={0.42} />
          </mesh>
          {/* Warm oak top cap */}
          <mesh position={[0.06, 1.05, 0]} castShadow>
            <boxGeometry args={[0.96, 0.06, 2.42]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.65} />
          </mesh>
          {/* Integra cyan vertical light accent on counter front */}
          <mesh position={[0.435, 0.52, 0]}>
            <boxGeometry args={[0.02, 0.08, 2.1]} />
            <meshStandardMaterial
              color="#00B0F0"
              emissive="#00B0F0"
              emissiveIntensity={mood === 'night' ? 0.9 : 0.3}
            />
          </mesh>

          {/* Interactive Incoming CRM Mail / Opportunity Drop Tray */}
          <group
            position={[0.14, 1.09, -0.58]}
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
              <boxGeometry args={[0.42, 0.04, 0.52]} />
              <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
            </mesh>
            {/* Glowing CRM opportunity envelope */}
            <group ref={envelopeRef} position={[0, 0.06, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.32, 0.035, 0.42]} />
                <meshStandardMaterial
                  color={scene.receptionAlert ? '#00B0F0' : '#FFFFFF'}
                  emissive={scene.receptionAlert ? '#00B0F0' : '#000000'}
                  emissiveIntensity={scene.receptionAlert ? 0.55 : 0}
                  roughness={0.4}
                />
              </mesh>
            </group>
            {hoveredLandmark === 'reception_mail' && (
              <Html position={[0, 0.48, 0]} center zIndexRange={[10, 0]}>
                <div className="landmark-tooltip">Click: enviar señal CRM Nortia</div>
              </Html>
            )}
          </group>

          {/* Reception monitor (Kenney CC0) */}
          <KenneyModel
            name="laptop"
            position={[-0.1, 1.08, 0.45]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={0.7}
          />
        </group>

        {/* Integra 40 Años Heritage Totem Screen */}
        <group position={[-8.2, 0, 1.75]} rotation={[0, 0.42, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.82, 0.1, 0.45]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <boxGeometry args={[0.78, 1.96, 0.12]} />
            <meshStandardMaterial color="#182736" roughness={0.4} metalness={0.35} />
          </mesh>
          <mesh position={[0, 1.12, 0.068]}>
            <planeGeometry args={[0.7, 1.62]} />
            <meshStandardMaterial
              map={heritageTotemTex.texture}
              emissive="#FFFFFF"
              emissiveMap={heritageTotemTex.texture}
              emissiveIntensity={screenGlow * 0.9}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* 1986 Retro PC Easter Egg on Heritage Plinth (Calatayud 1986 -> Zaragoza 2029) */}
        <group
          position={[-7.85, 0, 5.45]}
          rotation={[0, 0.52, 0]}
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
          {/* Heritage oak & navy plinth */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.92, 0.8, 0.72]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.12, 0.37]}>
            <boxGeometry args={[0.62, 0.16, 0.02]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.4} />
          </mesh>
          {/* Kenney CC0 Vintage CRT + Keyboard */}
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
          {/* Glowing green 1986 phosphor screen overlay */}
          <mesh position={[-0.04, 1.0, 0.135]}>
            <planeGeometry args={[0.34, 0.24]} />
            <meshStandardMaterial
              map={retroPcTex.texture}
              emissive="#53FF8C"
              emissiveMap={retroPcTex.texture}
              emissiveIntensity={0.75}
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

        {/* Iconic Integra architectural brand cubes + greenery in Reception */}
        <group position={[-5.75, 0, 5.55]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.45} />
          </mesh>
          <mesh position={[0.44, 0.19, 0.12]} rotation={[0, 0.22, 0]} castShadow>
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
          position={[-8.35, 0, 4.4]}
          scale={2.2}
          palette={{ wood: { color: '#B78770', roughness: 0.8 }, plant: { color: '#5F8456', roughness: 0.84 } }}
        />
        <KenneyModel name="coatRackStanding" position={[-8.35, 0, -5.65]} scale={2.15} />
      </group>

      {/* ==================== SALA ALIERTA · GLASS-WALLED BOARDROOM (BACK-CENTER) ==================== */}
      <group>
        {/* Left & Right glass partitions */}
        {[-3.25, 3.25].map((gx) => (
          <group key={gx} position={[gx, 0, -3.75]}>
            <mesh position={[0, 1.52, 0]}>
              <boxGeometry args={[0.06, 2.96, 5.05]} />
              <meshPhysicalMaterial
                color="#B8D4DD"
                transparent
                opacity={0.28}
                roughness={0.12}
                metalness={0.05}
              />
            </mesh>
            {/* Frosted Integra privacy stripe */}
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[0.068, 0.36, 4.95]} />
              <meshStandardMaterial color="#E6F2F6" transparent opacity={0.45} roughness={0.6} />
            </mesh>
            {/* Aluminum mullions */}
            <mesh position={[0, 3.02, 0]}>
              <boxGeometry args={[0.09, 0.08, 5.15]} />
              <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
            </mesh>
            <mesh position={[0, 1.52, 2.52]}>
              <boxGeometry args={[0.09, 3.04, 0.09]} />
              <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
            </mesh>
          </group>
        ))}

        {/* Front glass wall flanking wide central doorway (X = -3.25..-0.95 and +0.95..+3.25) */}
        {[-2.1, 2.1].map((fx) => (
          <group key={fx} position={[fx, 0, -1.22]}>
            <mesh position={[0, 1.52, 0]}>
              <boxGeometry args={[2.22, 2.96, 0.06]} />
              <meshPhysicalMaterial
                color="#B8D4DD"
                transparent
                opacity={0.24}
                roughness={0.12}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[2.18, 0.28, 0.068]} />
              <meshStandardMaterial color="#E6F2F6" transparent opacity={0.42} roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Doorway transom header + glowing Sala Alierta Status Sign */}
        <mesh position={[0, 3.02, -1.22]}>
          <boxGeometry args={[6.6, 0.1, 0.1]} />
          <meshStandardMaterial color="#344452" roughness={0.4} metalness={0.45} />
        </mesh>
        <group position={[0, 2.74, -1.16]}>
          <mesh castShadow>
            <boxGeometry args={[1.95, 0.34, 0.08]} />
            <meshStandardMaterial color="#0B2A5B" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.045]}>
            <boxGeometry args={[1.82, 0.045, 0.02]} />
            <meshStandardMaterial
              color={boardroomBadgeColor}
              emissive={boardroomBadgeColor}
              emissiveIntensity={0.85}
            />
          </mesh>
          <Html position={[0, 0.02, 0.08]} center zIndexRange={[6, 0]}>
            <div
              className="boardroom-sign"
              style={{ borderColor: boardroomBadgeColor }}
            >
              <span
                className="status-dot"
                style={{ background: boardroomBadgeColor }}
              />
              {scene.boardroomStatus === 'approval'
                ? 'SALA ALIERTA · APROBACIÓN'
                : scene.boardroomStatus === 'meeting'
                  ? 'SALA ALIERTA · REUNIÓN'
                  : 'SALA ALIERTA'}
            </div>
          </Html>
        </group>

        {/* Conference Glass Table (Kenney CC0) — clickable to summon/dismiss meeting! */}
        <group
          position={[0, 0, -3.7]}
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
          <KenneyModel
            name="tableGlass"
            position={[0, 0, 0]}
            scale={[2.75, 2.25, 2.5]}
            palette={{
              metal: { color: '#96AAB8', roughness: 0.32, metalness: 0.55 },
              glass: { color: '#D8EEF5', transparent: true, opacity: 0.65, roughness: 0.1 },
            }}
          />
          {/* Subtle centerpiece notepad & mic puck */}
          <mesh position={[0, 0.76, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.045, 18]} />
            <meshStandardMaterial color="#1E2C3A" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.785, 0]}>
            <ringGeometry args={[0.07, 0.095, 18]} />
            <meshBasicMaterial color={boardroomBadgeColor} side={THREE.DoubleSide} />
          </mesh>
          {hoveredLandmark === 'boardroom' && (
            <Html position={[0, 1.35, 0]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Click: convocar / cerrar reunión en Sala Alierta</div>
            </Html>
          )}
        </group>

        {/* 6 Boardroom Chairs (Kenney CC0) positioned exactly at BOARDROOM_SEATS */}
        {BOARDROOM_SEATS.map((seat, idx) => (
          <KenneyModel
            key={idx}
            name="chairModernFrameCushion"
            position={[seat.pos.x, 0, seat.pos.z]}
            rotation={[0, seat.yaw + Math.PI, 0]}
            scale={[2.2, 2.0, 2.2]}
            palette={{
              carpetBlue: { color: idx === 0 ? '#0B2A5B' : '#244A6E', roughness: 0.82 },
              metal: { color: '#BFCBD4', roughness: 0.35, metalness: 0.5 },
            }}
          />
        ))}

        {/* Executive Wall TV inside Sala Alierta (North glass mount) */}
        <group position={[0, 1.55, -6.12]}>
          <KenneyModel name="televisionModern" position={[0, -0.5, -0.05]} scale={[3.4, 2.6, 1.6]} />
          <mesh position={[0, 0.12, 0.06]}>
            <planeGeometry args={[2.16, 1.05]} />
            <meshStandardMaterial
              map={boardroomTvTex.texture}
              emissive="#FFFFFF"
              emissiveMap={boardroomTvTex.texture}
              emissiveIntensity={screenGlow}
              roughness={0.25}
            />
          </mesh>
        </group>

        <KenneyModel
          name="pottedPlant"
          position={[-2.7, 0, -5.85]}
          scale={2.0}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#618458' } }}
        />
      </group>

      {/* ==================== RINCÓN CAFÉ & INTEGRATALKS LOUNGE (BACK-RIGHT) ==================== */}
      <group>
        {/* Espresso & Coffee Bar Counter along North wall */}
        <KenneyModel
          name="kitchenCabinet"
          position={[4.85, 0, -5.85]}
          scale={2.0}
          palette={{ wood: { color: '#F6F8F7' }, woodDark: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="kitchenCabinet"
          position={[5.75, 0, -5.85]}
          scale={2.0}
          palette={{ wood: { color: '#F6F8F7' }, woodDark: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="kitchenFridgeSmall"
          position={[6.68, 0, -5.85]}
          scale={2.0}
          palette={{ metalLight: { color: '#E4ECEF' }, metalDark: { color: '#0B2A5B' } }}
        />

        {/* Interactive Espresso Machine (Kenney CC0) */}
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
            position={[5.75, 0.9, -5.85]}
            scale={1.85}
            palette={{
              metalMedium: { color: '#1F2C38', roughness: 0.35, metalness: 0.55 },
              metal: { color: '#D0DBE2', roughness: 0.25, metalness: 0.7 },
              carpetWhite: { color: '#00B0F0', roughness: 0.3 },
            }}
          />
          {hoveredLandmark === 'coffee' && (
            <Html position={[5.75, 1.85, -5.85]} center zIndexRange={[10, 0]}>
              <div className="landmark-tooltip">Click: preparar café / pausa IntegraTalks</div>
            </Html>
          )}
        </group>
        <CoffeeSteamCluster
          active={scene.coffeeBrewing || coffeeActiveOverride}
          reducedMotion={reducedMotion}
        />

        {/* Lounge Rug + L-Sofa + Armchair + Glass Coffee Table + Warm Floor Lamp (all Kenney CC0) */}
        <KenneyModel
          name="rugRounded"
          position={[6.55, 0.008, -2.95]}
          scale={[2.6, 1.2, 2.7]}
          palette={{
            carpet: { color: '#C89B84', roughness: 0.92 },
            carpetDarker: { color: '#B78770', roughness: 0.92 },
          }}
        />
        <KenneyModel
          name="loungeDesignSofaCorner"
          position={[7.25, 0, -3.55]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.9}
          palette={{ carpetBlue: { color: '#1B4973', roughness: 0.85 } }}
        />
        <KenneyModel
          name="loungeDesignChair"
          position={[4.95, 0, -2.55]}
          rotation={[0, Math.PI / 2.2, 0]}
          scale={1.85}
          palette={{ carpetBlue: { color: '#2F6657', roughness: 0.85 } }}
        />
        <KenneyModel
          name="tableCoffeeGlass"
          position={[6.3, 0, -2.75]}
          scale={1.95}
        />
        <KenneyModel
          name="lampRoundFloor"
          position={[8.25, 0, -5.15]}
          scale={2.2}
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
          position={[4.85, 0, -4.95]}
          scale={1.95}
          palette={{ carpet: { color: '#0B2A5B' }, wood: { color: '#D7C2A3' } }}
        />
        <KenneyModel
          name="pottedPlant"
          position={[8.3, 0, -1.75]}
          scale={2.15}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#5A7D52' } }}
        />
      </group>

      {/* ==================== ZONA DIRECCIÓN AUXILIARY FURNITURE ==================== */}
      <group>
        <KenneyModel
          name="bookcaseOpen"
          position={[-4.2, 0, -5.82]}
          scale={2.0}
          palette={{ wood: { color: '#D7C2A3' } }}
        />
        <KenneyModel name="books" position={[-4.2, 0.82, -5.82]} scale={1.9} />
        <KenneyModel
          name="pottedPlant"
          position={[-7.95, 0, -5.7]}
          scale={2.0}
          palette={{ wood: { color: '#B78770' }, plant: { color: '#65885B' } }}
        />
      </group>

      {/* ==================== ZONA COMERCIAL · INTERACTIVE PROPOSAL PRINTER STATION ==================== */}
      <group
        position={[-1.05, 0, 4.55]}
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
        {/* Cabinet base (Kenney CC0) */}
        <KenneyModel
          name="sideTableDrawers"
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.85}
          palette={{ wood: { color: '#F6F8F8' }, metal: { color: '#586A78' } }}
        />
        {/* Multifunction Enterprise Printer Body */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.62, 0.42, 0.68]} />
          <meshStandardMaterial color="#E6ECEF" roughness={0.42} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.58, 0.05, 0.64]} />
          <meshStandardMaterial color="#273847" roughness={0.4} />
        </mesh>
        {/* Status LED bar */}
        <mesh position={[-0.315, 1.04, 0.14]}>
          <boxGeometry args={[0.02, 0.04, 0.24]} />
          <meshStandardMaterial
            color={scene.agents.offers.state === 'waiting' ? '#D5A13D' : '#00B0F0'}
            emissive={scene.agents.offers.state === 'waiting' ? '#D5A13D' : '#00B0F0'}
            emissiveIntensity={0.85}
          />
        </mesh>
        {/* Printed BORRADOR dossier sitting on output tray when offer artifact exists */}
        {scene.artifacts.some((a) => a.agent === 'offers') && (
          <mesh position={[-0.22, 1.19, 0]} castShadow>
            <boxGeometry args={[0.28, 0.04, 0.36]} />
            <meshStandardMaterial color="#D5A13D" roughness={0.45} />
          </mesh>
        )}
        {hoveredLandmark === 'printer' && (
          <Html position={[0, 1.65, 0]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Estación Ofertas DOCX/PDF (Click)</div>
          </Html>
        )}
      </group>
      <KenneyModel
        name="bookcaseOpenLow"
        position={[-1.05, 0, 2.25]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={1.9}
        palette={{ wood: { color: '#D7C2A3' } }}
      />
      <KenneyModel name="plantSmall2" position={[-1.05, 0.78, 2.25]} scale={1.7} />

      {/* ==================== ZONA SOLUCIONES · INTERACTIVE GLASS ARCHITECTURE BOARD ==================== */}
      <group
        position={[3.45, 0, 3.6]}
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
        {/* Architectural mobile stand legs */}
        {[-0.95, 0.95].map((lx) => (
          <group key={lx} position={[lx, 0, 0]}>
            <mesh position={[0, 0.92, 0]} castShadow>
              <cylinderGeometry args={[0.032, 0.032, 1.84, 10]} />
              <meshStandardMaterial color="#30404D" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[0.08, 0.06, 0.52]} />
              <meshStandardMaterial color="#30404D" roughness={0.4} metalness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Glass board frame + live Microsoft Fabric CanvasTexture */}
        <mesh position={[0, 1.48, 0]} castShadow>
          <boxGeometry args={[2.12, 1.12, 0.06]} />
          <meshStandardMaterial
            color={hoveredLandmark === 'arch_board' ? '#00B0F0' : '#1E2D3B'}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 1.48, 0.036]}>
          <planeGeometry args={[2.0, 1.0]} />
          <meshStandardMaterial
            map={fabricBoardTex.texture}
            emissive="#FFFFFF"
            emissiveMap={fabricBoardTex.texture}
            emissiveIntensity={screenGlow}
            roughness={0.22}
          />
        </mesh>
        {/* Back face also visible from opposite angle */}
        <mesh position={[0, 1.48, -0.036]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.0, 1.0]} />
          <meshStandardMaterial
            map={fabricBoardTex.texture}
            emissive="#FFFFFF"
            emissiveMap={fabricBoardTex.texture}
            emissiveIntensity={screenGlow * 0.8}
            roughness={0.22}
          />
        </mesh>
        {hoveredLandmark === 'arch_board' && (
          <Html position={[0, 2.35, 0]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Pizarra Microsoft Fabric · Data & AI (Click)</div>
          </Html>
        )}
      </group>

      {/* Sleek Edge / Azure AI Telemetry Pod in Soluciones */}
      <group position={[3.5, 0, 1.85]}>
        <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 1.24, 0.62]} />
          <meshStandardMaterial color="#192836" roughness={0.42} metalness={0.35} />
        </mesh>
        {[0.32, 0.52, 0.72, 0.92, 1.08].map((ly, i) => (
          <mesh key={ly} position={[0, ly, 0.315]}>
            <boxGeometry args={[0.38, 0.032, 0.015]} />
            <meshStandardMaterial
              color={i === 0 ? '#36966C' : '#00B0F0'}
              emissive={i === 0 ? '#36966C' : '#00B0F0'}
              emissiveIntensity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* ==================== ZONA COMUNICACIÓN · 6-SLIDE PRESENTATION WALL TV (FACING +Z TOWARD CAMERA!) ==================== */}
      <group
        position={[6.7, 0, 1.32]}
        rotation={[0, 0, 0]}
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
          scale={[3.2, 1.5, 1.35]}
          palette={{ wood: { color: '#F4F7F8' } }}
        />
        <mesh position={[0, 1.36, 0]} castShadow>
          <boxGeometry args={[1.95, 1.15, 0.08]} />
          <meshStandardMaterial
            color={hoveredLandmark === 'slides_tv' ? '#D70A8A' : '#182430'}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, 1.36, 0.048]}>
          <planeGeometry args={[1.82, 1.04]} />
          <meshStandardMaterial
            map={slidesTvTex.texture}
            emissive="#FFFFFF"
            emissiveMap={slidesTvTex.texture}
            emissiveIntensity={screenGlow * 1.15}
            roughness={0.22}
          />
        </mesh>
        {/* Stand legs */}
        {[-0.55, 0.55].map((sx) => (
          <mesh key={sx} position={[sx, 0.72, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.28, 10]} />
            <meshStandardMaterial color="#30404D" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {hoveredLandmark === 'slides_tv' && (
          <Html position={[0, 2.22, 0]} center zIndexRange={[10, 0]}>
            <div className="landmark-tooltip">Pantalla PPTX 6 Diapositivas · Diseño (Click)</div>
          </Html>
        )}
      </group>

      {/* ==================== ZONA OPERACIÓN AUXILIARY ARCHIVE & GREENERY ==================== */}
      <KenneyModel
        name="bookcaseClosedDoors"
        position={[8.42, 0, 4.1]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={1.85}
        palette={{ wood: { color: '#D7C2A3' } }}
      />
      <KenneyModel
        name="pottedPlant"
        position={[4.45, 0, 5.75]}
        scale={1.95}
        palette={{ wood: { color: '#B78770' }, plant: { color: '#5E8255' } }}
      />
      <KenneyModel
        name="pottedPlant"
        position={[-0.25, 0, 5.75]}
        scale={1.85}
        palette={{ wood: { color: '#B78770' }, plant: { color: '#6E8F64' } }}
      />

      {/* Acoustic low glass zone dividers between Comercial / Soluciones / Operación */}
      {[-0.35, 4.42].map((dx) => (
        <group key={dx} position={[dx, 0, 3.45]}>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.05, 1.44, 3.2]} />
            <meshPhysicalMaterial
              color="#B8D4DD"
              transparent
              opacity={0.26}
              roughness={0.14}
            />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.09, 0.12, 3.24]} />
            <meshStandardMaterial color="#D7C2A3" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function idxOrTint(x: number, y: number): string {
  const n = Math.abs(Math.round(x * 7 + y * 11)) % 3;
  return n === 0 ? '#B78770' : n === 1 ? '#C6967E' : '#A97861';
}
