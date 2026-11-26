import * as THREE from 'three';
import { eventLabel } from '../state/officeCopy';
import {
  type AgentVisualProfile,
  STATE_META,
} from '../state/officeLayout';
import type {
  AgentRuntimeState,
  OfficeSceneState,
  PlanTaskRuntime,
} from '../state/officeReducer';

/**
 * Loads an official SVG from `/assets/branding/` into an HTMLImageElement
 * so we can render crisp real Integra vectors onto 3D CanvasTextures.
 */
export function loadBrandSvgImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function drawReceptionLogoWall(
  ctx: CanvasRenderingContext2D,
  logoWhite: HTMLImageElement | null
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#0B2A5B';
  ctx.fillRect(0, 0, w, h);

  // Architectural cyan corner frame (exact brand-tokens.json headlineFrame rule)
  ctx.fillStyle = '#00B0F0';
  ctx.fillRect(26, 26, 220, 7);
  ctx.fillRect(26, 26, 7, 108);
  ctx.fillRect(w - 246, h - 33, 220, 7);

  if (logoWhite) {
    const targetW = 450;
    const aspect = logoWhite.naturalHeight / Math.max(1, logoWhite.naturalWidth);
    const targetH = targetW * aspect;
    ctx.drawImage(logoWhite, (w - targetW) / 2, 68, targetW, targetH);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 68px Poppins, Segoe UI, sans-serif';
    ctx.fillText('integra', 180, 160);
  }

  ctx.fillStyle = '#43C6F0';
  ctx.font = '700 22px Poppins, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAT Alierta · Zaragoza', w / 2, 239);
  ctx.textAlign = 'left';
}

export function drawHeritagePlaque(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = '#E9DFC8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0B2A5B';
  ctx.font = '700 58px Poppins, Segoe UI, sans-serif';
  ctx.fillText('Calatayud, 1986', 26, 75);
  ctx.font = '500 38px Poppins, Segoe UI, sans-serif';
  ctx.fillText('Izquierdo Informática', 26, 135);
}

