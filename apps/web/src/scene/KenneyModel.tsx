import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type MaterialPaletteOverrides = Partial<
  Record<
    | 'wood'
    | 'woodDark'
    | 'woodBark'
    | 'woodBarkDark'
    | 'woodBirch'
    | 'leafsGreen'
    | 'leafsDark'
    | 'leafsFall'
    | 'grass'
    | 'dirt'
    | 'metal'
    | 'metalDark'
    | 'metalMedium'
    | 'metalLight'
    | 'carpet'
    | 'carpetBlue'
    | 'carpetDarker'
    | 'carpetWhite'
    | 'plant'
    | 'lamp'
    | 'glass'
    | 'colormap'
    | '_defaultMat',
    {
      color: string;
      roughness?: number;
      metalness?: number;
      emissive?: string;
      emissiveIntensity?: number;
      transparent?: boolean;
      opacity?: number;
    }
  >
>;

/**
 * Default Integra DAT Alierta 2029 architectural material harmonization for
 * Kenney CC0 GLB models (Furniture Kit, Nature Kit, Car Kit, City Kit).
 */
const BASE_INTEGRA_PALETTE: MaterialPaletteOverrides = {
  wood: { color: '#DCC7A6', roughness: 0.72, metalness: 0.02 },
  woodDark: { color: '#9E7B5A', roughness: 0.74, metalness: 0.04 },
  woodBark: { color: '#7C6552', roughness: 0.9, metalness: 0.0 },
  woodBarkDark: { color: '#614E40', roughness: 0.92, metalness: 0.0 },
  woodBirch: { color: '#CFC4B2', roughness: 0.85, metalness: 0.0 },
  leafsGreen: { color: '#6A8B5B', roughness: 0.86, metalness: 0.0 },
  leafsDark: { color: '#4E7047', roughness: 0.86, metalness: 0.0 },
  leafsFall: { color: '#C79458', roughness: 0.86, metalness: 0.0 },
  grass: { color: '#7D9762', roughness: 0.92, metalness: 0.0 },
  dirt: { color: '#9A8B7A', roughness: 0.94, metalness: 0.0 },
  metal: { color: '#C6D1DA', roughness: 0.36, metalness: 0.45 },
  metalLight: { color: '#E8EEF2', roughness: 0.32, metalness: 0.32 },
  metalMedium: { color: '#4E606E', roughness: 0.42, metalness: 0.42 },
  metalDark: { color: '#1E2A35', roughness: 0.38, metalness: 0.38 },
  carpet: { color: '#273D54', roughness: 0.86, metalness: 0.0 },
  carpetBlue: { color: '#174878', roughness: 0.84, metalness: 0.0 },
  carpetDarker: { color: '#1C2E42', roughness: 0.88, metalness: 0.0 },
  carpetWhite: { color: '#F5F7F9', roughness: 0.65, metalness: 0.0 },
  plant: { color: '#5E8056', roughness: 0.82, metalness: 0.0 },
  lamp: { color: '#FFF7E4', roughness: 0.4, metalness: 0.0 },
  glass: {
    color: '#B8D4DD',
    roughness: 0.14,
    metalness: 0.08,
    transparent: true,
    opacity: 0.48,
  },
  _defaultMat: { color: '#E9EEF2', roughness: 0.65, metalness: 0.05 },
};

export interface KenneyModelProps {
  /** Model filename without `.glb`, e.g. `desk` or `ext/tree_detailed` */
  name: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  palette?: MaterialPaletteOverrides;
  preserveTexture?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: (e: { stopPropagation: () => void }) => void;
  onPointerOver?: (e: { stopPropagation: () => void }) => void;
  onPointerOut?: () => void;
}

/**
 * Renders any curated Kenney CC0 GLB asset from `/assets/models/<name>.glb`,
 * automatically centering X/Z and grounding min.y = 0.
 * Preserves embedded colormap textures automatically (e.g., Car Kit / City Kit)
 * while harmonizing untextured materials into Integra's palette.
 */
