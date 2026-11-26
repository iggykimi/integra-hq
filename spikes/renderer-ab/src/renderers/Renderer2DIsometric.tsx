import { useEffect, useRef } from 'react';
import integraLogoColor from '@brand/logo-integra-color.svg';
import {
  type DeskSceneState,
  type RendererMetrics,
  STATE_META,
} from '../state/deskReducer';

interface Renderer2DProps {
  scene: DeskSceneState;
  pixelated: boolean;
  onSelect: () => void;
  onMetrics: (metrics: RendererMetrics) => void;
}

const LOGICAL_W = 640;
const LOGICAL_H = 420;
const ORIGIN_X = 320;
const ORIGIN_Y = 258;
const TILE_W = 48;
const TILE_H = 24;

function iso(x: number, y: number, z = 0): [number, number] {
  return [
    ORIGIN_X + (x - y) * (TILE_W / 2),
    ORIGIN_Y + (x + y) * (TILE_H / 2) - z * 24,
  ];
}

function drawPoly(
  ctx: CanvasRenderingContext2D,
  pts: Array<[number, number]>,
  fill: string,
  stroke?: string,
  lineWidth = 1
) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
  strokeColor?: string
) {
  const p000 = iso(x, y, z);
  const p100 = iso(x + w, y, z);
  const p110 = iso(x + w, y + d, z);
  const p010 = iso(x, y + d, z);

  const p001 = iso(x, y, z + h);
  const p101 = iso(x + w, y, z + h);
  const p111 = iso(x + w, y + d, z + h);
  const p011 = iso(x, y + d, z + h);

  // Left visible face (y + d)
  drawPoly(ctx, [p010, p110, p111, p011], leftColor, strokeColor, 0.8);
  // Right visible face (x + w)
  drawPoly(ctx, [p100, p110, p111, p101], rightColor, strokeColor, 0.8);
  // Top face (z + h)
  drawPoly(ctx, [p001, p101, p111, p011], topColor, strokeColor, 0.8);

  return { p000, p100, p110, p010, p001, p101, p111, p011 };
}