export function drawDagWhiteboard(
  ctx: CanvasRenderingContext2D,
  tasks: PlanTaskRuntime[],
  includesTraining: boolean,
  projectStatus: string
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = '#FCFDFE';
  ctx.fillRect(0, 0, w, h);

  // Header bar
  ctx.fillStyle = '#0B2A5B';
  ctx.fillRect(0, 0, w, 58);
  ctx.fillStyle = '#00B0F0';
  ctx.fillRect(0, 58, w, 5);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px Poppins, Segoe UI, sans-serif';
  ctx.fillText('PLAN DE TRABAJO · NORTIA INDUSTRIAL', 22, 37);

  ctx.fillStyle = '#43C6F0';
  ctx.font = '600 14px IBM Plex Mono, monospace';
  const scopeTag = includesTraining ? 'CON FORMACIÓN (42k–58k €)' : 'SIN FORMACIÓN (36k–50k €)';
  ctx.fillText(scopeTag, w - 265, 36);

  const nodeCoords: Record<string, [number, number, string]> = {
    t1: [36, 94, 'T1 · CRM'],
    t2: [36, 206, 'T2 · Consultoría'],
    t3: [218, 206, 'T3 · Data & AI SVG'],
    t4: [404, 148, 'T4 · Oferta'],
    t5: [590, 94, 'T5 · Proyectos PDF'],
    t6: [590, 206, 'T6 · Factura PDF'],
    t7: [404, 304, 'T7 · Presentación PPTX (6 slides)'],
  };

  const statusColor = (st: string) => {
    if (st === 'completed') return '#36966C';
    if (st === 'running') return '#00B0F0';
    if (st === 'waiting') return '#D5A13D';
    if (st === 'failed') return '#C94F50';
    return '#9AA9B8';
  };

  // Draw DAG arrows
  ctx.strokeStyle = '#9DB0C2';
  ctx.lineWidth = 3;
  const drawEdge = (fromId: string, toId: string) => {
    const a = nodeCoords[fromId];
    const b = nodeCoords[toId];
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a[0] + 148, a[1] + 34);
    ctx.lineTo(b[0], b[1] + 34);
    ctx.stroke();
  };
  drawEdge('t1', 't4');
  drawEdge('t2', 't3');
  drawEdge('t3', 't4');
  drawEdge('t4', 't5');
  drawEdge('t4', 't6');

  // Vertical connection down to T7
  ctx.beginPath();
  ctx.moveTo(664, 276);
  ctx.lineTo(664, 336);
  ctx.lineTo(724, 336);
  ctx.stroke();

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  for (const [id, [x, y, label]] of Object.entries(nodeCoords)) {
    const t = taskMap.get(id);
    const st = t?.state ?? 'queued';
    const col = statusColor(st);
    const cardW = id === 't7' ? 320 : 154;
    const cardH = 68;

    ctx.fillStyle = st === 'running' ? '#E6F7FE' : st === 'waiting' ? '#FDF5E4' : st === 'completed' ? '#EAF7F1' : '#F3F6F9';
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = col;
    ctx.lineWidth = st === 'running' || st === 'waiting' ? 4 : 2.5;
    ctx.strokeRect(x, y, cardW, cardH);

    // Top color bar
    ctx.fillStyle = col;
    ctx.fillRect(x, y, cardW, 10);

    ctx.fillStyle = '#0B1B2B';
    ctx.font = '700 14px Poppins, Segoe UI, sans-serif';
    ctx.fillText(label, x + 10, y + 34);

    ctx.fillStyle = col;
    ctx.font = '700 12px IBM Plex Mono, monospace';
    ctx.fillText(st.toUpperCase(), x + 10, y + 55);
  }

  // Footer
  ctx.fillStyle = '#5B6B7C';
  ctx.font = '600 13px IBM Plex Mono, monospace';
  const doneCount = tasks.filter((t) => t.state === 'completed').length;
  ctx.fillText(
    `ESTADO: ${projectStatus.toUpperCase()}  |  COMPLETADAS: ${doneCount}/${tasks.length}  |  AZURE OPENAI: gpt-6-luna`,
    22,
    h - 18
  );
}

