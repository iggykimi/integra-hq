import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowsOutCardinal,
  BuildingOffice,
  ChatCircleDots,
  CheckCircle,
  Coffee,
  Cpu,
  EnvelopeSimple,
  Eye,
  FileText,
  Lightning,
  ListChecks,
  MoonStars,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkle,
  Sun,
  SunHorizon,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import type { AgentId, AgentState } from '@contracts/types';
import type { LandmarkId } from './scene/OfficeArchitecture';
import {
  OfficeCanvas,
  type ViewportMetrics,
} from './scene/OfficeCanvas';
import type { BubbleVisibilityMode } from './scene/SpecialistAgent';
import {
  AGENT_ORDER,
  AGENT_PROFILES,
  type AgentActivity,
  CAMERA_PRESETS,
  type CameraPresetId,
  type LightingMood,
  STATE_META,
} from './state/officeLayout';
import {
  INITIAL_OVERRIDES,
  MOCK_EVENTS,
  reduceOfficeSceneState,
  type SceneOverrides,
} from './state/officeReducer';
import { useOfficeLifeSim } from './state/useOfficeLifeSim';

type SideTabId = 'project' | 'inspector' | 'events' | 'scene';

const SIDE_TABS: Array<{ id: SideTabId; label: string }> = [
  { id: 'project', label: 'Proyecto' },
  { id: 'inspector', label: 'Inspector' },
  { id: 'events', label: 'Eventos' },
  { id: 'scene', label: 'Escena' },
];