export function KenneyModel({
  name,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 2,
  palette,
  preserveTexture = false,
  castShadow = true,
  receiveShadow = true,
  onClick,
  onPointerOver,
  onPointerOut,
}: KenneyModelProps) {
  const { scene } = useGLTF(`/assets/models/${name}.glb`);
  const paletteKey = palette ? JSON.stringify(palette) : '';

  const normalized = useMemo(() => {
    const root = new THREE.Group();
    const cloned = scene.clone(true);

    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = castShadow;
        obj.receiveShadow = receiveShadow;
        const origMat = obj.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const applyStyle = (m: THREE.Material): THREE.Material => {
          const matName = m.name as keyof MaterialPaletteOverrides;
          const std = m instanceof THREE.MeshStandardMaterial ? m : null;
          const override = palette?.[matName] ?? BASE_INTEGRA_PALETTE[matName];

          // Preserve embedded colormap atlas textures unless explicitly overridden
          if ((preserveTexture || std?.map) && !palette?.[matName]) {
            const clonedMat = m.clone() as THREE.MeshStandardMaterial;
            clonedMat.roughness = Math.max(0.45, clonedMat.roughness ?? 0.65);
            return clonedMat;
          }

          const next = new THREE.MeshStandardMaterial({
            name: m.name,
            map: std?.map && preserveTexture ? std.map : null,
            color: override?.color ?? (std ? std.color : '#D8E0E6'),
            roughness: override?.roughness ?? 0.68,
            metalness: override?.metalness ?? 0.06,
            transparent: override?.transparent ?? false,
            opacity: override?.opacity ?? 1,
          });
          if (override?.emissive) {
            next.emissive = new THREE.Color(override.emissive);
            next.emissiveIntensity = override.emissiveIntensity ?? 0.5;
          }
          return next;
        };
        obj.material = Array.isArray(origMat) ? origMat.map(applyStyle) : applyStyle(origMat);
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    if (!box.isEmpty()) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      cloned.position.set(-center.x, -box.min.y, -center.z);
    }

    root.add(cloned);
    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, castShadow, receiveShadow, preserveTexture, paletteKey]);

  const scaleVec: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scaleVec}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <primitive object={normalized} />
    </group>
  );
}

const PRELOAD_MODELS = [
  'desk',
  'deskCorner',
  'chairDesk',
  'chairModernFrameCushion',
  'computerScreen',
  'computerKeyboard',
  'computerMouse',
  'laptop',
  'televisionModern',
  'televisionVintage',
  'bookcaseOpen',
  'bookcaseOpenLow',
  'bookcaseClosedDoors',
  'books',
  'tableGlass',
  'tableCoffeeGlass',
  'loungeDesignSofa',
  'loungeDesignSofaCorner',
  'loungeDesignChair',
  'kitchenCoffeeMachine',
  'kitchenCabinet',
  'kitchenBar',
  'stoolBar',
  'kitchenFridgeSmall',
  'pottedPlant',
  'plantSmall1',
  'plantSmall2',
  'plantSmall3',
  'lampRoundFloor',
  'lampSquareTable',
  'coatRackStanding',
  'trashcan',
  'rugRounded',
  'sideTableDrawers',
  'ext/tree_detailed',
  'ext/tree_oak',
  'ext/tree_plateau',
  'ext/tree_tall',
  'ext/tree_default_fall',
  'ext/plant_bushDetailed',
  'ext/plant_bushLarge',
  'ext/grass_large',
  'ext/rock_smallA',
  'ext/flower_yellowA',
  'ext-cars/sedan',
  'ext-cars/suv-luxury',
  'ext-cars/hatchback-sports',
  'ext-city/low-detail-building-a',
  'ext-city/low-detail-building-b',
  'ext-city/low-detail-building-d',
];

export function preloadKenneyModels(): void {
  for (const m of PRELOAD_MODELS) {
    useGLTF.preload(`/assets/models/${m}.glb`);
  }
}