export function drawFabricArchitectureBoard(
  ctx: CanvasRenderingContext2D,
  archState: string,
  phase: number
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = '#0B233D';
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid
  ctx.strokeStyle = 'rgba(67, 198, 240, 0.1)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 32) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  ctx.fillStyle = '#00B0F0';
  ctx.fillRect(0, 0, w, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px Poppins, Segoe UI, sans-serif';
  ctx.fillText('ARQUITECTURA · MICROSOFT FABRIC + AI', 18, 29);

  const nodes: Array<[number, number, number, number, string, string, string]> = [
    [24, 80, 125, 62, 'ERP / SAP', 'Nortia Planta', '#5FB3BC'],
    [24, 174, 125, 62, 'CRM / IoT', 'Señales Planta', '#5FB3BC'],
    [194, 126, 150, 74, 'OneLake', 'Microsoft Fabric', '#00B0F0'],
    [388, 78, 150, 64, 'Lakehouse', 'Medallion SQL', '#43C6F0'],
    [388, 176, 150, 64, 'gpt-6-luna', 'Azure OpenAI', '#7030A0'],
    [578, 126, 146, 74, 'Power BI', 'Comité Directivo', '#36966C'],
  ];

  // Connectors
  ctx.strokeStyle = '#43C6F0';
  ctx.lineWidth = 2.5;
  const connect = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  connect(149, 111, 194, 155);
  connect(149, 205, 194, 170);
  connect(344, 155, 388, 110);
  connect(344, 170, 388, 208);
  connect(538, 110, 578, 155);
  connect(538, 208, 578, 170);

  nodes.forEach(([x, y, bw, bh, title, sub, col], idx) => {
    const active = archState === 'working' && phase % nodes.length === idx;
    ctx.fillStyle = active ? 'rgba(0, 176, 240, 0.35)' : 'rgba(17, 82, 147, 0.45)';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = active ? '#FFFFFF' : col;
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeRect(x, y, bw, bh);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 15px Poppins, Segoe UI, sans-serif';
    ctx.fillText(title, x + 12, y + 28);
    ctx.fillStyle = '#BFE7F8';
    ctx.font = '500 11px IBM Plex Mono, monospace';
    ctx.fillText(sub, x + 12, y + 48);
  });

  ctx.fillStyle = archState === 'completed' ? '#36966C' : '#00B0F0';
  ctx.fillRect(24, h - 46, w - 48, 30);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 13px IBM Plex Mono, monospace';
  ctx.fillText(
    archState === 'completed'
      ? '✓ architecture-nortia.svg VALIDADO · 6 NODOS · SIN CICLOS'
      : 'DISEÑANDO ARQUITECTURA DETERMINISTA (MS-FABRIC-01 · MS-POWERBI-01)',
    36,
    h - 26
  );
}

export function drawPresentationWallTv(
  ctx: CanvasRenderingContext2D,
  slideIdx: number,
  designerState: string,
  includesTraining: boolean,
  logoWhite: HTMLImageElement | null,
  logoColor: HTMLImageElement | null
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const slide = slideIdx % 4;

  if (slide === 0) {
    // Official Integra navy cover slide (matches brand-preview.png)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#09345D');
    grad.addColorStop(0.55, '#0B2A5B');
    grad.addColorStop(1, '#1C1C4A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    if (logoWhite) {
      const lw = 150;
      const lh = lw * (logoWhite.naturalHeight / Math.max(1, logoWhite.naturalWidth));
      ctx.drawImage(logoWhite, 28, 24, lw, lh);
    }
    ctx.fillStyle = '#43C6F0';
    ctx.font = '700 13px Poppins, Segoe UI, sans-serif';
    ctx.fillText('COMITÉ EJECUTIVO · NORTIA INDUSTRIAL', 28, 98);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px Poppins, Segoe UI, sans-serif';
    ctx.fillText('PLATAFORMA', 28, 144);
    ctx.fillText('DATA & AI', 28, 184);
    ctx.fillStyle = '#C9E7F7';
    ctx.font = '400 14px Poppins, Segoe UI, sans-serif';
    ctx.fillText('El trabajo se delega. El criterio se queda.', 28, 224);
  } else {
    // Official Integra white interior slide with cyan top-left L-frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00B0F0';
    ctx.fillRect(24, 24, 240, 5);
    ctx.fillRect(24, 24, 5, 110);

    ctx.fillStyle = '#0B2A5B';
    ctx.font = '800 24px Poppins, Segoe UI, sans-serif';
    if (slide === 1) {
      ctx.fillText('Propuesta económica', 42, 66);
      ctx.fillStyle = '#00B0F0';
      ctx.fillText(includesTraining ? '42.000 € – 58.000 €' : '36.000 € – 50.000 €', 42, 102);
      ctx.fillStyle = '#5B6B7C';
      ctx.font = '500 14px Poppins, Segoe UI, sans-serif';
      ctx.fillText(
        includesTraining
          ? '428 h · 4 fases + capacitación de usuarios'
          : '380 h · 3 fases técnicas sin formación',
        42,
        134
      );
    } else if (slide === 2) {
      ctx.fillText('Arquitectura Microsoft', 42, 66);
      ctx.fillStyle = '#115293';
      ctx.fillRect(42, 92, 120, 54);
      ctx.fillStyle = '#00B0F0';
      ctx.fillRect(178, 92, 120, 54);
      ctx.fillStyle = '#7030A0';
      ctx.fillRect(314, 92, 120, 54);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 14px Poppins, Segoe UI, sans-serif';
      ctx.fillText('OneLake', 66, 124);
      ctx.fillText('Fabric AI', 202, 124);
      ctx.fillText('Power BI', 338, 124);
    } else {
      ctx.fillText('Gobierno y aprobación', 42, 66);
      ctx.fillStyle = '#36966C';
      ctx.fillRect(42, 94, 390, 44);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 14px Poppins, Segoe UI, sans-serif';
      ctx.fillText('✓ Oferta validada · Plan PDF + Factura borrador', 54, 121);
    }

    if (logoColor) {
      const lw = 95;
      const lh = lw * (logoColor.naturalHeight / Math.max(1, logoColor.naturalWidth));
      ctx.drawImage(logoColor, 24, h - lh - 16, lw, lh);
    }
  }

  // Slide counter pill
  ctx.fillStyle = designerState === 'completed' ? '#36966C' : '#0B2A5B';
  ctx.fillRect(w - 122, h - 34, 102, 22);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 11px IBM Plex Mono, monospace';
  ctx.fillText(`SLIDE 0${slide + 1}/06`, w - 110, h - 19);
}

export function drawBoardroomScreen(
  ctx: CanvasRenderingContext2D,
  scene: OfficeSceneState,
  logoWhite: HTMLImageElement | null
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#0B2A5B';
  ctx.fillRect(0, 0, w, h);
  const offerPending = scene.checkpoint?.kind === 'offer_approval';
  ctx.fillStyle = offerPending ? '#E7B456' : '#43C6F0';
  ctx.fillRect(0, 0, w, 7);

  if (logoWhite) {
    const lw = 110;
    const lh = lw * (logoWhite.naturalHeight / Math.max(1, logoWhite.naturalWidth));
    ctx.drawImage(logoWhite, w - lw - 30, 30, lw, lh);
  }

  ctx.fillStyle = '#ACCFE8';
  ctx.font = '600 26px Poppins, Segoe UI, sans-serif';
  ctx.fillText('Sala Alierta', 30, 56);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 54px Poppins, Segoe UI, sans-serif';
  ctx.fillText('Nortia Industrial', 30, 150, w - 60);
  ctx.fillStyle = offerPending ? '#FFD995' : '#E3EFF7';
  ctx.font = '500 30px Poppins, Segoe UI, sans-serif';
  ctx.fillText(offerPending ? 'Oferta pendiente de aprobación' : eventLabel(scene.lastEvent, scene.includesTraining), 30, 209, w - 60);

  ctx.fillStyle = '#ACCFE8';
  ctx.font = '500 20px Poppins, Segoe UI, sans-serif';
  ctx.fillText(offerPending ? scene.checkpoint?.priceBand ?? '' : 'Demostración con datos ficticios', 30, h - 28, w - 60);
}

export function drawDeskMonitor(
  ctx: CanvasRenderingContext2D,
  profile: AgentVisualProfile,
  agent: AgentRuntimeState,
  isRight: boolean,
  phase: number
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const meta = STATE_META[agent.state];

  const bg =
    agent.state === 'idle'
      ? '#1A2A38'
      : agent.state === 'waiting'
        ? '#33250F'
        : agent.state === 'error'
          ? '#3E1518'
          : agent.state === 'completed'
            ? '#0E3024'
            : '#09223E';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = meta.screenAccent;
  ctx.fillRect(0, 0, w, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 10px Poppins, sans-serif';
  ctx.fillText(
    isRight ? profile.screenProfile.rightTitle : profile.screenProfile.leftTitle,
    8,
    16
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 11px IBM Plex Mono, monospace';
  ctx.fillText(meta.label.toUpperCase(), 10, 44);

  if (agent.state === 'waiting') {
    ctx.fillStyle = 'rgba(213, 161, 61, 0.22)';
    ctx.fillRect(10, 56, w - 20, 88);
    ctx.strokeStyle = '#D5A13D';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 56, w - 20, 88);
    ctx.fillStyle = '#FCE6B4';
    ctx.font = '700 12px IBM Plex Mono, monospace';
    ctx.fillText('CHECKPOINT PAUSADO', 20, 84);
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillText('0 TOKENS EN ESPERA', 20, 108);
    ctx.fillText('APROBACION HUMANA', 20, 128);
    return;
  }

  if (agent.state === 'error') {
    ctx.fillStyle = 'rgba(201, 79, 80, 0.25)';
    ctx.fillRect(10, 56, w - 20, 88);
    ctx.strokeStyle = '#C94F50';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 56, w - 20, 88);
    ctx.fillStyle = '#FFD7D7';
    ctx.font = '700 12px IBM Plex Mono, monospace';
    ctx.fillText('VALIDACION FALLIDA', 20, 92);
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillText('SIN ENVIO EXTERNO', 20, 118);
    return;
  }

  // Unique per-department telemetry visual
  const mode = profile.screenProfile.mode;
  if (mode === 'crm' || mode === 'billing') {
    // Bar chart telemetry
    const bars = [0.45, 0.82, 0.62, 0.94, 0.55, 0.76];
    bars.forEach((b, i) => {
      const anim = agent.state === 'working' ? 0.14 * Math.sin(phase * 0.8 + i) : 0;
      const bh = Math.max(12, (b + anim) * 76);
      ctx.fillStyle = i === 3 ? '#00B0F0' : i === 1 ? '#70C4BE' : 'rgba(255,255,255,0.45)';
      ctx.fillRect(18 + i * 36, 144 - bh, 22, bh);
    });
  } else if (mode === 'architect' || mode === 'director') {
    // Connected node map
    const pts: Array<[number, number]> = [
      [34, 80],
      [112, 68],
      [194, 84],
      [76, 124],
      [164, 124],
    ];
    ctx.strokeStyle = 'rgba(0,176,240,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, 80);
    ctx.lineTo(112, 68);
    ctx.lineTo(194, 84);
    ctx.moveTo(112, 68);
    ctx.lineTo(76, 124);
    ctx.lineTo(164, 124);
    ctx.lineTo(194, 84);
    ctx.stroke();
    pts.forEach(([x, y], i) => {
      const hot = agent.state === 'working' && phase % pts.length === i;
      ctx.fillStyle = hot ? '#FFFFFF' : '#00B0F0';
      ctx.beginPath();
      ctx.arc(x, y, hot ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (mode === 'designer') {
    // Brand palette swatches + slide preview
    const cols = ['#0B2A5B', '#00B0F0', '#7030A0', '#D70A8A', '#70C4BE'];
    cols.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(16 + i * 44, 60, 34, 26);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(16, 98, 224, 46);
    ctx.fillStyle = '#43C6F0';
    ctx.fillRect(26, 108, 92, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(26, 124, 148, 6);
  } else if (mode === 'delivery') {
    // Gantt bars
    const gantt: Array<[number, number, string]> = [
      [16, 68, '#00B0F0'],
      [54, 84, '#43C6F0'],
      [98, 72, '#36966C'],
      [136, 96, '#7030A0'],
    ];
    gantt.forEach(([gx, gw, col], i) => {
      ctx.fillStyle = col;
      ctx.fillRect(gx, 62 + i * 21, gw, 12);
    });
  } else {
    // Document / code / requirements lines
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(12, 56, w - 24, 90);
    for (let i = 0; i < 5; i += 1) {
      const lw =
        agent.state === 'working'
          ? 74 + ((phase * 29 + i * 41) % 130)
          : 158 - i * 16;
      ctx.fillStyle = i === 0 ? meta.screenAccent : 'rgba(255,255,255,0.72)';
      ctx.fillRect(22, 68 + i * 15, lw, 7);
    }
  }

  if (agent.state === 'completed') {
    ctx.fillStyle = '#36966C';
    ctx.fillRect(w - 82, h - 28, 72, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px sans-serif';
    ctx.fillText('✓ VALIDADO', w - 77, h - 15);
  }
}

export function drawRetroPcScreen(ctx: CanvasRenderingContext2D, phase: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#091B0E';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#53FF8C';
  ctx.font = '700 16px IBM Plex Mono, monospace';
  ctx.fillText('IZQUIERDO INFORMÁTICA', 16, 36);
  ctx.font = '500 12px IBM Plex Mono, monospace';
  ctx.fillText('CALATAYUD, 1986', 16, 62);
  const cursor = phase % 2 === 0 ? '█' : '';
  ctx.fillText(`A:\\> ${cursor}`, 16, 122);
}

export function drawAcademyScreen(
  ctx: CanvasRenderingContext2D,
  includesTraining: boolean,
  logoWhite: HTMLImageElement | null
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = includesTraining ? '#0A2C4E' : '#1E2C38';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = includesTraining ? '#36966C' : '#5B6B7C';
  ctx.fillRect(0, 0, w, 48);

  if (logoWhite) {
    const lw = 104;
    const lh = lw * (logoWhite.naturalHeight / Math.max(1, logoWhite.naturalWidth));
    ctx.drawImage(logoWhite, 16, 12, lw, lh);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 17px Poppins, Segoe UI, sans-serif';
  ctx.fillText('ACADEMIA INTEGRA · FORMACIÓN', 138, 30);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px Poppins, Segoe UI, sans-serif';
  ctx.fillText(
    includesTraining ? 'Módulo Capacitación Nortia ACTIVO' : 'Módulo Formación: Opcional',
    22,
    92
  );

  ctx.fillStyle = includesTraining ? '#43C6F0' : '#9AA9B8';
  ctx.font = '600 14px IBM Plex Mono, monospace';
  ctx.fillText(
    includesTraining
      ? '48 h · Power BI + Microsoft Fabric + Adopción IA'
      : 'Excluido en el alcance actual · activable en #3',
    22,
    124
  );

  // Module schedule blocks
  const blocks: Array<[number, string, string]> = [
    [22, 'S1 · Lakehouse', includesTraining ? '#00B0F0' : '#465664'],
    [194, 'S2 · Power BI', includesTraining ? '#36966C' : '#465664'],
    [366, 'S3 · Copilot IA', includesTraining ? '#7030A0' : '#465664'],
  ];
  for (const [bx, label, col] of blocks) {
    ctx.fillStyle = col;
    ctx.fillRect(bx, 152, 156, 74);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 14px Poppins, Segoe UI, sans-serif';
    ctx.fillText(label, bx + 14, 196);
  }
}

export function drawExteriorMonolith(
  ctx: CanvasRenderingContext2D,
  logoWhite: HTMLImageElement | null
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#0B2A5B';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#00B0F0';
  ctx.fillRect(0, 0, 14, h);

  if (logoWhite) {
    const lw = 240;
    const lh = lw * (logoWhite.naturalHeight / Math.max(1, logoWhite.naturalWidth));
    ctx.drawImage(logoWhite, 36, 46, lw, lh);
  }

  ctx.fillStyle = '#43C6F0';
  ctx.font = '700 20px Poppins, Segoe UI, sans-serif';
  ctx.fillText('DAT ALIERTA', 36, 152);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 16px Poppins, Segoe UI, sans-serif';
  ctx.fillText('SEDE CORPORATIVA · 2029', 36, 182);
  ctx.fillStyle = '#9BC2E0';
  ctx.font = '500 13px IBM Plex Mono, monospace';
  ctx.fillText('CAMPUS RÍO EBRO · ZARAGOZA', 36, 224);
  ctx.fillText('8.000 m² · EMPRESA AGÉNTICA', 36, 248);
}

export function createCanvasTexture(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, ctx, texture };
}