export function App() {
  const [eventCursor, setEventCursor] = useState<number>(15);
  const [playing, setPlaying] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>('director');
  const [activeTab, setActiveTab] = useState<SideTabId>('project');
  const [mood, setMood] = useState<LightingMood>('day');
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('overview');
  const [cameraTrigger, setCameraTrigger] = useState<number>(0);
  const [followSelected, setFollowSelected] = useState<boolean>(false);
  const [bubbleMode, setBubbleMode] = useState<BubbleVisibilityMode>('smart');
  const [showPulses, setShowPulses] = useState<boolean>(true);
  const [ambientLife, setAmbientLife] = useState<boolean>(true);
  const [ambientTrigger, setAmbientTrigger] = useState<number>(0);
  const [overrides, setOverrides] = useState<SceneOverrides>(INITIAL_OVERRIDES);
  const [metrics, setMetrics] = useState<ViewportMetrics>({ fps: 60, frameMs: 16.6 });
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const heritageDialogRef = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<Partial<Record<SideTabId, HTMLButtonElement | null>>>({});

  const scene = useMemo(
    () => reduceOfficeSceneState(MOCK_EVENTS, eventCursor, overrides),
    [eventCursor, overrides]
  );

  const ambientMap = useOfficeLifeSim(ambientLife, reducedMotion, mood, scene, ambientTrigger);

  // Playback engine that naturally pauses at human checkpoints (events #3 and #21)
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setEventCursor((prev) => {
        if (prev >= MOCK_EVENTS.length) {
          setPlaying(false);
          return prev;
        }
        const next = prev + 1;
        const ev = MOCK_EVENTS[next - 1];
        if (ev?.type === 'run.paused') {
          setPlaying(false);
          setLiveAnnouncement(`Ejecución en pausa: ${String(ev.payload.title ?? 'esperando acción humana')}`);
        }
        return next;
      });
    }, 1150);
    return () => window.clearInterval(id);
  }, [playing]);

  const jumpCamera = useCallback((preset: CameraPresetId) => {
    setFollowSelected(false);
    setCameraPreset(preset);
    setCameraTrigger((n) => n + 1);
  }, []);

  const handleSelectAgent = useCallback((id: AgentId | null) => {
    setSelectedAgent(id);
    if (id) {
      setActiveTab('inspector');
      setLiveAnnouncement(`Agente seleccionado: ${AGENT_PROFILES[id].displayName}`);
    } else {
      setFollowSelected(false);
    }
  }, []);

  const handleCheckpointAction = useCallback(
    (optionId: string) => {
      if (optionId === 'training_yes' || optionId === 'training_no') {
        const include = optionId === 'training_yes';
        setOverrides((prev) => ({ ...prev, includesTraining: include }));
        setEventCursor(6); // Advance directly past human scope answer to plan.created
        setPlaying(true);
        setLiveAnnouncement(
          include
            ? 'Alcance actualizado con formación. Reanudando plan DAG.'
            : 'Alcance actualizado sin formación. Reanudando plan DAG.'
        );
        return;
      }
      if (optionId === 'approve') {
        setOverrides((prev) => ({ ...prev, meetingActive: false }));
        setEventCursor(24); // approval.resolved + run.resumed + offers task.completed
        setPlaying(true);
        setLiveAnnouncement('Oferta aprobada. Reanudando Proyectos, Facturación y Diseño.');
        return;
      }
      if (optionId === 'correct') {
        setEventCursor(18); // Return offers to working for controlled adjustment
        setPlaying(false);
        setLiveAnnouncement('Solicitud de ajuste registrada. Ofertas vuelve a revisión.');
      }
    },
    []
  );

  const handleInteractLandmark = useCallback(
    (landmark: LandmarkId) => {
      switch (landmark) {
        case 'retro_pc':
          heritageDialogRef.current?.showModal();
          break;
        case 'reception_mail':
          setPlaying(false);
          setOverrides((prev) => ({
            ...INITIAL_OVERRIDES,
            includesTraining: prev.includesTraining,
            receptionPulse: true,
          }));
          setEventCursor(1);
          jumpCamera('reception');
          setLiveAnnouncement('Nueva señal CRM Nortia recibida en Recepción.');
          break;
        case 'whiteboard':
          jumpCamera('director');
          setSelectedAgent('director');
          setActiveTab('project');
          setOverrides((prev) => ({
            ...prev,
            agentOverrides: {
              ...prev.agentOverrides,
              director: {
                activity: 'whiteboard',
                state: 'planning',
                holdingProp: 'tablet',
                bubbleText: 'Revisando dependencias del plan DAG en pizarra…',
              },
            },
          }));
          setLiveAnnouncement('Cámara enfocada en Dirección y pizarra DAG.');
          break;
        case 'boardroom':
          setOverrides((prev) => {
            const next = !prev.meetingActive;
            setLiveAnnouncement(
              next
                ? 'Reunión convocada en Sala Alierta: el equipo se desplaza.'
                : 'Reunión cerrada: el equipo regresa a sus puestos.'
            );
            return { ...prev, meetingActive: next, coffeeBreakActive: false };
          });
          jumpCamera('boardroom');
          break;
        case 'academy':
          jumpCamera('academy');
          setSelectedAgent('consultant');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            meetingActive: false,
            coffeeBreakActive: false,
            agentOverrides: {
              ...prev.agentOverrides,
              consultant: {
                activity: 'academy',
                state: 'collaborating',
                holdingProp: 'tablet',
                bubbleText: prev.includesTraining
                  ? 'Preparando el aula práctica de formación para el equipo Nortia…'
                  : 'Academia Integra lista (formación opcional no activada en el alcance).',
              },
            },
          }));
          setLiveAnnouncement('Cámara enfocada en Academia Integra · Formación.');
          break;
        case 'coffee':
          setOverrides((prev) => {
            const next = !prev.coffeeBreakActive;
            setLiveAnnouncement(
              next
                ? 'Pausa café activa en Rincón Café, Lounge y Terraza.'
                : 'Fin de pausa café: agentes regresan a sus puestos.'
            );
            return { ...prev, coffeeBreakActive: next, meetingActive: false };
          });
          jumpCamera('cafe');
          break;
        case 'terrace':
          jumpCamera('terrace');
          setSelectedAgent('director');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            meetingActive: false,
            coffeeBreakActive: false,
            agentOverrides: {
              ...prev.agentOverrides,
              director: {
                activity: 'terrace',
                state: 'idle',
                holdingProp: 'coffee',
                bubbleText: 'Respirando aire fresco bajo la pérgola cerámica mirando al DAT Alierta…',
              },
            },
          }));
          setLiveAnnouncement('Cámara enfocada en la Terraza Exterior bajo la pérgola.');
          break;
        case 'phone_booth':
          jumpCamera('commercial');
          setSelectedAgent('crm');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            meetingActive: false,
            coffeeBreakActive: false,
            agentOverrides: {
              ...prev.agentOverrides,
              crm: {
                activity: 'phone_booth',
                state: 'collaborating',
                holdingProp: 'none',
                bubbleText: 'Llamada de seguimiento con Nortia Industrial en cabina acústica…',
              },
            },
          }));
          setLiveAnnouncement('Cámara enfocada en las cabinas acústicas de Comercial.');
          break;
        case 'auditorium':
          jumpCamera('reception');
          setSelectedAgent('designer');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            meetingActive: false,
            coffeeBreakActive: false,
            agentOverrides: {
              ...prev.agentOverrides,
              designer: {
                activity: 'auditorium',
                state: 'collaborating',
                holdingProp: 'tablet',
                bubbleText: 'Ensayando la demo ejecutiva en la grada de roble IntegraTalks…',
              },
            },
          }));
          setLiveAnnouncement('Cámara enfocada en la Grada IntegraTalks.');
          break;
        case 'printer':
          jumpCamera('commercial');
          setSelectedAgent('offers');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            agentOverrides: {
              ...prev.agentOverrides,
              offers: {
                activity: 'printer',
                state: 'waiting',
                holdingProp: 'binder',
                bubbleText: 'Recogiendo oferta-nortia-borrador.docx en la estación de impresión…',
              },
            },
          }));
          break;
        case 'arch_board':
          jumpCamera('solutions');
          setSelectedAgent('architect');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            agentOverrides: {
              ...prev.agentOverrides,
              architect: {
                activity: 'arch_board',
                state: 'working',
                holdingProp: 'tablet',
                bubbleText: 'Validando arquitectura Microsoft Fabric en la pizarra de cristal…',
              },
            },
          }));
          break;
        case 'slides_tv':
          jumpCamera('communication');
          setSelectedAgent('designer');
          setActiveTab('inspector');
          setOverrides((prev) => ({
            ...prev,
            agentOverrides: {
              ...prev.agentOverrides,
              designer: {
                activity: 'slides_tv',
                state: 'working',
                holdingProp: 'tablet',
                bubbleText: 'Revisando las 6 diapositivas del comité Nortia en pantalla 16:9…',
              },
            },
          }));
          break;
      }
    },
    [jumpCamera]
  );

  const commandAgent = useCallback(
    (
      id: AgentId,
      patch: {
        state?: AgentState;
        activity?: AgentActivity;
        holdingProp?: 'none' | 'coffee' | 'binder' | 'tablet';
        bubbleText?: string;
      }
    ) => {
      setOverrides((prev) => ({
        ...prev,
        meetingActive: false,
        coffeeBreakActive: false,
        agentOverrides: {
          ...prev.agentOverrides,
          [id]: {
            ...prev.agentOverrides[id],
            ...patch,
          },
        },
      }));
    },
    []
  );

  const clearOverrides = useCallback(() => {
    setOverrides((prev) => ({
      ...INITIAL_OVERRIDES,
      includesTraining: prev.includesTraining,
    }));
    setLiveAnnouncement('Overrides manuales limpiados; escena sincronizada con eventos.');
  }, []);

  // Keyboard navigation fallback for tablist (arrow keys + Home/End)
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = SIDE_TABS.findIndex((t) => t.id === activeTab);
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % SIDE_TABS.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + SIDE_TABS.length) % SIDE_TABS.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = SIDE_TABS.length - 1;
    else return;

    e.preventDefault();
    const nextTab = SIDE_TABS[nextIdx].id;
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  // Sync hidden="until-found" beforematch events so Find-in-Page opens hidden tabs
  const panelRefs = useRef<Partial<Record<SideTabId, HTMLDivElement | null>>>({});
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    for (const tab of SIDE_TABS) {
      const el = panelRefs.current[tab.id];
      if (!el) continue;
      const onMatch = () => setActiveTab(tab.id);
      el.addEventListener('beforematch', onMatch);
      cleanups.push(() => el.removeEventListener('beforematch', onMatch));
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const inspectedId: AgentId = selectedAgent ?? 'director';
  const inspectedProfile = AGENT_PROFILES[inspectedId];
  const inspectedRuntime = scene.agents[inspectedId];
  const inspectedMeta = STATE_META[inspectedRuntime.state];

  const completedTasks = scene.planTasks.filter((t) => t.state === 'completed').length;
  const activeAgentsCount = AGENT_ORDER.filter(
    (id) =>
      scene.agents[id].state === 'working' ||
      scene.agents[id].state === 'planning' ||
      scene.agents[id].state === 'collaborating'
  ).length;

  const isDarkHud = mood === 'night';

  return (
    <div className="app-shell">
      <a href="#main-stage" className="skip-link visually-hidden">
        Ir a la oficina 3D
      </a>

      {/* Centralized polite live region for screen readers */}
      <div role="status" aria-live="polite" className="visually-hidden">
        {liveAnnouncement}
      </div>

      {/* ==================== TOP INTEGRA BRAND HEADER ==================== */}
      <header className="topbar">
        <div className="brand-cluster">
          <img
            src="/assets/branding/logo-integra-blanco.svg"
            alt="Integra Tecnología"
            className="brand-logo"
          />
          <span className="brand-sep" aria-hidden="true" />
          <div>
            <h1 className="brand-heading">Integra HQ · DAT Alierta 2029</h1>
            <span className="brand-subtitle">
              {scene.projectTitle} · Sede 28×20 m · 8 especialistas digitales
            </span>
          </div>
        </div>

        <div className="topbar-meta">
          <span className="badge-pill cyan">
            <Cpu size={14} weight="regular" aria-hidden="true" />
            MOCK · REPLAY 34 EVENTOS
          </span>
          {scene.status === 'paused' && (
            <span className="badge-pill amber">
              <WarningCircle size={14} weight="regular" aria-hidden="true" />
              EN PAUSA · CHECKPOINT
            </span>
          )}
          <span className="badge-pill">PROTOTIPO HACKATHON · NO PRODUCTO OFICIAL</span>
        </div>
      </header>

      {/* ==================== MAIN WORKSPACE (3D VIEWPORT + INSPECTOR) ==================== */}
      <div className="workspace">
        <main id="main-stage" tabIndex={-1} className="stage-column">
          <div className="stage-viewport">
            <OfficeCanvas
              scene={scene}
              ambientMap={ambientMap}
              mood={mood}
              cameraPreset={cameraPreset}
              cameraTrigger={cameraTrigger}
              followSelected={followSelected}
              selectedAgent={selectedAgent}
              bubbleMode={bubbleMode}
              showPulses={showPulses}
              reducedMotion={reducedMotion}
              onSelectAgent={handleSelectAgent}
              onInteractLandmark={handleInteractLandmark}
              onMetrics={setMetrics}
            />

            {/* Top Floating Scene Controls (Lighting, Quick Choreography, Toggles) */}
            <div className="hud-top-bar">
              <div className="hud-group">
                <div
                  className={`hud-strip${isDarkHud ? ' dark-mood' : ''}`}
                  role="group"
                  aria-label="Iluminación ambiental"
                >
                  <button
                    type="button"
                    className={`hud-btn${mood === 'day' ? ' active' : ''}`}
                    onClick={() => setMood('day')}
                  >
                    <Sun size={15} weight="regular" aria-hidden="true" />
                    Día
                  </button>
                  <button
                    type="button"
                    className={`hud-btn${mood === 'golden' ? ' active' : ''}`}
                    onClick={() => setMood('golden')}
                  >
                    <SunHorizon size={15} weight="regular" aria-hidden="true" />
                    Atardecer
                  </button>
                  <button
                    type="button"
                    className={`hud-btn${mood === 'night' ? ' active' : ''}`}
                    onClick={() => setMood('night')}
                  >
                    <MoonStars size={15} weight="regular" aria-hidden="true" />
                    Guardia IA
                  </button>
                </div>

                <div
                  className={`hud-strip${isDarkHud ? ' dark-mood' : ''}`}
                  role="group"
                  aria-label="Acciones rápidas de oficina"
                >
                  <button
                    type="button"
                    className={`hud-btn${overrides.meetingActive ? ' active' : ''}`}
                    onClick={() => handleInteractLandmark('boardroom')}
                  >
                    <UsersThree size={15} weight="regular" aria-hidden="true" />
                    Sala Alierta
                  </button>
                  <button
                    type="button"
                    className={`hud-btn${overrides.coffeeBreakActive ? ' active' : ''}`}
                    onClick={() => handleInteractLandmark('coffee')}
                  >
                    <Coffee size={15} weight="regular" aria-hidden="true" />
                    Café
                  </button>
                  <button
                    type="button"
                    className="hud-btn"
                    onClick={() => handleInteractLandmark('reception_mail')}
                  >
                    <EnvelopeSimple size={15} weight="regular" aria-hidden="true" />
                    Señal CRM
                  </button>
                </div>
              </div>

              <div className="hud-group">
                <div className={`hud-strip${isDarkHud ? ' dark-mood' : ''}`}>
                  <button
                    type="button"
                    className={`hud-btn${ambientLife ? ' active' : ''}`}
                    onClick={() => {
                      setAmbientLife((prev) => {
                        const next = !prev;
                        if (next) setAmbientTrigger((n) => n + 1);
                        return next;
                      });
                    }}
                  >
                    <Sparkle size={15} weight="regular" aria-hidden="true" />
                    {ambientLife ? 'Vida sim: ON' : 'Vida sim: OFF'}
                  </button>
                  <button
                    type="button"
                    className={`hud-btn${bubbleMode !== 'none' ? ' active' : ''}`}
                    onClick={() =>
                      setBubbleMode((m) => (m === 'smart' ? 'all' : m === 'all' ? 'none' : 'smart'))
                    }
                  >
                    <ChatCircleDots size={15} weight="regular" aria-hidden="true" />
                    {bubbleMode === 'smart'
                      ? 'Globos: Activos'
                      : bubbleMode === 'all'
                        ? 'Globos: Todos'
                        : 'Globos: Ocultos'}
                  </button>
                  <button
                    type="button"
                    className={`hud-btn${showPulses ? ' active' : ''}`}
                    onClick={() => setShowPulses((p) => !p)}
                  >
                    <Lightning size={15} weight="regular" aria-hidden="true" />
                    Pulsos
                  </button>
                </div>

                <div className={`hud-metrics mono${isDarkHud ? ' dark-mood' : ''}`}>
                  <span>{metrics.fps} FPS</span>
                  <span>{metrics.frameMs} ms</span>
                </div>
              </div>
            </div>

            {/* Prominent Interactive Human Checkpoint Banner when paused */}
            {scene.checkpoint && (
              <section
                className="checkpoint-banner"
                aria-label="Acción humana requerida"
              >
                <h2>
                  <WarningCircle size={17} weight="fill" color="#D5A13D" aria-hidden="true" />
                  {scene.checkpoint.title}
                </h2>
                <p>{scene.checkpoint.text}</p>
                {scene.checkpoint.priceBand && (
                  <span className="checkpoint-price mono">{scene.checkpoint.priceBand}</span>
                )}
                <div className="checkpoint-actions">
                  {scene.checkpoint.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`btn ${opt.tone === 'primary' ? 'approve' : ''}`}
                      onClick={() => handleCheckpointAction(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Camera Presets Dock */}
            <div className="camera-dock">
              <div
                className={`camera-pills${isDarkHud ? ' dark-mood' : ''}`}
                role="group"
                aria-label="Cámaras por zona"
              >
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`hud-btn${!followSelected && cameraPreset === preset.id ? ' active' : ''}`}
                    onClick={() => jumpCamera(preset.id)}
                  >
                    {preset.shortLabel}
                  </button>
                ))}
              </div>

              <span className={`camera-hint${isDarkHud ? ' dark-mood' : ''}`}>
                Arrastra para rotar · Rueda para zoom · Click en agentes, pizarras, café o PC 1986
              </span>
            </div>
          </div>

          {/* ==================== BOTTOM 34-EVENT REPLAY TIMELINE ==================== */}
          <div className="timeline-bar" role="region" aria-label="Control de secuencia de eventos">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                clearOverrides();
                if (eventCursor >= MOCK_EVENTS.length) setEventCursor(1);
                setPlaying((p) => !p);
              }}
            >
              {playing ? (
                <>
                  <Pause size={14} weight="fill" aria-hidden="true" />
                  Pausar
                </>
              ) : (
                <>
                  <Play size={14} weight="fill" aria-hidden="true" />
                  Reproducir ciclo
                </>
              )}
            </button>

            <button
              type="button"
              className="btn sm"
              aria-label="Evento anterior"
              onClick={() => {
                setPlaying(false);
                clearOverrides();
                setEventCursor((c) => Math.max(0, c - 1));
              }}
            >
              <SkipBack size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn sm"
              aria-label="Evento siguiente"
              onClick={() => {
                setPlaying(false);
                clearOverrides();
                setEventCursor((c) => Math.min(MOCK_EVENTS.length, c + 1));
              }}
            >
              <SkipForward size={14} aria-hidden="true" />
            </button>

            <input
              type="range"
              className="timeline-scrubber"
              min={0}
              max={MOCK_EVENTS.length}
              value={eventCursor}
              aria-label="Cursor de eventos del expediente Nortia Industrial"
              onChange={(e) => {
                setPlaying(false);
                clearOverrides();
                setEventCursor(Number(e.target.value));
              }}
            />

            <strong className="mono" style={{ fontSize: 12 }}>
              #{eventCursor}/{MOCK_EVENTS.length}
            </strong>

            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setPlaying(false);
                clearOverrides();
                setEventCursor(3);
                jumpCamera('director');
              }}
            >
              Alcance #3
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setPlaying(false);
                clearOverrides();
                setEventCursor(21);
                jumpCamera('boardroom');
              }}
            >
              Aprobación #21
            </button>

            <span className="timeline-caption">
              {typeof scene.lastEvent?.payload?.title === 'string'
                ? scene.lastEvent.payload.title
                : 'Oficina lista para iniciar'}
            </span>
          </div>
        </main>

        {/* ==================== RIGHT PANEL (TABS + INSPECTOR + SANDBOX) ==================== */}
        <aside className="side-panel" aria-label="Panel lateral de supervisión">
          <div
            className="tablist"
            role="tablist"
            aria-label="Secciones del panel"
            onKeyDown={handleTabKeyDown}
            {...({ focusgroup: 'tablist nomemory' } as Record<string, string>)}
          >
            {SIDE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  {...(isSelected ? ({ focusgroupstart: '' } as Record<string, string>) : {})}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.id === 'project' && <BuildingOffice size={15} aria-hidden="true" />}
                  {tab.id === 'inspector' && <Eye size={15} aria-hidden="true" />}
                  {tab.id === 'events' && <ListChecks size={15} aria-hidden="true" />}
                  {tab.id === 'scene' && <SlidersHorizontal size={15} aria-hidden="true" />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="panel-stack">
            {/* TAB 1: PROYECTO Y EQUIPO */}
            <div
              ref={(el) => {
                panelRefs.current.project = el;
              }}
              role="tabpanel"
              aria-labelledby="tab-project"
              tabIndex={activeTab === 'project' ? 0 : undefined}
              hidden={activeTab !== 'project' ? ('until-found' as unknown as boolean) : undefined}
            >
              <div className="panel-inner">
                <div>
                  <h2 className="panel-title">Nortia Industrial</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Ciclo agéntico completo · supervisión humana obligatoria
                  </p>
                </div>

                <div className="kpi-strip">
                  <div className="kpi-box">
                    <span className="kpi-val mono">
                      {completedTasks}/{scene.planTasks.length}
                    </span>
                    <span className="kpi-lbl">Tareas DAG</span>
                  </div>
                  <div className="kpi-box">
                    <span className="kpi-val mono">{activeAgentsCount}/8</span>
                    <span className="kpi-lbl">Activos ahora</span>
                  </div>
                  <div className="kpi-box">
                    <span className="kpi-val mono">{scene.artifacts.length}/5</span>
                    <span className="kpi-lbl">Entregables</span>
                  </div>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Equipo digital (8 roles)
                  </h3>
                  <ul className="roster-list">
                    {AGENT_ORDER.map((id) => {
                      const prof = AGENT_PROFILES[id];
                      const rt = scene.agents[id];
                      const meta = STATE_META[rt.state];
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            className={`roster-btn${selectedAgent === id ? ' selected' : ''}`}
                            onClick={() => handleSelectAgent(id)}
                          >
                            <span className="roster-main">
                              <span
                                className="status-dot"
                                style={{ background: meta.color }}
                                aria-hidden="true"
                              />
                              <span>
                                <strong>{prof.displayName}</strong>
                                <span className="roster-role">{prof.zoneLabel}</span>
                              </span>
                            </span>
                            <span className="status-chip" style={{ background: meta.color }}>
                              {meta.shortLabel}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Plan DAG validado ({scene.includesTraining ? 'con formación' : 'sin formación'})
                  </h3>
                  <ul className="dag-list">
                    {scene.planTasks.map((t) => {
                      const col =
                        t.state === 'completed'
                          ? '#36966C'
                          : t.state === 'running'
                            ? '#00B0F0'
                            : t.state === 'waiting'
                              ? '#D5A13D'
                              : '#8A97A4';
                      return (
                        <li key={t.id} className="dag-item">
                          <div>
                            <strong>
                              {t.id.toUpperCase()} · {AGENT_PROFILES[t.agent].name}
                            </strong>
                            <span className="dag-sub">{t.instruction}</span>
                          </div>
                          <span className="status-chip" style={{ background: col }}>
                            {t.state}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Entregables verificados
                  </h3>
                  {scene.artifacts.length > 0 ? (
                    <ul className="artifact-list">
                      {scene.artifacts.map((art) => (
                        <li key={art.id} className="dag-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <FileText size={16} color="#115293" aria-hidden="true" />
                            <div>
                              <strong className="mono" style={{ fontSize: 11.5 }}>
                                {art.name}
                              </strong>
                              <span className="dag-sub">
                                {AGENT_PROFILES[art.agent].displayName}
                                {art.draft ? ' · BORRADOR' : ''}
                              </span>
                            </div>
                          </div>
                          <CheckCircle size={16} color="#36966C" aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                      Avanza el ciclo de eventos para ver generarse los 5 entregables reales.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* TAB 2: INSPECTOR DE AGENTE + ACCIONES INTERACTIVAS */}
            <div
              ref={(el) => {
                panelRefs.current.inspector = el;
              }}
              role="tabpanel"
              aria-labelledby="tab-inspector"
              tabIndex={activeTab === 'inspector' ? 0 : undefined}
              hidden={activeTab !== 'inspector' ? ('until-found' as unknown as boolean) : undefined}
            >
              <div className="panel-inner">
                <div>
                  <h2 className="panel-title">{inspectedProfile.displayName}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span className="status-chip" style={{ background: inspectedMeta.color }}>
                      {inspectedMeta.label}
                    </span>
                    <button
                      type="button"
                      className={`btn sm${followSelected ? ' primary' : ''}`}
                      onClick={() => {
                        setSelectedAgent(inspectedId);
                        setFollowSelected((f) => !f);
                      }}
                    >
                      <ArrowsOutCardinal size={13} aria-hidden="true" />
                      {followSelected ? 'Siguiendo cámara' : 'Seguir agente'}
                    </button>
                  </div>
                </div>

                <dl className="kv-grid">
                  <dt>Zona</dt>
                  <dd>{inspectedProfile.zoneLabel}</dd>
                  <dt>Rol</dt>
                  <dd>{inspectedProfile.role}</dd>
                  <dt>Actividad</dt>
                  <dd className="mono">{inspectedRuntime.activity}</dd>
                  <dt>Tarea actual</dt>
                  <dd>{inspectedRuntime.currentTaskTitle}</dd>
                  <dt>Semántica</dt>
                  <dd>{inspectedMeta.caption}</dd>
                </dl>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Probar interacciones con el entorno
                  </h3>
                  <div className="action-grid">
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'desk',
                          state: 'working',
                          holdingProp: 'none',
                          bubbleText: inspectedProfile.workingComments[0],
                        })
                      }
                    >
                      Trabajar en puesto
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'whiteboard',
                          state: 'planning',
                          holdingProp: 'tablet',
                          bubbleText: 'Revisando dependencias en la pizarra DAG…',
                        })
                      }
                    >
                      Ir a pizarra DAG
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'boardroom',
                          state: 'collaborating',
                          holdingProp: 'tablet',
                          bubbleText: 'Entrando a Sala Alierta para revisión del proyecto…',
                        })
                      }
                    >
                      Ir a Sala Alierta
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'coffee',
                          state: 'idle',
                          holdingProp: 'coffee',
                          bubbleText: inspectedProfile.coffeeBanter[0],
                        })
                      }
                    >
                      Ir por café
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'arch_board',
                          state: 'collaborating',
                          holdingProp: 'tablet',
                          bubbleText: 'Contrastando nodos de Microsoft Fabric en Soluciones…',
                        })
                      }
                    >
                      Ir a pizarra Fabric
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'terrace',
                          state: 'idle',
                          holdingProp: 'coffee',
                          bubbleText: 'Saliendo a la terraza cerámica exterior a tomar el aire…',
                        })
                      }
                    >
                      Salir a Terraza
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'phone_booth',
                          state: 'collaborating',
                          holdingProp: 'none',
                          bubbleText: 'Llamada privada con cliente en cabina acústica…',
                        })
                      }
                    >
                      Cabina acústica
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'academy',
                          state: 'collaborating',
                          holdingProp: 'tablet',
                          bubbleText: 'Revisando temario en Academia Integra…',
                        })
                      }
                    >
                      Ir a Academia
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'auditorium',
                          state: 'collaborating',
                          holdingProp: 'tablet',
                          bubbleText: 'Sentado en la grada IntegraTalks preparando demo…',
                        })
                      }
                    >
                      Grada IntegraTalks
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'retro_pc',
                          state: 'idle',
                          holdingProp: 'none',
                          bubbleText: 'Curioseando el PC retro 1986 en Recepción…',
                        })
                      }
                    >
                      Ver PC 1986
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'desk',
                          state: 'error',
                          holdingProp: 'none',
                          bubbleText: 'Bloqueado: validación fuera de catálogo. Sin envío.',
                        })
                      }
                    >
                      Simular error
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 6 }}>
                    Herramientas autorizadas
                  </h3>
                  <ul className="tag-row">
                    {(inspectedRuntime.tools.length > 0
                      ? inspectedRuntime.tools
                      : inspectedProfile.defaultTools
                    ).map((tool) => (
                      <li key={tool} className="mono">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 6 }}>
                    Fuentes trazables
                  </h3>
                  <ul className="tag-row">
                    {(inspectedRuntime.sources.length > 0
                      ? inspectedRuntime.sources
                      : inspectedProfile.defaultSources
                    ).map((src) => (
                      <li key={src} className="mono">
                        {src}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="callout-note">
                  <strong>Contrato listo para backend:</strong> este inspector lee exclusivamente{' '}
                  <code>OfficeSceneState</code> derivado del stream <code>OfficeEvent[]</code>.
                  Nunca expone prompts ni razonamiento interno.
                </div>
              </div>
            </div>

            {/* TAB 3: STREAM DE EVENTOS */}
            <div
              ref={(el) => {
                panelRefs.current.events = el;
              }}
              role="tabpanel"
              aria-labelledby="tab-events"
              tabIndex={activeTab === 'events' ? 0 : undefined}
              hidden={activeTab !== 'events' ? ('until-found' as unknown as boolean) : undefined}
            >
              <div className="panel-inner">
                <div>
                  <h2 className="panel-title">Stream de 34 eventos</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Pulsa cualquier evento para saltar directamente a ese estado en la oficina 3D.
                  </p>
                </div>

                <ol className="event-log">
                  {MOCK_EVENTS.map((ev) => {
                    const isCurrent = ev.sequence === eventCursor;
                    const title = typeof ev.payload.title === 'string' ? ev.payload.title : ev.type;
                    return (
                      <li key={ev.event_id}>
                        <button
                          type="button"
                          className={`roster-btn${isCurrent ? ' selected' : ''}`}
                          onClick={() => {
                            setPlaying(false);
                            clearOverrides();
                            setEventCursor(ev.sequence);
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div className="event-row-top">
                              <strong className="mono" style={{ fontSize: 11 }}>
                                #{ev.sequence} · {ev.type}
                              </strong>
                            </div>
                            <span className="roster-role">{title}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* TAB 4: ESCENA 3D Y CRÉDITOS CC0 */}
            <div
              ref={(el) => {
                panelRefs.current.scene = el;
              }}
              role="tabpanel"
              aria-labelledby="tab-scene"
              tabIndex={activeTab === 'scene' ? 0 : undefined}
              hidden={activeTab !== 'scene' ? ('until-found' as unknown as boolean) : undefined}
            >
              <div className="panel-inner">
                <div>
                  <h2 className="panel-title">Dirección visual · DAT Alierta</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Interpretación creativa de la futura sede de Integra en Zaragoza (IDOM · 2029).
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => setReducedMotion(e.target.checked)}
                    />
                    Reducir movimiento y desplazamientos
                  </label>
                  <button type="button" className="btn" onClick={clearOverrides}>
                    Sincronizar escena con eventos (limpiar pruebas)
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => heritageDialogRef.current?.showModal()}
                  >
                    Abrir Easter Egg · PC 1986 Calatayud
                  </button>
                </div>

                <div className="callout-note">
                  <strong>Assets 3D y licencias auditadas:</strong>
                  <br />• 34 muebles GLB:{' '}
                  <strong>Kenney Furniture Kit 2.0 (CC0)</strong>
                  <br />• 16 piezas exteriores GLB (árboles, vehículos, pabellones):{' '}
                  <strong>Kenney Nature / Car / City Kits (CC0)</strong>
                  <br />• Suelo roble PBR y mapa IBL HDRI:{' '}
                  <strong>Poly Haven (CC0)</strong>
                  <br />• Logotipo vectorial oficial:{' '}
                  <strong>Integra Tecnología</strong> (permiso hackathon; no producto oficial).
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ==================== NATIVE <dialog> EASTER EGG · 1986 CALATAYUD ==================== */}
      <dialog
        ref={heritageDialogRef}
        className="heritage-dialog"
        aria-labelledby="heritage-title"
      >
        <div className="heritage-dialog-body">
          <img
            src="/assets/branding/logo-integra-blanco.svg"
            alt="Integra Tecnología"
            style={{ height: 26, width: 'auto', alignSelf: 'flex-start' }}
          />
          <h2 id="heritage-title">1986 Calatayud → 2029 DAT Alierta</h2>
          <div className="heritage-terminal mono">
            C:\INTEGRA&gt; HISTORY --YEARS=40
            <br />
            1986: Primeros pasos en Calatayud (Aragón)
            <br />
            2026: 40 aniversario · 800+ personas · 6× Microsoft Partner
            <br />
            2029: Nueva sede DAT Alierta · 8.000 m² · Empresa Agéntica HQ
          </div>
          <p>
            Cuatro décadas uniendo consultoría, tecnología y conocimiento desde Aragón. Este
            diorama 3D imagina cómo un equipo humano dirige a especialistas digitales con
            trazabilidad real y criterio propio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => heritageDialogRef.current?.close()}
            >
              Volver a la oficina 3D
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
