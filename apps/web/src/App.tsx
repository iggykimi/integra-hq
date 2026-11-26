import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowsOutCardinal,
  BuildingOffice,
  CheckCircle,
  Coffee,
  EnvelopeSimple,
  Eye,
  FileText,
  ListChecks,
  MoonStars,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sun,
  SunHorizon,
  UsersThree,
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
import { eventLabel, PROJECT_LABEL, resultLabel, taskLabel, TASK_LABEL } from './state/officeCopy';

type SideTabId = 'project' | 'inspector' | 'events' | 'scene';

const SIDE_TABS: Array<{ id: SideTabId; label: string }> = [
  { id: 'project', label: 'Proyecto' },
  { id: 'inspector', label: 'Agente' },
  { id: 'events', label: 'Actividad' },
  { id: 'scene', label: 'Vista' },
];

const SCOPE_PAUSE = MOCK_EVENTS.findIndex((event) => event.payload.reason === 'waiting_human_scope_decision') + 1;
const OFFER_PAUSE = MOCK_EVENTS.findIndex((event) => event.payload.reason === 'waiting_offer_approval') + 1;

export function App() {
  const [eventCursor, setEventCursor] = useState(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
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
  const checkpointHeadingRef = useRef<HTMLHeadingElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const restorePlayFocus = useRef(false);
  const tabRefs = useRef<Partial<Record<SideTabId, HTMLButtonElement | null>>>({});

  const scene = useMemo(
    () => reduceOfficeSceneState(MOCK_EVENTS, eventCursor, overrides),
    [eventCursor, overrides]
  );

  const checkpointKind = scene.checkpoint?.kind;
  const ambientMap = useOfficeLifeSim(ambientLife && !checkpointKind, reducedMotion, mood, scene, ambientTrigger);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      const next = eventCursor + 1;
      setEventCursor(next);
      if (next === SCOPE_PAUSE || next === OFFER_PAUSE || next === MOCK_EVENTS.length) {
        setPlaying(false);
      }
    }, 1150);
    return () => window.clearTimeout(id);
  }, [eventCursor, playing]);

  const jumpCamera = useCallback((preset: CameraPresetId) => {
    setFollowSelected(false);
    setCameraPreset(preset);
    setCameraTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    if (checkpointKind) {
      jumpCamera(checkpointKind === 'scope_question' ? 'director' : 'boardroom');
      checkpointHeadingRef.current?.focus();
    } else if (restorePlayFocus.current) {
      restorePlayFocus.current = false;
      playButtonRef.current?.focus({ preventScroll: true });
    }
  }, [checkpointKind, jumpCamera]);

  const handleSelectAgent = useCallback((id: AgentId | null) => {
    setSelectedAgent(id);
    if (id) {
      setActiveTab('inspector');
      setLiveAnnouncement(AGENT_PROFILES[id].displayName);
    } else {
      setFollowSelected(false);
    }
  }, []);

  const handleCheckpointAction = useCallback(
    (optionId: string) => {
      restorePlayFocus.current = true;
      if (optionId === 'training_yes' || optionId === 'training_no') {
        const include = optionId === 'training_yes';
        setOverrides((prev) => ({ ...prev, includesTraining: include }));
        setEventCursor(6); // Advance directly past human scope answer to plan.created
        setPlaying(true);
        jumpCamera('overview');
        setLiveAnnouncement(
          include
            ? 'La oferta incluirá formación.'
            : 'La oferta seguirá sin formación.'
        );
        return;
      }
      if (optionId === 'approve') {
        setOverrides((prev) => ({ ...prev, meetingActive: false }));
        setEventCursor(24); // approval.resolved + run.resumed + offers task.completed
        setPlaying(true);
        jumpCamera('overview');
        setLiveAnnouncement('Oferta aprobada. El equipo prepara el proyecto y la factura.');
        return;
      }
      if (optionId === 'correct') {
        setEventCursor(18); // Return offers to working for controlled adjustment
        setPlaying(false);
        setLiveAnnouncement('El equipo de Ofertas revisará el borrador.');
      }
    },
    [jumpCamera]
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
          setLiveAnnouncement('Nueva oportunidad de Nortia en recepción.');
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
                bubbleText: 'Revisando el plan de trabajo',
              },
            },
          }));
          setLiveAnnouncement('Vista de Dirección.');
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
                bubbleText: 'Un descanso en la terraza',
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
                bubbleText: 'Ensayando la presentación',
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
                bubbleText: 'Recogiendo el borrador de la oferta',
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
                bubbleText: 'Revisando la presentación de Nortia',
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
  }, []);

  const seek = (cursor: number) => {
    setPlaying(false);
    clearOverrides();
    setEventCursor(cursor);
  };

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
  const activity = eventLabel(scene.lastEvent, scene.includesTraining);
  const finished = eventCursor === MOCK_EVENTS.length;

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
            <h1 className="brand-heading">Integra HQ</h1>
            <span className="brand-subtitle">DAT Alierta, Zaragoza</span>
          </div>
        </div>

        <div className="topbar-meta">
          <span className="badge-pill">Demo con datos ficticios</span>
          <small>Prototipo no oficial</small>
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
              showPulses={showPulses && !checkpointKind}
              reducedMotion={reducedMotion}
              onSelectAgent={handleSelectAgent}
              onInteractLandmark={handleInteractLandmark}
              onMetrics={setMetrics}
            />

            {scene.checkpoint && (
              <section className="checkpoint-banner" aria-labelledby="decision-title">
                <div className="decision-sender">
                  <span className="decision-avatar" aria-hidden="true">E</span>
                  <span><strong>Elena</strong><br />Dirección</span>
                </div>
                <h2 id="decision-title" tabIndex={-1} ref={checkpointHeadingRef}>{scene.checkpoint.title}</h2>
                <p>{scene.checkpoint.text}</p>
                {scene.checkpoint.priceBand && (
                  <span className="checkpoint-price">{scene.checkpoint.priceBand}</span>
                )}
                <div className="checkpoint-actions">
                  {scene.checkpoint.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`btn${opt.tone === 'primary' ? ' primary' : ''}`}
                      onClick={() => handleCheckpointAction(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="camera-dock">
              <div className="camera-pills" role="group" aria-label="Vistas de la sede">
                {CAMERA_PRESETS.filter((preset) => preset.id === 'overview' || preset.id === 'campus').map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`hud-btn${!followSelected && cameraPreset === preset.id ? ' active' : ''}`}
                    aria-pressed={!followSelected && cameraPreset === preset.id}
                    onClick={() => jumpCamera(preset.id)}
                  >
                    {preset.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="timeline-bar" role="region" aria-label="Demostración de Nortia Industrial">
            <button
              ref={playButtonRef}
              type="button"
              className="btn primary"
              disabled={Boolean(checkpointKind)}
              onClick={() => {
                if (finished || eventCursor === 0) {
                  setOverrides(INITIAL_OVERRIDES);
                  setEventCursor(1);
                  jumpCamera('overview');
                } else if (!playing) {
                  clearOverrides();
                }
                setPlaying((p) => !p);
              }}
            >
              {checkpointKind ? 'En pausa' : playing ? (
                <>
                  <Pause size={14} weight="fill" aria-hidden="true" />
                  Pausar
                </>
              ) : (
                <>
                  <Play size={14} weight="fill" aria-hidden="true" />
                  {finished ? 'Volver a empezar' : eventCursor === 0 ? 'Iniciar demo' : 'Continuar demo'}
                </>
              )}
            </button>

            <span className="timeline-caption">{checkpointKind ? 'El equipo espera tu decisión' : activity}</span>
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
                <div className="project-summary">
                  <h2 className="panel-title">Nortia Industrial</h2>
                  <p className="panel-subtitle">Ampliación de la plataforma de datos</p>
                  <p className="project-status">{checkpointKind ? PROJECT_LABEL.paused : PROJECT_LABEL[scene.status]}</p>
                  <progress
                    value={completedTasks}
                    max={scene.planTasks.length}
                    aria-label="Tareas completadas"
                  />
                  <span className="panel-subtitle">{completedTasks} de {scene.planTasks.length} tareas completadas</span>
                </div>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Equipo
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
                              </span>
                            </span>
                            <span className="status-chip">{meta.shortLabel}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <details className="panel-details">
                  <summary>Plan de trabajo</summary>
                  <ul className="dag-list">
                    {scene.planTasks.map((t) => {
                      return (
                        <li key={t.id} className="dag-item">
                          <strong>{taskLabel(t.agent)}</strong>
                          <span className="status-chip">{TASK_LABEL[t.state]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </details>

                <div>
                  <h3 className="section-head" style={{ marginBottom: 8 }}>
                    Resultados de la demo
                  </h3>
                  {scene.artifacts.length > 0 ? (
                    <ul className="artifact-list">
                      {scene.artifacts.map((art) => (
                        <li key={art.id} className="dag-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <FileText size={16} color="#115293" aria-hidden="true" />
                            <div>
                              <strong>{resultLabel(art.agent)}</strong>
                              <span className="dag-sub">
                                {AGENT_PROFILES[art.agent].displayName}
                              </span>
                            </div>
                          </div>
                          <CheckCircle size={16} color="#36966C" aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="panel-subtitle">Aparecerán cuando el equipo complete sus tareas.</p>
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
                    <span className="status-chip">
                      <span className="status-dot" style={{ background: inspectedMeta.color }} aria-hidden="true" />
                      {inspectedMeta.label}
                    </span>
                    <button
                      type="button"
                      className={`btn sm${followSelected ? ' primary' : ''}`}
                      aria-pressed={followSelected}
                      onClick={() => {
                        setSelectedAgent(inspectedId);
                        setFollowSelected((f) => !f);
                      }}
                    >
                      <ArrowsOutCardinal size={13} aria-hidden="true" />
                      Seguir con cámara
                    </button>
                  </div>
                </div>

                <dl className="kv-grid">
                  <dt>Zona</dt>
                  <dd>{inspectedProfile.zoneLabel}</dd>
                  <dt>Rol</dt>
                  <dd>{inspectedProfile.role}</dd>
                  <dt>Actividad</dt>
                  <dd>{inspectedRuntime.bubbleText}</dd>
                </dl>

                <details className="panel-details">
                  <summary>Probar acciones del agente</summary>
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
                          bubbleText: 'Revisando el plan de trabajo',
                        })
                      }
                    >
                      Ir a la pizarra
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
                          bubbleText: 'Revisando el diseño de la solución',
                        })
                      }
                    >
                      Ir a Soluciones
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        commandAgent(inspectedId, {
                          activity: 'terrace',
                          state: 'idle',
                          holdingProp: 'coffee',
                          bubbleText: 'Un descanso en la terraza',
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
                </details>

                <details className="panel-details">
                  <summary>Detalles técnicos</summary>
                  <h3 className="section-head">Herramientas autorizadas</h3>
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
                  <h3 className="section-head">Fuentes</h3>
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
                </details>
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
                  <h2 className="panel-title">Actividad del proyecto</h2>
                  <p className="panel-subtitle">{activity}</p>
                </div>
                <div>
                  <h3 className="section-head">Momentos clave</h3>
                  <div className="settings-row">
                    <button type="button" className="btn" onClick={() => seek(SCOPE_PAUSE)}>Decidir la formación</button>
                    <button type="button" className="btn" onClick={() => seek(OFFER_PAUSE)}>Revisar oferta</button>
                  </div>
                </div>
                <details className="panel-details">
                  <summary>Registro de eventos</summary>
                  <div className="event-controls">
                    <button type="button" className="btn sm" aria-label="Evento anterior" disabled={eventCursor === 0} onClick={() => seek(eventCursor - 1)}>
                      <SkipBack size={14} aria-hidden="true" />
                    </button>
                    <input type="range" className="timeline-scrubber" min={0} max={MOCK_EVENTS.length} value={eventCursor} aria-label="Posición en la demo" onChange={(e) => seek(Number(e.target.value))} />
                    <button type="button" className="btn sm" aria-label="Evento siguiente" disabled={finished} onClick={() => seek(eventCursor + 1)}>
                      <SkipForward size={14} aria-hidden="true" />
                    </button>
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
                            onClick={() => seek(ev.sequence)}
                            aria-current={isCurrent ? 'step' : undefined}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div className="event-row-top">
                                <strong className="mono" style={{ fontSize: 11 }}>
                                  {ev.sequence}. {eventLabel(ev, scene.includesTraining)}
                                </strong>
                              </div>
                              <span className="roster-role">{ev.type} · {title}</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </details>
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
                  <h2 className="panel-title">Vista de la oficina</h2>
                  <p className="panel-subtitle">Arrastra para girar y usa la rueda para acercarte.</p>
                </div>

                <div className="view-settings">
                  <label htmlFor="office-camera">Zona de la oficina</label>
                  <select
                    id="office-camera"
                    value={followSelected ? '' : cameraPreset}
                    onChange={(e) => {
                      const preset = CAMERA_PRESETS.find((item) => item.id === e.target.value);
                      if (preset) jumpCamera(preset.id);
                    }}
                  >
                    {followSelected && <option value="" disabled>Siguiendo a un agente</option>}
                    {CAMERA_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.shortLabel}</option>)}
                  </select>
                  <div className="settings-row" role="group" aria-label="Luz de la oficina">
                    <button type="button" className="btn" aria-pressed={mood === 'day'} onClick={() => setMood('day')}><Sun size={16} aria-hidden="true" />Día</button>
                    <button type="button" className="btn" aria-pressed={mood === 'golden'} onClick={() => setMood('golden')}><SunHorizon size={16} aria-hidden="true" />Atardecer</button>
                    <button type="button" className="btn" aria-pressed={mood === 'night'} onClick={() => setMood('night')}><MoonStars size={16} aria-hidden="true" />Noche</button>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => setReducedMotion(e.target.checked)}
                    />
                    Reducir movimiento
                  </label>
                  <label>
                    <input type="checkbox" checked={ambientLife} onChange={(e) => {
                      setAmbientLife(e.target.checked);
                      if (e.target.checked) setAmbientTrigger((n) => n + 1);
                    }} />
                    Movimiento de fondo
                  </label>
                  <label>
                    <input type="checkbox" checked={showPulses} onChange={(e) => setShowPulses(e.target.checked)} />
                    Mostrar encargos en el plano
                  </label>
                  <label htmlFor="office-labels">Etiquetas de los agentes</label>
                  <select id="office-labels" value={bubbleMode} onChange={(e) => {
                    const mode = e.target.value;
                    if (mode === 'smart' || mode === 'all' || mode === 'none') setBubbleMode(mode);
                  }}>
                    <option value="smart">Según la vista</option>
                    <option value="all">Mostrar todas</option>
                    <option value="none">Solo nombres</option>
                  </select>
                </div>

                <button type="button" className="btn" onClick={() => heritageDialogRef.current?.showModal()}>
                  La historia de Integra
                </button>

                <details className="panel-details">
                  <summary>Controles de prueba</summary>
                  <div className="settings-row">
                    <button type="button" className="btn" aria-pressed={overrides.meetingActive} onClick={() => handleInteractLandmark('boardroom')}>
                      <UsersThree size={15} aria-hidden="true" />Reunión
                    </button>
                    <button type="button" className="btn" aria-pressed={overrides.coffeeBreakActive} onClick={() => handleInteractLandmark('coffee')}>
                      <Coffee size={15} aria-hidden="true" />Pausa café
                    </button>
                    <button type="button" className="btn" onClick={() => handleInteractLandmark('reception_mail')}>
                      <EnvelopeSimple size={15} aria-hidden="true" />Nueva oportunidad
                    </button>
                  </div>
                  <button type="button" className="btn" onClick={clearOverrides}>
                    Restablecer la escena
                  </button>
                  <p className="panel-subtitle">{metrics.fps} FPS · {metrics.frameMs} ms por fotograma</p>
                </details>

                <details className="panel-details">
                  <summary>Créditos</summary>
                  <p>Interpretación de la futura sede de Integra en Zaragoza. Mobiliario y exterior de Kenney (CC0), texturas de Poly Haven (CC0) y logotipo de Integra Tecnología.</p>
                </details>
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
          <h2 id="heritage-title">De Calatayud al DAT Alierta</h2>
          <div className="heritage-terminal mono">
            C:\INTEGRA&gt; HISTORY
            <br />
            1986: Primeros pasos en Calatayud (Aragón)
            <br />
            2026: 40 años de Integra
            <br />
            2029: Nueva sede prevista en el DAT Alierta
          </div>
          <p>
            Integra nació en Calatayud como empresa de informática y formación. Esta oficina imagina cómo trabajaría un equipo de especialistas digitales en su futura sede de Zaragoza.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => heritageDialogRef.current?.close()}
            >
              Volver a la oficina
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
