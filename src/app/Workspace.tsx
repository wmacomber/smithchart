import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Redo2, Undo2 } from 'lucide-react';
import { ChartDescription } from '../chart/ChartDescription';
import { SmithChart } from '../chart/SmithChart';
import { Disclosure } from '../components/Disclosure';
import { SegmentedControl } from '../components/SegmentedControl';
import { ExamplePicker } from '../features/examples/ExamplePicker';
import { ANTENNA_EXAMPLE, EXAMPLES } from '../features/examples/examples';
import { ExportSvgButton } from '../features/exporting/ExportSvgButton';
import { PrintButton } from '../features/exporting/PrintButton';
import { PrintWorksheetSummary } from '../features/exporting/PrintWorksheetSummary';
import type { ChartExportMetadata } from '../features/exporting/serializeChart';
import { LoadInputPanel } from '../features/load-input/LoadInputPanel';
import { TransmissionLineInputs } from '../features/line-input/TransmissionLineInputs';
import { StubControls } from '../features/matching/StubControls';
import { SolutionComparison } from '../features/matching/SolutionComparison';
import { SolutionResults } from '../features/results/SolutionResults';
import { matchingResultText } from '../features/results/matchingResultText';
import { ShareButton } from '../features/sharing/ShareButton';
import { FirstUseGuide } from '../features/tutorial/FirstUseGuide';
import { LearnPanel } from '../features/tutorial/LearnPanel';
import { EDUCATION_TARGET_LABELS, type LearnTopic } from '../features/tutorial/topics';
import { hertz, ohms, solveShuntStub } from '../rf';
import { complex } from '../rf';
import { loadPreferences, savePreferences } from '../persistence/preferences';
import { serializeUrlState } from '../persistence/urlState';
import { historyReducer, type HistoryAction } from './workspaceHistory';
import { formatLoadMarkerReadout, loadToReflection, reflectionToLoad } from './loadMapping';
import type { ExamplePreset, WorkspaceHistory, WorkspaceState } from './workspaceTypes';

