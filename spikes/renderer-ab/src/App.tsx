import { useEffect, useMemo, useState } from 'react';
import integraLogoWhite from '@brand/logo-integra-blanco.svg';
import { Renderer2DIsometric } from './renderers/Renderer2DIsometric';
import { Renderer3DR3F } from './renderers/Renderer3DR3F';
import {
  buildManualDeskState,
  type CriterionId,
  type DemoRoleId,
  type DeskVisualState,
  MOCK_EVENTS,
  reduceEventsToDeskState,
  type RendererMetrics,
  ROLE_PRESETS,
  SCORECARD_CRITERIA,
  STATE_META,
} from './state/deskReducer';

type ViewMode = 'split' | 'a' | 'b';
type ControlSource = 'manual' | 'events';
type SideTab = 'inspector' | 'scorecard';

const INITIAL_SCORES: Record<'a' | 'b', Record<CriterionId, number>> = {
  a: { quality: 3, ease: 5, flexibility: 4, performance: 5, impact: 3 },
  b: { quality: 4, ease: 3, flexibility: 4, performance: 4, impact: 4 },
};

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [controlSource, setControlSource] = useState<ControlSource>('manual');
  const [manualRole, setManualRole] = useState<DemoRoleId>('offers');
  const [manualState, setManualState] = useState<DeskVisualState>('working');
  const [eventIdx, setEventIdx] = useState<number>(18);
  const [playing, setPlaying] = useState<boolean>(false);
  const [selected, setSelected] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [pixelatedA, setPixelatedA] = useState<boolean>(false);
  const [orbitB, setOrbitB] = useState<boolean>(false);
  const [showCommentsB, setShowCommentsB] = useState<boolean>(true);
  const [sideTab, setSideTab] = useState<SideTab>('inspector');
  const [metricsA, setMetricsA] = useState<RendererMetrics>({
    fps: 0,
    frameMs: 0,
    firstRenderMs: null,
  });
  const [metricsB, setMetricsB] = useState<RendererMetrics>({
    fps: 0,
    frameMs: 0,
    firstRenderMs: null,
  });
  const [scores, setScores] = useState(INITIAL_SCORES);

  useEffect(() => {
    if (!playing || controlSource !== 'events') return;
    const id = window.setInterval(() => {
      setEventIdx((prev) => {
        if (prev >= MOCK_EVENTS.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [playing, controlSource]);

  const scene = useMemo(
    () =>
      controlSource === 'manual'
        ? buildManualDeskState(manualRole, manualState, selected, reducedMotion)
        : reduceEventsToDeskState(eventIdx, selected, reducedMotion),
    [controlSource, manualRole, manualState, eventIdx, selected, reducedMotion]
  );

  const weightedTotal = (candidate: 'a' | 'b') =>
    SCORECARD_CRITERIA.reduce(
      (sum, c) => sum + scores[candidate][c.id] * c.weight,
      0
    ).toFixed(2);

  const updateScore = (candidate: 'a' | 'b', id: CriterionId, raw: string) => {
    const val = Math.max(1, Math.min(5, Number(raw) || 1));
    setScores((prev) => ({
      ...prev,
      [candidate]: { ...prev[candidate], [id]: val },
    }));
  };

  const stateMeta = STATE_META[scene.state];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <img
            src={integraLogoWhite}
            alt="Integra Tecnología"
            className="brand-logo"
          />
          <span className="brand-divider" aria-hidden="true" />
          <div>
            <h1 className="brand-title">Integra HQ · Spike Visual A vs B</h1>
            <span className="brand-sub">
              Microescena comparativa de 1 escritorio · mismo contrato de estados
            </span>
          </div>
        </div>
        <div className="topbar-badges">
          <span className="mode-badge">MOCK · DATOS SINTÉTICOS</span>
          <span className="mode-badge">USO HACKATHON · NO PRODUCTO OFICIAL</span>
        </div>
      </header>

      <section className="control-bar" aria-label="Controles de comparación">
        <div className="control-group">
          <span className="group-label">Vista</span>
          <button
            type="button"
            className={viewMode === 'split' ? 'active' : ''}
            onClick={() => setViewMode('split')}
          >
            A vs B lado a lado
          </button>
          <button
            type="button"
            className={viewMode === 'a' ? 'active' : ''}
            onClick={() => setViewMode('a')}
          >
            Solo A (2D Iso)
          </button>
          <button
            type="button"
            className={viewMode === 'b' ? 'active' : ''}
            onClick={() => setViewMode('b')}
          >
            Solo B (3D R3F)
          </button>
        </div>

        <div className="control-group">
          <span className="group-label">Entrada</span>
          <button
            type="button"
            className={controlSource === 'manual' ? 'active' : ''}
            onClick={() => {
              setPlaying(false);
              setControlSource('manual');
            }}
          >
            Estados manuales
          </button>
          <button
            type="button"
            className={controlSource === 'events' ? 'active' : ''}
            onClick={() => setControlSource('events')}
          >
            Fixture 8 agentes ({MOCK_EVENTS.length} eventos)
          </button>
        </div>

        {controlSource === 'manual' && (
          <div className="control-group">
            <span className="group-label">Rol</span>
            <select
              aria-label="Seleccionar rol de prueba"
              value={manualRole}
              onChange={(e) => setManualRole(e.target.value as DemoRoleId)}
            >
              {(Object.keys(ROLE_PRESETS) as DemoRoleId[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_PRESETS[r].roleLabel}
                </option>
              ))}
            </select>

            <span className="group-label">Estado</span>
            {(Object.keys(STATE_META) as DeskVisualState[]).map((st) => (
              <button
                key={st}
                type="button"
                className={manualState === st ? 'active' : ''}
                onClick={() => setManualState(st)}
              >
                <span
                  className="state-dot"
                  style={{ background: STATE_META[st].color }}
                  aria-hidden="true"
                />
                {STATE_META[st].label}
              </button>
            ))}
          </div>
        )}

        <div className="control-group">
          <label style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            Reducir movimiento
          </label>
        </div>
      </section>

      <div className="workspace">
        <main className="stages-area">
          {controlSource === 'events' && (
            <div className="replay-bar" aria-label="Reproducción del fixture de eventos">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (eventIdx >= MOCK_EVENTS.length) setEventIdx(1);
                  setPlaying((p) => !p);
                }}
              >
                {playing ? 'Pausar replay' : 'Reproducir fixture'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setEventIdx((i) => Math.max(0, i - 1));
                }}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setEventIdx((i) => Math.min(MOCK_EVENTS.length, i + 1));
                }}
              >
                Siguiente
              </button>
              <input
                type="range"
                min={0}
                max={MOCK_EVENTS.length}
                value={eventIdx}
                aria-label="Cursor de evento"
                onChange={(e) => {
                  setPlaying(false);
                  setEventIdx(Number(e.target.value));
                }}
              />
              <strong>
                #{eventIdx}/{MOCK_EVENTS.length}
              </strong>
              <span className="replay-event-caption">{scene.taskTitle}</span>
            </div>
          )}

          <div className={`stages-grid${viewMode !== 'split' ? ' single' : ''}`}>
            {(viewMode === 'split' || viewMode === 'a') && (
              <section className="candidate-panel" aria-label="Candidato A">
                <div className="candidate-header">
                  <div>
                    <h2 className="candidate-title">
                      Candidato A · 2D Isométrico 2:1 (Canvas)
                    </h2>
                    <span className="candidate-meta">
                      Trazado dimétrico original · listo para sprites CC0 (Kenney 2D)
                    </span>
                  </div>
                  <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <input
                      type="checkbox"
                      checked={pixelatedA}
                      onChange={(e) => setPixelatedA(e.target.checked)}
                    />
                    Pixelated
                  </label>
                </div>

                <Renderer2DIsometric
                  scene={scene}
                  pixelated={pixelatedA}
                  onSelect={() => {
                    setSelected(true);
                    setSideTab('inspector');
                  }}
                  onMetrics={setMetricsA}
                />

                <div className="metrics-strip">
                  <span>FPS: {metricsA.fps}</span>
                  <span>Frame: {metricsA.frameMs} ms</span>
                  <span>
                    1er render: {metricsA.firstRenderMs ?? '—'} ms
                  </span>
                  <span>Motor: Canvas 2D nativo</span>
                </div>
              </section>
            )}

            {(viewMode === 'split' || viewMode === 'b') && (
              <section className="candidate-panel" aria-label="Candidato B">
                <div className="candidate-header">
                  <div>
                    <h2 className="candidate-title">
                      Candidato B · 3D Ortográfico (React Three Fiber)
                    </h2>
                    <span className="candidate-meta">
                      Diorama low-poly + CanvasTexture en monitores · listo para GLB CC0/CC BY
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <input
                        type="checkbox"
                        checked={showCommentsB}
                        onChange={(e) => setShowCommentsB(e.target.checked)}
                      />
                      Comentarios 3D
                    </label>
                    <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <input
                        type="checkbox"
                        checked={orbitB}
                        onChange={(e) => setOrbitB(e.target.checked)}
                      />
                      Permitir órbita
                    </label>
                  </div>
                </div>

                <Renderer3DR3F
                  scene={scene}
                  allowOrbit={orbitB}
                  showComments={showCommentsB}
                  onSelect={() => {
                    setSelected(true);
                    setSideTab('inspector');
                  }}
                  onQuickAction={(action) => {
                    if (controlSource === 'manual') {
                      setManualState(action === 'approve' ? 'completed' : 'working');
                    } else if (action === 'approve') {
                      setEventIdx((prev) => Math.min(MOCK_EVENTS.length, Math.max(prev + 2, 24)));
                    } else {
                      setEventIdx(18);
                    }
                  }}
                  onMetrics={setMetricsB}
                />

                <div className="metrics-strip">
                  <span>FPS: {metricsB.fps}</span>
                  <span>Frame: {metricsB.frameMs} ms</span>
                  <span>
                    1er render: {metricsB.firstRenderMs ?? '—'} ms
                  </span>
                  <span>Motor: Three.js + R3F + Drei</span>
                </div>
              </section>
            )}
          </div>
        </main>

        <aside className="side-panel" aria-label="Inspector y matriz de decisión">
          <div className="side-tabs">
            <button
              type="button"
              className={sideTab === 'inspector' ? 'active' : ''}
              onClick={() => setSideTab('inspector')}
            >
              Inspector compartido
            </button>
            <button
              type="button"
              className={sideTab === 'scorecard' ? 'active' : ''}
              onClick={() => setSideTab('scorecard')}
            >
              Matriz A vs B
            </button>
          </div>

          {sideTab === 'inspector' ? (
            <div className="side-section">
              <h2>{scene.roleLabel}</h2>
              <p style={{ margin: '0 0 12px' }}>
                <span
                  className="status-chip"
                  style={{ background: stateMeta.color }}
                >
                  {stateMeta.icon} {stateMeta.label}
                </span>
              </p>

              <dl className="kv-list">
                <dt>Zona</dt>
                <dd>{scene.zoneLabel}</dd>
                <dt>Evento</dt>
                <dd>
                  <code>{scene.lastEventType}</code>
                  {scene.lastSequence > 0 ? ` (#${scene.lastSequence})` : ''}
                </dd>
                <dt>Tarea actual</dt>
                <dd>{scene.taskTitle}</dd>
                <dt>Semántica</dt>
                <dd>{stateMeta.caption}</dd>
              </dl>

              <h3>Herramientas autorizadas</h3>
              {scene.tools.length > 0 ? (
                <ul className="tag-list">
                  {scene.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: '#5b6b7c' }}>Ninguna activa.</p>
              )}

              <h3>Fuentes citadas</h3>
              {scene.sources.length > 0 ? (
                <ul className="tag-list">
                  {scene.sources.map((src) => (
                    <li key={src}>{src}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: '#5b6b7c' }}>Sin fuentes consultadas.</p>
              )}

              <h3>Entregables generados</h3>
              {scene.artifacts.length > 0 ? (
                <ul className="tag-list">
                  {scene.artifacts.map((art) => (
                    <li key={art}>{art}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: '#5b6b7c' }}>
                  Pendiente de evento <code>artifact.created</code>.
                </p>
              )}

              <div className="note-box" style={{ marginTop: 14 }}>
                <strong>Regla de observabilidad:</strong> ambos renderers leen este
                único <code>DeskSceneState</code>. No se expone razonamiento privado
                del modelo ni secretos; sin evento verificado no hay éxito simulado.
              </div>
            </div>
          ) : (
            <div className="side-section">
              <h2>Matriz de decisión (1–5)</h2>
              <p style={{ fontSize: 12, color: '#5b6b7c', marginTop: 0 }}>
                Pesos definidos en <code>02_DISENO/04_PRUEBA_COMPARATIVA.md</code>.
                La licencia web compatible es requisito excluyente.
              </p>

              <table className="score-table">
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>Peso</th>
                    <th>A (2D)</th>
                    <th>B (3D)</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORECARD_CRITERIA.map((c) => (
                    <tr key={c.id}>
                      <td>{c.label}</td>
                      <td>{Math.round(c.weight * 100)}%</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          aria-label={`Puntuación A en ${c.label}`}
                          value={scores.a[c.id]}
                          onChange={(e) => updateScore('a', c.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          aria-label={`Puntuación B en ${c.label}`}
                          value={scores.b[c.id]}
                          onChange={(e) => updateScore('b', c.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="score-total">
                <span>Total ponderado A (2D): {weightedTotal('a')} / 5</span>
                <span>B (3D): {weightedTotal('b')} / 5</span>
              </div>

              <div className="note-box" style={{ marginTop: 12 }}>
                Usa esta prueba para elegir <strong>un solo renderer</strong> antes de
                construir las 5 zonas y los 8 roles. No implementes dos backends ni
                mantengas dos motores en producción.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
