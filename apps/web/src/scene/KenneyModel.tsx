import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type MaterialPaletteOverrides = Partial<
  Record<
    | 'wood'
    | 'woodDark'
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
 * Kenney Furniture Kit 2.0 (CC0) GLB models.
 */
const BASE_INTEGRA_PALETTE: MaterialPaletteOverrides = {
  wood: { color: '#DCC7A6', roughness: 0.72, metalness: 0.02 },
  woodDark: { color: '#9E7B5A', roughness: 0.74, metalness: 0.04 },
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
  name: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  palette?: MaterialPaletteOverrides;
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: (e: { stopPropagation: () => void }) => void;
  onPointerOver?: (e: { stopPropagation: () => void }) => void;
  onPointerOut?: () => void;
}

/**
 * Renders any curated Kenney Furniture Kit 2.0 (CC0) GLB asset from
 * `/assets/models/<name>.glb`, automatically centering X/Z and grounding
 * min.y = 0 so every chair, desk, plant, and prop sits flush on the floor or surface.
 */
export function KenneyModel({
  name,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 2,
  palette,
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

    // Harmonize materials into Integra DAT Alierta palette
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = castShadow;
        obj.receiveShadow = receiveShadow;
        const origMat = obj.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const applyStyle = (m: THREE.Material): THREE.Material => {
          const matName = m.name as keyof MaterialPaletteOverrides;
          const override = palette?.[matName] ?? BASE_INTEGRA_PALETTE[matName];
          const next = new THREE.MeshStandardMaterial({
            name: m.name,
            color: override?.color ?? (m instanceof THREE.MeshStandardMaterial ? m.color : '#D8E0E6'),
            roughness: override?.roughness ?? 0.65,
            metalness: override?.metalness ?? 0.08,
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

    // Compute exact bounding box and center X/Z with bottom resting flush at Y = 0
    const box = new THREE.Box3().setFromObject(cloned);
    if (!box.isEmpty()) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      cloned.position.set(-center.x, -box.min.y, -center.z);
    }

    root.add(cloned);
    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, castShadow, receiveShadow, paletteKey]);

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
];

export function preloadKenneyModels(): void {
  for (const m of PRELOAD_MODELS) {
    useGLTF.preload(`/assets/models/${m}.glb`);
  }
}
