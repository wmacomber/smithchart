import { useEffect, useMemo, useReducer, useState } from 'react';
import { Redo2, Undo2 } from 'lucide-react';
import { ChartDescription } from '../chart/ChartDescription';
import { SmithChart } from '../chart/SmithChart';
import { Disclosure } from '../components/Disclosure';
import { NumberField } from '../components/NumberField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ExamplePicker } from '../features/examples/ExamplePicker';
import { ExportSvgButton } from '../features/exporting/ExportSvgButton';
import { PrintButton } from '../features/exporting/PrintButton';
import { SolutionResults } from '../features/results/SolutionResults';
import { ShareButton } from '../features/sharing/ShareButton';
import { FirstUseGuide } from '../features/tutorial/FirstUseGuide';
import { LearnPanel } from '../features/tutorial/LearnPanel';
import {
  admittanceToImpedance,
  complex,
  hertz,
  impedanceToAdmittance,
  impedanceToReflection,
  normalizeImpedance,
  ohms,
  reflectionToImpedance,
  solveShuntStub,
} from '../rf';
import type { Complex, Load } from '../rf';
import { loadPreferences, savePreferences } from '../persistence/preferences';
import { serializeUrlState } from '../persistence/urlState';
import { historyReducer } from './workspaceHistory';
import type { ExamplePreset, LoadRepresentation, WorkspaceState } from './workspaceTypes';

interface Props {
  readonly initialState: WorkspaceState;
  readonly urlWarnings: readonly string[];
}

function loadToReflection(load: Load, z0: number): Complex {
  return load.kind === 'open'
    ? complex(1, 0)
    : impedanceToReflection(normalizeImpedance(load.impedanceOhms, ohms(z0)));
}

function reflectionToLoad(reflection: Complex, z0: number): Load {
  if (Math.hypot(reflection.re - 1, reflection.im) < 1e-10) return { kind: 'open' };
  const z = reflectionToImpedance(reflection);
  return { kind: 'finite', impedanceOhms: complex(z.re * z0, z.im * z0) };
}

function snapReflection(reflection: Complex): Complex {
  const step = 0.02;
  const snapped = complex(
    Math.round(reflection.re / step) * step,
    Math.round(reflection.im / step) * step,
  );
  const length = Math.hypot(snapped.re, snapped.im);
  return length > 1 ? complex(snapped.re / length, snapped.im / length) : snapped;
}