interface Props {
  readonly initialState: WorkspaceState;
  readonly urlWarnings: readonly string[];
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

function useMobileLayout(): boolean {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 800px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 800px)');
    const update = () => {
      const focusKey =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.dataset.focusKey
          : undefined;
      setMobile(query.matches);
      if (focusKey) {
        requestAnimationFrame(() => {
          document
            .querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusKey)}"]`)
            ?.focus({ preventScroll: true });
        });
      }
    };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function Workspace({ initialState, urlWarnings }: Props) {
  const [history, dispatch] = useReducer(historyReducer, initialState, initializeHistory);
  const state = history.present;
  const calculation = state.calculation;
  const preferences = state.preferences;
  const activeLoad = state.previewLoad ?? calculation.load;
  const reflection = loadToReflection(activeLoad, calculation.characteristicImpedanceOhms);
  const loadReadout = formatLoadMarkerReadout(activeLoad, reflection);
  const result = solveShuntStub({
    load: activeLoad,
    characteristicImpedanceOhms: ohms(calculation.characteristicImpedanceOhms),
    frequencyHz: hertz(calculation.frequencyHz),
    velocityFactor: calculation.velocityFactor,
    termination: calculation.termination,
  });
  const [updateApp, setUpdateApp] = useState<null | (() => Promise<void>)>(null);
  const [learnOpen, setLearnOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [tourToken, setTourToken] = useState(0);
  const [educationTopic, setEducationTopic] = useState<LearnTopic | null>(null);
  const [draftIssues, setDraftIssues] = useState<ReadonlySet<string>>(() => new Set());
  const [accessibilityAnnouncement, setAccessibilityAnnouncement] = useState('');
  const previousStale = useRef(false);
  const stale = draftIssues.size > 0;
  const mobileLayout = useMobileLayout();
  const exportMetadata: ChartExportMetadata = {
    schemaVersion: 1,
    application: { name: 'Smith Match', version: __APP_VERSION__ },
    model: {
      kind: 'lossless-single-frequency-shunt-stub',
      termination: calculation.termination,
    },
    calculation: {
      load: calculation.load,
      characteristicImpedanceOhms: calculation.characteristicImpedanceOhms,
      frequencyHz: calculation.frequencyHz,
      velocityFactor: calculation.velocityFactor,
    },
    chart: {
      displayMode: preferences.displayMode,
      solutionView: preferences.solutionView,
    },
    result: {
      status: result.status,
      selectedSolution: calculation.selectedSolution,
      instructions:
        result.status === 'solved'
          ? result.solutions.map(
              (solution) =>
                matchingResultText(
                  solution,
                  calculation.termination,
                  preferences.lengthUnit,
                  calculation,
                ).complete,
            )
          : [],
    },
  };

  const reportDraftValidity = useCallback(
    (fieldId: string, invalid: boolean) => {
      setDraftIssues((current) => {
        const next = new Set(current);
        if (invalid) next.add(fieldId);
        else next.delete(fieldId);
        if (next.size === current.size && [...next].every((item) => current.has(item)))
          return current;
        return next;
      });
    },
    [setDraftIssues],
  );

  const act = useCallback(
    (action: HistoryAction) => {
      setEducationTopic(null);
      dispatch(action);
    },
    [dispatch, setEducationTopic],
  );

  const applyExample = useCallback(
    (example: ExamplePreset) => {
      act({ type: 'apply-example', example });
      setExamplesOpen(false);
      setAccessibilityAnnouncement(`${example.name} loaded. ${example.learningGoal}`);
    },
    [act, setAccessibilityAnnouncement, setExamplesOpen],
  );

  const showTopic = useCallback(
    (topic: LearnTopic) => {
      setLearnOpen(false);
      setEducationTopic(topic);
      setAccessibilityAnnouncement(
        `Showing ${EDUCATION_TARGET_LABELS[topic.chartTarget]} on the chart.`,
      );
      requestAnimationFrame(() => {
        const chart = document.querySelector<HTMLElement>('[data-education-chart]');
        chart?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'center',
        });
        chart?.focus({ preventScroll: true });
      });
    },
    [setAccessibilityAnnouncement, setEducationTopic, setLearnOpen],
  );

  useEffect(() => {
    if (previousStale.current === stale) return;
    previousStale.current = stale;
    setAccessibilityAnnouncement(
      stale
        ? 'Showing last valid calculation. Correct the invalid input to enable construction actions.'
        : 'Input corrected. Construction actions are available.',
    );
  }, [stale]);

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

  const controlsPanel = (
    <aside className="controls-panel" key="controls-panel">
      <LoadInputPanel
        load={activeLoad}
        characteristicImpedanceOhms={calculation.characteristicImpedanceOhms}
        representation={preferences.loadRepresentation}
        onRepresentationChange={(value) => act({ type: 'set-load-representation', value })}
        onLoadCommit={(load) => {
          act({ type: 'commit-load', load });
          setAccessibilityAnnouncement('Load updated. Calculation results refreshed.');
        }}
        onDraftValidityChange={reportDraftValidity}
      />
      <TransmissionLineInputs
        characteristicImpedanceOhms={calculation.characteristicImpedanceOhms}
        frequencyHz={calculation.frequencyHz}
        velocityFactor={calculation.velocityFactor}
        frequencyUnit={preferences.frequencyUnit}
        lengthUnit={preferences.lengthUnit}
        onCharacteristicImpedanceCommit={(value) => {
          act({ type: 'commit-characteristic-impedance', value });
          setAccessibilityAnnouncement('Characteristic impedance updated.');
        }}
        onFrequencyCommit={(value) => {
          act({ type: 'commit-frequency', value });
          setAccessibilityAnnouncement('Frequency updated.');
        }}
        onVelocityFactorCommit={(value) => {
          act({ type: 'commit-velocity-factor', value });
          setAccessibilityAnnouncement('Velocity factor updated.');
        }}
        onFrequencyUnitChange={(value) => {
          act({ type: 'set-frequency-unit', value });
          setAccessibilityAnnouncement(`Frequency unit changed to ${value}.`);
        }}
        onLengthUnitChange={(value) => {
          act({ type: 'set-length-unit', value });
          setAccessibilityAnnouncement(`Length unit changed to ${value}.`);
        }}
        onDraftValidityChange={reportDraftValidity}
      />
      <StubControls
        termination={calculation.termination}
        onChange={(value) => {
          act({ type: 'set-termination', value });
          setAccessibilityAnnouncement(`${value} stub termination selected.`);
        }}
      />
      <Disclosure title="Display and interaction">
        <label>
          Theme{' '}
          <select
            value={preferences.theme}
            onChange={(event) =>
              act({
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
              act({ type: 'set-animation-enabled', value: event.target.checked })
            }
          />{' '}
          Animate matching sequence
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.gridSnapping}
            onChange={(event) => act({ type: 'set-grid-snapping', value: event.target.checked })}
          />{' '}
          Snap pointer to 0.02 Γ grid
        </label>
      </Disclosure>
    </aside>
  );

  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to matching workspace
      </a>
      <header className="instrument-bar">
        <div>
          <span className="eyebrow">RF matching instrument</span>
          <h1>Smith Match</h1>
        </div>
        <nav aria-label="Workspace actions">
          <div className="action-group history-actions" aria-label="History">
            <button
              type="button"
              disabled={!history.past.length}
              onClick={() => {
                act({ type: 'undo' });
                setAccessibilityAnnouncement('Previous committed calculation restored.');
              }}
            >
              <Undo2 size={16} aria-hidden="true" /> Undo
            </button>
            <button
              type="button"
              disabled={!history.future.length}
              onClick={() => {
                act({ type: 'redo' });
                setAccessibilityAnnouncement('Next committed calculation restored.');
              }}
            >
              <Redo2 size={16} aria-hidden="true" /> Redo
            </button>
          </div>
          <div className="action-group education-actions" aria-label="Education">
            <button type="button" onClick={() => setExamplesOpen(true)}>
              Examples
            </button>
            <button type="button" onClick={() => setLearnOpen(true)}>
              Learn
            </button>
          </div>
          <div className="action-group desktop-output-actions" aria-label="Output">
            <ExportSvgButton metadata={exportMetadata} disabled={stale} />
            <PrintButton />
            <ShareButton
              disabled={stale}
              url={`${location.origin}${location.pathname}${serializeUrlState(calculation)}`}
            />
          </div>
          <details className="more-actions mobile-output-actions">
            <summary>More actions</summary>
            <div>
              <ExportSvgButton metadata={exportMetadata} disabled={stale} />
              <PrintButton />
              <ShareButton
                disabled={stale}
                url={`${location.origin}${location.pathname}${serializeUrlState(calculation)}`}
              />
            </div>
          </details>
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
      <FirstUseGuide
        key={tourToken}
        visible={!preferences.firstUseDismissed}
        restartToken={tourToken}
        startTour={tourToken > 0}
        onDismiss={() => act({ type: 'set-first-use-dismissed', value: true })}
        onLoadExample={() => applyExample(ANTENNA_EXAMPLE)}
      />
      <span className="sr-only" aria-live="polite" aria-atomic="true" data-app-status>
        {accessibilityAnnouncement}
      </span>
      <main
        id="workspace"
        tabIndex={-1}
        className={`workspace ${preferences.animationEnabled ? 'motion-enabled' : ''} ${state.previewLoad ? 'preview-active' : ''}`}
      >
        <PrintWorksheetSummary
          calculation={calculation}
          result={result}
          stale={stale}
          version={__APP_VERSION__}
        />
        {!mobileLayout && controlsPanel}
        <section className="chart-panel">
          <SmithChart
            loadReflection={reflection}
            solutions={result.status === 'solved' ? result.solutions : undefined}
            selectedSolution={calculation.selectedSolution}
            solutionView={preferences.solutionView}
            termination={calculation.termination}
            lengthUnit={preferences.lengthUnit}
            matchStatus={result.status}
            displayMode={preferences.displayMode}
            snapLoadPointer={preferences.gridSnapping}
            loadReadout={loadReadout}
            onLoadPreview={(value) =>
              act({
                type: 'preview-load',
                load: reflectionToLoad(value, calculation.characteristicImpedanceOhms),
              })
            }
            onLoadCommit={(value) => {
              act({
                type: 'commit-load',
                load: reflectionToLoad(value, calculation.characteristicImpedanceOhms),
              });
              setAccessibilityAnnouncement('Load marker adjustment committed.');
            }}
            onLoadCancel={() => act({ type: 'cancel-preview' })}
            educationTarget={educationTopic?.chartTarget}
            onEducationDismiss={() => setEducationTopic(null)}
          />
          <ChartDescription
            load={
              activeLoad.kind === 'finite'
                ? activeLoad.impedanceOhms
                : complex(Number.POSITIVE_INFINITY, 0)
            }
            result={result}
            characteristicImpedanceOhms={calculation.characteristicImpedanceOhms}
            reflection={reflection}
            selectedSolution={calculation.selectedSolution}
            solutionView={preferences.solutionView}
            termination={calculation.termination}
            lengthUnit={preferences.lengthUnit}
          />
          <SegmentedControl
            label="Chart grid"
            value={preferences.displayMode}
            options={[
              { value: 'impedance', label: 'Z', accessibleLabel: 'Impedance grid' },
              { value: 'admittance', label: 'Y', accessibleLabel: 'Admittance grid' },
              { value: 'both', label: 'Both' },
            ]}
            onChange={(value) => {
              act({ type: 'set-display-mode', value });
              setAccessibilityAnnouncement(`Chart grid changed to ${value}.`);
            }}
          />
          {result.status === 'solved' && (
            <SolutionComparison
              solutions={result.solutions}
              selected={calculation.selectedSolution}
              view={preferences.solutionView}
              lengthUnit={preferences.lengthUnit}
              onSelect={(value) => {
                act({ type: 'select-solution', value });
                setAccessibilityAnnouncement(`Solution ${value} selected.`);
              }}
              onViewChange={(value) => {
                act({ type: 'set-solution-view', value });
                setAccessibilityAnnouncement(
                  value === 'overlay'
                    ? 'Both matching paths shown on chart.'
                    : `Only solution ${calculation.selectedSolution} path shown on chart.`,
                );
              }}
            />
          )}
        </section>
        {mobileLayout && result.status !== 'solved' && controlsPanel}
        <section className="results-panel">
          <SolutionResults
            result={result}
            termination={calculation.termination}
            selected={calculation.selectedSolution}
            lengthUnit={preferences.lengthUnit}
            calculation={calculation}
            stale={stale}
            interposedControls={
              mobileLayout && result.status === 'solved' ? controlsPanel : undefined
            }
            onSelect={(value) => {
              act({ type: 'select-solution', value });
              setAccessibilityAnnouncement(`Solution ${value} selected.`);
            }}
            onLoadMismatch={() =>
              applyExample(EXAMPLES.find((example) => example.id === 'resistive')!)
            }
          />
          {result.status === 'solved' && (
            <aside className="practical-warning">
              <strong>Calculated lengths are starting values.</strong> Connector and
              exposed-conductor length, open-end and short-connection effects, dielectric tolerance,
              coupling, nearby objects, feed-line loss, and calibration alter the installed match.
              Cut conservatively, measure, and trim incrementally. One configured velocity factor
              applies to both feed line and stub; convert separately when their cables differ.
            </aside>
          )}
        </section>
      </main>
      <LearnPanel
        open={learnOpen}
        onClose={() => setLearnOpen(false)}
        onShowTopic={showTopic}
        onRestartTour={() => {
          setTourToken((value) => value + 1);
          act({ type: 'set-first-use-dismissed', value: false });
        }}
      />
      <ExamplePicker
        open={examplesOpen}
        onClose={() => setExamplesOpen(false)}
        onSelect={applyExample}
      />
      <footer>Smith Match v{__APP_VERSION__} · Lossless single-frequency model · MIT</footer>
    </>
  );
}