export function Renderer2DIsometric({
  scene,
  pixelated,
  onSelect,
  onMetrics,
}: Renderer2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<DeskSceneState>(scene);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const onMetricsRef = useRef(onMetrics);
  sceneRef.current = scene;
  onMetricsRef.current = onMetrics;

  useEffect(() => {
    const img = new Image();
    img.src = integraLogoColor;
    img.onload = () => {
      logoImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mountStart = performance.now();
    let firstRenderMs: number | null = null;
    let frameCount = 0;
    let frameSumMs = 0;
    let windowStart = performance.now();
    let lastTs = performance.now();
    let rafId = 0;

    const drawFrame = (now: number) => {
      const dt = now - lastTs;
      lastTs = now;
      frameCount += 1;
      frameSumMs += dt;

      const s = sceneRef.current;
      const meta = STATE_META[s.state];
      const t = s.reducedMotion ? 0 : now / 1000;

      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Soft warm daylight background
      ctx.fillStyle = '#E8EEEA';
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Floor platform (5x5 dimetric tiles, warm oak #D7C2A3)
      const floorSize = 4.6;
      const fx0 = -2.3;
      const fy0 = -2.3;

      // Ground drop shadow
      drawPoly(
        ctx,
        [
          iso(fx0 - 0.1, fy0 + 0.15, -0.35),
          iso(fx0 + floorSize + 0.1, fy0 + 0.15, -0.35),
          iso(fx0 + floorSize + 0.1, fy0 + floorSize + 0.25, -0.35),
          iso(fx0 - 0.1, fy0 + floorSize + 0.25, -0.35),
        ],
        'rgba(11, 27, 43, 0.12)'
      );

      // Floor base slab
      drawIsoBox(
        ctx,
        fx0,
        fy0,
        -0.25,
        floorSize,
        floorSize,
        0.25,
        '#D7C2A3',
        '#B89F7D',
        '#9E8768',
        '#9A876B'
      );

      // Oak plank grid lines
      ctx.strokeStyle = 'rgba(130, 102, 66, 0.26)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i += 1) {
        const g = fx0 + (floorSize / 5) * i;
        const a = iso(g, fy0, 0);
        const b = iso(g, fy0 + floorSize, 0);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();

        const c = iso(fx0, g, 0);
        const d = iso(fx0 + floorSize, g, 0);
        ctx.beginPath();
        ctx.moveTo(c[0], c[1]);
        ctx.lineTo(d[0], d[1]);
        ctx.stroke();
      }

      // Left architectural wall (plaster white/warm gray)
      const wallH = 3.1;
      drawPoly(
        ctx,
        [
          iso(fx0, fy0, 0),
          iso(fx0, fy0 + floorSize, 0),
          iso(fx0, fy0 + floorSize, wallH),
          iso(fx0, fy0, wallH),
        ],
        '#F2F5F4',
        '#B7C4C8',
        1
      );

      // Right panoramic glass wall (#A9C3CC) + DAT Alierta terracotta louvers (#B78770)
      drawPoly(
        ctx,
        [
          iso(fx0, fy0, 0),
          iso(fx0 + floorSize, fy0, 0),
          iso(fx0 + floorSize, fy0, wallH),
          iso(fx0, fy0, wallH),
        ],
        '#C3D9E0',
        '#8DA8B2',
        1
      );

      // Sunlight reflection strips on glass
      drawPoly(
        ctx,
        [
          iso(fx0 + 0.7, fy0, 0.25),
          iso(fx0 + 1.5, fy0, 0.25),
          iso(fx0 + 1.9, fy0, wallH - 0.15),
          iso(fx0 + 1.1, fy0, wallH - 0.15),
        ],
        'rgba(255, 255, 255, 0.28)'
      );

      // Terracotta louvers along right window
      for (let i = 0; i < 8; i += 1) {
        const lx = fx0 + 0.35 + i * 0.56;
        const btm = iso(lx, fy0, 0.08);
        const top = iso(lx, fy0, wallH - 0.05);
        ctx.strokeStyle = i % 2 === 0 ? '#B78770' : '#E7ECEA';
        ctx.lineWidth = i % 2 === 0 ? 4 : 2.5;
        ctx.beginPath();
        ctx.moveTo(btm[0], btm[1]);
        ctx.lineTo(top[0], top[1]);
        ctx.stroke();
      }

      // Subtle official Integra logo plaque on left wall (no redrawing of logo!)
      const plaqueA = iso(fx0 + 0.02, fy0 + 0.7, 2.35);
      const plaqueB = iso(fx0 + 0.02, fy0 + 2.5, 2.35);
      const plaqueC = iso(fx0 + 0.02, fy0 + 2.5, 1.55);
      const plaqueD = iso(fx0 + 0.02, fy0 + 0.7, 1.55);
      drawPoly(ctx, [plaqueA, plaqueB, plaqueC, plaqueD], '#FFFFFF', '#C6D4DD', 1);
      if (logoImgRef.current) {
        ctx.save();
        ctx.translate(plaqueA[0] + 2, plaqueA[1] + 5);
        // Project cleanly onto left-wall 2:1 plane
        ctx.transform(0.86, 0.43, 0, 1, 0, 0);
        ctx.drawImage(logoImgRef.current, 0, 0, 46, 15);
        ctx.restore();
      }

      // Daylight floor highlight from window
      drawPoly(
        ctx,
        [
          iso(fx0 + 0.4, fy0 + 0.1, 0.01),
          iso(fx0 + 3.6, fy0 + 0.1, 0.01),
          iso(fx0 + 3.0, fy0 + 1.8, 0.01),
          iso(fx0 + 0.2, fy0 + 1.4, 0.01),
        ],
        'rgba(255, 251, 236, 0.24)'
      );

      // Potted plant in terracotta pot (#B78770 + #748E69)
      drawIsoBox(ctx, -1.9, -1.7, 0, 0.65, 0.65, 0.62, '#C7967E', '#B78770', '#966A55', '#7F5947');
      const plantBase = iso(-1.58, -1.38, 0.75);
      const leafClusters: Array<[number, number, number, string]> = [
        [-10, -8, 16, '#5D7854'],
        [10, -6, 15, '#68845E'],
        [0, -18, 17, '#748E69'],
        [-6, -24, 11, '#8CA77F'],
        [7, -21, 10, '#8CA77F'],
      ];
      for (const [dx, dy, r, col] of leafClusters) {
        ctx.beginPath();
        ctx.arc(plantBase[0] + dx, plantBase[1] + dy, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }

      // Desk floor shadow
      drawPoly(
        ctx,
        [iso(-1.05, -0.75, 0.01), iso(1.3, -0.75, 0.01), iso(1.3, 0.5, 0.01), iso(-1.05, 0.5, 0.01)],
        'rgba(11, 27, 43, 0.12)'
      );

      // Desk legs (metallic slate)
      const legCoords: Array<[number, number]> = [
        [-0.95, -0.68],
        [1.1, -0.68],
        [-0.95, 0.3],
        [1.1, 0.3],
      ];
      for (const [lx, ly] of legCoords) {
        drawIsoBox(ctx, lx, ly, 0, 0.1, 0.1, 0.92, '#7B8F97', '#5E727B', '#4B5E66');
      }

      // White architectural desk surface
      drawIsoBox(ctx, -1.0, -0.75, 0.92, 2.25, 1.18, 0.11, '#FFFFFF', '#DCE5E8', '#C3D0D6', '#9BB0B8');

      // Desk mat + keyboard
      drawPoly(
        ctx,
        [iso(-0.42, -0.1, 1.04), iso(0.68, -0.1, 1.04), iso(0.68, 0.32, 1.04), iso(-0.42, 0.32, 1.04)],
        '#2A3C49'
      );
      drawIsoBox(ctx, -0.25, 0.0, 1.04, 0.72, 0.22, 0.03, '#4B606E', '#334552', '#263440');

      // Printed artifact document on desk when waiting or completed
      if (s.artifacts.length > 0 || s.state === 'completed' || s.state === 'waiting') {
        drawIsoBox(ctx, 0.72, -0.05, 1.04, 0.38, 0.34, 0.04, '#FFFFFF', '#DCE6EC', '#C8D6DE', '#8EA4B2');
        const docLineA = iso(0.79, 0.03, 1.09);
        const docLineB = iso(1.02, 0.03, 1.09);
        ctx.strokeStyle = s.state === 'waiting' ? '#D5A13D' : '#00B0F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(docLineA[0], docLineA[1]);
        ctx.lineTo(docLineB[0], docLineB[1]);
        ctx.stroke();
      }

      // Dual monitors (black bezel + live state screen content)
      const drawMonitor = (mx: number, my: number, isRight: boolean) => {
        // Stand
        drawIsoBox(ctx, mx + 0.34, my + 0.02, 1.03, 0.12, 0.12, 0.26, '#394B57', '#273640', '#1C2830');
        // Screen chassis
        const box = drawIsoBox(
          ctx,
          mx,
          my,
          1.26,
          0.84,
          0.09,
          0.62,
          '#2D3F4B',
          '#1E2C36',
          '#152129',
          '#0F1820'
        );

        // Front luminous screen face (y + d face: p010, p110, p111, p011)
        const screenFill =
          s.state === 'idle'
            ? '#334857'
            : s.state === 'working'
              ? '#0D2F4F'
              : s.state === 'waiting'
                ? '#3C2E14'
                : s.state === 'completed'
                  ? '#153A2C'
                  : '#42191B';

        const inset = (a: [number, number], b: [number, number], f: number): [number, number] => [
          a[0] + (b[0] - a[0]) * f,
          a[1] + (b[1] - a[1]) * f,
        ];
        const s0 = inset(box.p010, box.p111, 0.1);
        const s1 = inset(box.p110, box.p011, 0.1);
        const s2 = inset(box.p111, box.p010, 0.1);
        const s3 = inset(box.p011, box.p110, 0.1);
        drawPoly(ctx, [s0, s1, s2, s3], screenFill);

        // Animated telemetry/document lines inside screen
        const lineCount = isRight ? 4 : 3;
        for (let i = 0; i < lineCount; i += 1) {
          const v = 0.25 + i * 0.2;
          const leftPt = inset(s3, s0, v);
          const rightBase = inset(s2, s1, v);
          const progress =
            s.state === 'working'
              ? 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4.5 + i * 1.4 + (isRight ? 1 : 0)))
              : 0.78;
          const rightPt = inset(leftPt, rightBase, progress);
          ctx.strokeStyle = i === 0 ? meta.screenAccent : 'rgba(255,255,255,0.65)';
          ctx.lineWidth = i === 0 ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(leftPt[0], leftPt[1]);
          ctx.lineTo(rightPt[0], rightPt[1]);
          ctx.stroke();
        }
      };

      drawMonitor(-0.85, -0.64, false);
      drawMonitor(0.14, -0.64, true);

      // Ergonomic chair base + seat (behind character)
      const chairY = 0.72;
      drawIsoBox(ctx, -0.1, chairY + 0.1, 0, 0.18, 0.18, 0.45, '#4A5B66', '#36444D', '#29353C');
      drawIsoBox(ctx, -0.34, chairY - 0.1, 0.45, 0.68, 0.62, 0.12, '#34495E', '#253545', '#1C2936');

      // Seated specialist character (business-casual, animated from shared DeskSceneState)
      const breath = s.reducedMotion ? 0 : Math.sin(t * 2.2) * 0.025;
      const typingBob = s.state === 'working' && !s.reducedMotion ? Math.sin(t * 14) * 0.03 : 0;
      const doneNod = s.state === 'completed' && !s.reducedMotion ? Math.sin(t * 3) * 0.02 : 0;

      // Selection highlight ring around agent
      if (s.selected) {
        const ringCenter = iso(0.0, 0.9, 0.02);
        ctx.beginPath();
        ctx.ellipse(ringCenter[0], ringCenter[1], 46, 23, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#00B0F0';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Legs / trousers
      drawIsoBox(ctx, -0.22, 0.48, 0.12, 0.2, 0.36, 0.42, '#2B3A4A', '#1F2C38', '#17222B');
      drawIsoBox(ctx, 0.04, 0.48, 0.12, 0.2, 0.36, 0.42, '#2B3A4A', '#1F2C38', '#17222B');

      // Torso (blazer in role color)
      drawIsoBox(
        ctx,
        -0.28,
        0.58,
        0.56 + breath,
        0.56,
        0.38,
        0.64,
        s.jacketColor,
        s.jacketColor,
        '#0A2245',
        'rgba(255,255,255,0.18)'
      );

      // Arms reaching toward keyboard (animated on working)
      const leftArmZ = 0.88 + breath + typingBob;
      const rightArmZ = 0.88 + breath - typingBob;
      drawIsoBox(ctx, -0.34, 0.24, leftArmZ, 0.16, 0.44, 0.15, s.jacketColor, s.jacketColor, '#0A2245');
      drawIsoBox(ctx, 0.2, 0.24, rightArmZ, 0.16, 0.44, 0.15, s.jacketColor, s.jacketColor, '#0A2245');

      // Head + hair
      const headZ = 1.24 + breath + doneNod;
      drawIsoBox(ctx, -0.19, 0.62, headZ, 0.38, 0.36, 0.42, '#E2B495', '#D2A283', '#BC8D6F');
      drawIsoBox(ctx, -0.2, 0.61, headZ + 0.34, 0.4, 0.38, 0.14, '#3B2F28', '#2D241E', '#231C17');

      // Chair backrest (in front of back of torso in isometric view)
      drawIsoBox(ctx, -0.34, chairY + 0.42, 0.56, 0.68, 0.12, 0.72, '#34495E', '#253545', '#1C2936');

      // Status beacon above character (icon + state color, calm pulse only when working/waiting)
      const beaconPt = iso(0.0, 0.78, 2.28 + (s.reducedMotion ? 0 : Math.sin(t * 2.5) * 0.04));
      if ((s.state === 'working' || s.state === 'waiting') && !s.reducedMotion) {
        const pulseR = 12 + ((t * 14) % 14);
        const alpha = Math.max(0, 1 - ((t * 14) % 14) / 14);
        ctx.beginPath();
        ctx.arc(beaconPt[0], beaconPt[1], pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = meta.color;
        ctx.globalAlpha = alpha * 0.7;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(beaconPt[0], beaconPt[1], 12, 0, Math.PI * 2);
      ctx.fillStyle = meta.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon, beaconPt[0], beaconPt[1] + 0.5);

      // Desk label underneath
      const labelPt = iso(0.15, 2.15, 0);
      ctx.fillStyle = '#0B2A5B';
      ctx.font = '700 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.roleLabel.toUpperCase(), labelPt[0], labelPt[1]);

      if (firstRenderMs === null) {
        firstRenderMs = Math.round((performance.now() - mountStart) * 10) / 10;
        onMetricsRef.current({ fps: 60, frameMs: 16.7, firstRenderMs });
      }

      const elapsed = now - windowStart;
      if (elapsed >= 500) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const frameMs = Math.round((frameSumMs / frameCount) * 10) / 10;
        onMetricsRef.current({ fps, frameMs, firstRenderMs });
        frameCount = 0;
        frameSumMs = 0;
        windowStart = now;
      }

      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className={`viewport-box${pixelated ? ' pixelated' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Candidato A 2D Isométrico — ${scene.roleLabel}, estado ${STATE_META[scene.state].label}. Pulsa Enter para abrir inspector.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <canvas ref={canvasRef} width={LOGICAL_W} height={LOGICAL_H} />
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
      <button
        type="button"
        className="agent-select-btn"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {scene.selected ? 'Inspector activo' : 'Inspeccionar agente'}
      </button>
    </div>
  );
}