export function Workspace({ initialState, urlWarnings }: Props) {
  const preferences = useMemo(() => loadPreferences(), []);
  const start = {
    ...initialState,
    ...preferences,
    load: initialState.load,
    selectedSolution: initialState.selectedSolution,
  };
  const [history, dispatch] = useReducer(historyReducer, { past: [], present: start, future: [] });
  const state = history.present;
  const activeLoad = state.previewLoad ?? state.load;
  const reflection = loadToReflection(activeLoad, state.characteristicImpedanceOhms);
  const result = solveShuntStub({
    load: activeLoad,
    characteristicImpedanceOhms: ohms(state.characteristicImpedanceOhms),
    frequencyHz: hertz(state.frequencyHz),
    velocityFactor: state.velocityFactor,
    termination: state.termination,
  });
  const [updateApp, setUpdateApp] = useState<null | (() => Promise<void>)>(null);

  useEffect(() => {
    const search = serializeUrlState(state);
    globalThis.history.replaceState(null, '', `${location.pathname}${search}${location.hash}`);
    savePreferences(state);
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  useEffect(() => {
    void import('../persistence/serviceWorkerRegistration').then(({ registerServiceWorker }) =>
      registerServiceWorker(setUpdateApp),
    );
  }, []);

  const commitImpedance = (part: 're' | 'im', value: number) => {
    const current =
      state.load.kind === 'finite'
        ? state.load.impedanceOhms
        : complex(state.characteristicImpedanceOhms, 0);
    dispatch({
      type: 'set-load',
      load: { kind: 'finite', impedanceOhms: { ...current, [part]: value } },
    });
  };
  const updateRepresentation = (first: number, second: number) => {
    let impedance: Complex;
    if (state.loadRepresentation === 'admittance')
      impedance = admittanceToImpedance(complex(first, second));
    else if (state.loadRepresentation === 'reflection') {
      const angle = (second * Math.PI) / 180;
      const normalized = reflectionToImpedance(
        complex(first * Math.cos(angle), first * Math.sin(angle)),
      );
      impedance = complex(
        normalized.re * state.characteristicImpedanceOhms,
        normalized.im * state.characteristicImpedanceOhms,
      );
    } else impedance = complex(first, second);
    dispatch({ type: 'set-load', load: { kind: 'finite', impedanceOhms: impedance } });
  };
  const finite =
    activeLoad.kind === 'finite' ? activeLoad.impedanceOhms : complex(Number.POSITIVE_INFINITY, 0);
  const admittance = activeLoad.kind === 'finite' ? impedanceToAdmittance(finite) : complex(0, 0);
  const representationValues =
    state.loadRepresentation === 'impedance'
      ? [finite.re, finite.im]
      : state.loadRepresentation === 'admittance'
        ? [admittance.re, admittance.im]
        : [
            Math.hypot(reflection.re, reflection.im),
            (Math.atan2(reflection.im, reflection.re) * 180) / Math.PI,
          ];
  const representationLabels =
    state.loadRepresentation === 'impedance'
      ? ['Resistance', 'Reactance', 'Ω']
      : state.loadRepresentation === 'admittance'
        ? ['Conductance', 'Susceptance', 'S']
        : ['Magnitude', 'Phase', '°'];
  const applyExample = (example: ExamplePreset) =>
    dispatch({
      type: 'replace',
      value: {
        ...state,
        load: example.load,
        characteristicImpedanceOhms: example.z0,
        frequencyHz: example.frequencyHz,
        velocityFactor: example.velocityFactor,
        termination: example.termination,
        selectedSolution: 'A',
        previewLoad: null,
      },
    });

  return (
    <>
      <header className="instrument-bar">
        <div>
          <span className="eyebrow">RF matching instrument</span>
          <h1>Smith Match</h1>
        </div>
        <nav aria-label="Workspace actions">
          <button
            type="button"
            disabled={!history.past.length}
            onClick={() => dispatch({ type: 'undo' })}
          >
            <Undo2 size={16} aria-hidden="true" /> Undo
          </button>
          <button
            type="button"
            disabled={!history.future.length}
            onClick={() => dispatch({ type: 'redo' })}
          >
            <Redo2 size={16} aria-hidden="true" /> Redo
          </button>
          <ExamplePicker onSelect={applyExample} />
          <ExportSvgButton />
          <PrintButton />
          <ShareButton url={`${location.origin}${location.pathname}${serializeUrlState(state)}`} />
        </nav>
      </header>
      {urlWarnings.length > 0 && (
        <div className="url-warning" role="status">
          {urlWarnings.join(' ')}
        </div>
      )}
      {updateApp && (
        <div className="update-banner" role="status">
          Update ready. Current inputs remain in URL.{' '}
          <button type="button" onClick={() => void updateApp()}>
            Update now
          </button>
        </div>
      )}
      <FirstUseGuide />
      <main className={`workspace ${state.animationEnabled ? 'motion-enabled' : ''}`}>
        <section className="chart-panel">
          <SmithChart
            loadReflection={reflection}
            solutions={result.status === 'solved' ? result.solutions : undefined}
            selectedSolution={state.selectedSolution}
            displayMode={state.displayMode}
            onLoadPreview={(value) =>
              dispatch({
                type: 'preview-load',
                load: reflectionToLoad(
                  state.gridSnapping ? snapReflection(value) : value,
                  state.characteristicImpedanceOhms,
                ),
              })
            }
            onLoadCommit={(value) =>
              dispatch({
                type: 'set-load',
                load: reflectionToLoad(
                  state.gridSnapping ? snapReflection(value) : value,
                  state.characteristicImpedanceOhms,
                ),
              })
            }
            onLoadCancel={() => dispatch({ type: 'cancel-preview' })}
          />
          <ChartDescription
            load={
              activeLoad.kind === 'finite'
                ? activeLoad.impedanceOhms
                : complex(Number.POSITIVE_INFINITY, 0)
            }
            result={result}
          />
          <SegmentedControl
            label="Chart grid"
            value={state.displayMode}
            options={[
              { value: 'impedance', label: 'Z' },
              { value: 'admittance', label: 'Y' },
              { value: 'both', label: 'Both' },
            ]}
            onChange={(value) => dispatch({ type: 'set-display', value })}
          />
        </section>
        <aside className="controls-panel">
          <section>
            <h2>Load</h2>
            <SegmentedControl
              label="Entry representation"
              value={state.loadRepresentation}
              options={[
                { value: 'impedance', label: 'Z' },
                { value: 'admittance', label: 'Y' },
                { value: 'reflection', label: 'Γ' },
              ]}
              onChange={(value: LoadRepresentation) =>
                dispatch({ type: 'set-representation', value })
              }
            />
            {activeLoad.kind === 'open' ? (
              <div className="open-load">
                <strong>Exact open circuit</strong>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'set-load',
                      load: { kind: 'finite', impedanceOhms: complex(50, 0) },
                    })
                  }
                >
                  Enter finite load
                </button>
              </div>
            ) : (
              <>
                <NumberField
                  label={representationLabels[0]!}
                  value={representationValues[0]!}
                  unit={state.loadRepresentation === 'reflection' ? '' : representationLabels[2]}
                  onCommit={(value) =>
                    state.loadRepresentation === 'impedance'
                      ? commitImpedance('re', value)
                      : updateRepresentation(value, representationValues[1]!)
                  }
                />
                <NumberField
                  label={representationLabels[1]!}
                  value={representationValues[1]!}
                  unit={state.loadRepresentation === 'reflection' ? '°' : representationLabels[2]}
                  onCommit={(value) =>
                    state.loadRepresentation === 'impedance'
                      ? commitImpedance('im', value)
                      : updateRepresentation(representationValues[0]!, value)
                  }
                />
              </>
            )}
            <button
              type="button"
              className="text-button"
              onClick={() => dispatch({ type: 'set-load', load: { kind: 'open' } })}
            >
              Set exact open
            </button>
          </section>
          <section>
            <h2>Transmission line</h2>
            <NumberField
              label="Characteristic impedance"
              value={state.characteristicImpedanceOhms}
              unit="Ω"
              isAllowed={(value) => value > 0}
              errorMessage="Enter an impedance greater than zero."
              onCommit={(value) => dispatch({ type: 'set-z0', value })}
            />
            <NumberField
              label="Frequency"
              value={state.frequencyHz / 1e6}
              unit="MHz"
              isAllowed={(value) => value > 0}
              errorMessage="Enter a frequency greater than zero."
              onCommit={(value) => dispatch({ type: 'set-frequency', value: value * 1e6 })}
            />
            <NumberField
              label="Velocity factor"
              value={state.velocityFactor}
              isAllowed={(value) => value > 0 && value <= 1}
              errorMessage="Enter a velocity factor above zero and no more than one."
              onCommit={(value) => dispatch({ type: 'set-vf', value })}
            />
          </section>
          <section>
            <h2>Stub</h2>
            <SegmentedControl
              label="Termination"
              value={state.termination}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'short', label: 'Short' },
              ]}
              onChange={(value) => dispatch({ type: 'set-termination', value })}
            />
          </section>
          <Disclosure title="Display and interaction">
            <label>
              Theme{' '}
              <select
                value={state.theme}
                onChange={(event) =>
                  dispatch({
                    type: 'set-theme',
                    value: event.target.value as WorkspaceState['theme'],
                  })
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.animationEnabled}
                onChange={() => dispatch({ type: 'toggle-animation' })}
              />{' '}
              Animate matching sequence
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.gridSnapping}
                onChange={() => dispatch({ type: 'toggle-snap' })}
              />{' '}
              Grid snapping
            </label>
          </Disclosure>
        </aside>
        <section className="results-panel">
          <SolutionResults
            result={result}
            termination={state.termination}
            selected={state.selectedSolution}
            onSelect={(value) => dispatch({ type: 'select-solution', value })}
          />
          <aside className="practical-warning">
            <strong>Trim at the bench.</strong> Connector length, exposed conductor, dielectric
            variation, nearby objects, coupling, feed-line loss, construction, and calibration alter
            physical length.
          </aside>
        </section>
      </main>
      <LearnPanel />
      <footer>Smith Match v{__APP_VERSION__} · Lossless single-frequency model · MIT</footer>
    </>
  );
}
