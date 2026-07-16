import { useEffect, useReducer, useState } from 'react';
import { Redo2, Undo2 } from 'lucide-react';
import { ChartDescription } from '../chart/ChartDescription';
import { SmithChart } from '../chart/SmithChart';
import { Disclosure } from '../components/Disclosure';
import { SegmentedControl } from '../components/SegmentedControl';
import { ExamplePicker } from '../features/examples/ExamplePicker';
import { ExportSvgButton } from '../features/exporting/ExportSvgButton';
import { PrintButton } from '../features/exporting/PrintButton';
import { LoadInputPanel } from '../features/load-input/LoadInputPanel';
import { TransmissionLineInputs } from '../features/line-input/TransmissionLineInputs';
import { StubControls } from '../features/matching/StubControls';
import { SolutionResults } from '../features/results/SolutionResults';
import { ShareButton } from '../features/sharing/ShareButton';
import { FirstUseGuide } from '../features/tutorial/FirstUseGuide';
import { LearnPanel } from '../features/tutorial/LearnPanel';
import {
  complex,
  hertz,
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
import type { WorkspaceHistory, WorkspaceState } from './workspaceTypes';

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

function initializeHistory(initialState: WorkspaceState): WorkspaceHistory {
  return {
    past: [],
    present: {
      ...initialState,
      preferences: { ...initialState.preferences, ...loadPreferences() },
      previewLoad: null,
    },
    future: [],
  };
}

export function Workspace({ initialState, urlWarnings }: Props) {
  const [history, dispatch] = useReducer(historyReducer, initialState, initializeHistory);
  const state = history.present;
  const calculation = state.calculation;
  const preferences = state.preferences;
  const activeLoad = state.previewLoad ?? calculation.load;
  const reflection = loadToReflection(activeLoad, calculation.characteristicImpedanceOhms);
  const result = solveShuntStub({
    load: activeLoad,
    characteristicImpedanceOhms: ohms(calculation.characteristicImpedanceOhms),
    frequencyHz: hertz(calculation.frequencyHz),
    velocityFactor: calculation.velocityFactor,
    termination: calculation.termination,
  });
  const [updateApp, setUpdateApp] = useState<null | (() => Promise<void>)>(null);

  useEffect(() => {
    const search = serializeUrlState(calculation);
    globalThis.history.replaceState(null, '', `${location.pathname}${search}${location.hash}`);
  }, [calculation]);

  useEffect(() => {
    savePreferences(preferences);
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences]);

  useEffect(() => {
    void import('../persistence/serviceWorkerRegistration').then(({ registerServiceWorker }) =>
      registerServiceWorker(setUpdateApp),
    );
  }, []);

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
          <ExamplePicker onSelect={(example) => dispatch({ type: 'apply-example', example })} />
          <ExportSvgButton />
          <PrintButton />
          <ShareButton
            url={`${location.origin}${location.pathname}${serializeUrlState(calculation)}`}
          />
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
      <main className={`workspace ${preferences.animationEnabled ? 'motion-enabled' : ''}`}>
        <section className="chart-panel">
          <SmithChart
            loadReflection={reflection}
            solutions={result.status === 'solved' ? result.solutions : undefined}
            selectedSolution={calculation.selectedSolution}
            displayMode={preferences.displayMode}
            onLoadPreview={(value) =>
              dispatch({
                type: 'preview-load',
                load: reflectionToLoad(
                  preferences.gridSnapping ? snapReflection(value) : value,
                  calculation.characteristicImpedanceOhms,
                ),
              })
            }
            onLoadCommit={(value) =>
              dispatch({
                type: 'commit-load',
                load: reflectionToLoad(
                  preferences.gridSnapping ? snapReflection(value) : value,
                  calculation.characteristicImpedanceOhms,
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
            value={preferences.displayMode}
            options={[
              { value: 'impedance', label: 'Z', accessibleLabel: 'Impedance grid' },
              { value: 'admittance', label: 'Y', accessibleLabel: 'Admittance grid' },
              { value: 'both', label: 'Both' },
            ]}
            onChange={(value) => dispatch({ type: 'set-display-mode', value })}
          />
        </section>
        <aside className="controls-panel">
          <LoadInputPanel
            load={calculation.load}
            characteristicImpedanceOhms={calculation.characteristicImpedanceOhms}
            representation={preferences.loadRepresentation}
            onRepresentationChange={(value) => dispatch({ type: 'set-load-representation', value })}
            onLoadCommit={(load) => dispatch({ type: 'commit-load', load })}
          />
          <TransmissionLineInputs
            characteristicImpedanceOhms={calculation.characteristicImpedanceOhms}
            frequencyHz={calculation.frequencyHz}
            velocityFactor={calculation.velocityFactor}
            frequencyUnit={preferences.frequencyUnit}
            lengthUnit={preferences.lengthUnit}
            onCharacteristicImpedanceCommit={(value) =>
              dispatch({ type: 'commit-characteristic-impedance', value })
            }
            onFrequencyCommit={(value) => dispatch({ type: 'commit-frequency', value })}
            onVelocityFactorCommit={(value) => dispatch({ type: 'commit-velocity-factor', value })}
            onFrequencyUnitChange={(value) => dispatch({ type: 'set-frequency-unit', value })}
            onLengthUnitChange={(value) => dispatch({ type: 'set-length-unit', value })}
          />
          <StubControls
            termination={calculation.termination}
            onChange={(value) => dispatch({ type: 'set-termination', value })}
          />
          <Disclosure title="Display and interaction">
            <label>
              Theme{' '}
              <select
                value={preferences.theme}
                onChange={(event) =>
                  dispatch({
                    type: 'set-theme',
                    value: event.target.value as typeof preferences.theme,
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
                checked={preferences.animationEnabled}
                onChange={(event) =>
                  dispatch({ type: 'set-animation-enabled', value: event.target.checked })
                }
              />{' '}
              Animate matching sequence
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.gridSnapping}
                onChange={(event) =>
                  dispatch({ type: 'set-grid-snapping', value: event.target.checked })
                }
              />{' '}
              Grid snapping
            </label>
          </Disclosure>
        </aside>
        <section className="results-panel">
          <SolutionResults
            result={result}
            termination={calculation.termination}
            selected={calculation.selectedSolution}
            lengthUnit={preferences.lengthUnit}
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
