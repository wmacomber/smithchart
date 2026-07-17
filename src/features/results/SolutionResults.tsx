import { Fragment, type ReactNode } from 'react';
import type { CalculationState, LengthUnit } from '../../app/workspaceTypes';
import { ResultCard } from '../../components/ResultCard';
import { HelpTip } from '../../components/Tooltip';
import type { StubMatchResult, StubTermination } from '../../rf';
import { AdvancedResultsPanel } from './AdvancedResultsPanel';
import { ConstructionInstructions } from './ConstructionInstructions';

export function SolutionResults({
  result,
  termination,
  selected,
  lengthUnit,
  calculation,
  stale = false,
  onSelect,
  onLoadMismatch,
  interposedControls,
}: {
  readonly result: StubMatchResult;
  readonly termination: StubTermination;
  readonly selected: 'A' | 'B';
  readonly lengthUnit: LengthUnit;
  readonly calculation: CalculationState;
  readonly stale?: boolean;
  readonly onSelect: (id: 'A' | 'B') => void;
  readonly onLoadMismatch: () => void;
  readonly interposedControls?: ReactNode;
}) {
  if (result.status === 'matched')
    return (
      <section className="status-panel matched-status">
        <h2>Already matched</h2>
        <p>Feed-line move: 0. No matching stub is required.</p>
        <p>The load is at chart center, so adding a matching stub would create a mismatch.</p>
        <button type="button" onClick={onLoadMismatch}>
          Load a mismatch example
        </button>
      </section>
    );
  if (result.status === 'no-passive-solution')
    return (
      <section className="status-panel warning">
        <h2>No finite passive solution</h2>
        <p>
          {result.reason === 'active-load'
            ? 'Negative resistance indicates an active or unusual load outside this passive workflow.'
            : 'This lossless boundary load cannot be matched by a finite shunt susceptance.'}
        </p>
      </section>
    );
  if (result.status === 'invalid-input')
    return (
      <section className="status-panel error">
        <h2>Check inputs</h2>
        <ul>
          {result.issues.map((issue) => (
            <li key={`${issue.field}-${issue.code}`}>{issue.message}</li>
          ))}
        </ul>
      </section>
    );
  if (result.status === 'numerical-failure')
    return (
      <section className="status-panel error">
        <h2>Numerical verification failed</h2>
        <p>No construction lengths were returned.</p>
        <dl className="result-details">
          {Object.entries(result.diagnostics).map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{Number.isFinite(value) ? value.toExponential(6) : 'Unavailable'}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  const orderedSolutions = interposedControls
    ? [...result.solutions].sort((left, right) =>
        left.id === selected ? -1 : right.id === selected ? 1 : 0,
      )
    : result.solutions;
  return (
    <section className="solutions">
      {stale && (
        <p className="stale-calculation" role="status">
          Showing last valid calculation. Correct the highlighted input to enable construction
          actions.
        </p>
      )}
      {orderedSolutions.map((solution, index) => (
        <Fragment key={solution.id}>
          <ResultCard
            title={`Solution ${solution.id}`}
            solutionId={solution.id}
            selected={selected === solution.id}
            onSelect={() => onSelect(solution.id)}
          >
            <ConstructionInstructions
              solution={solution}
              termination={termination}
              lengthUnit={lengthUnit}
              selected={selected === solution.id}
              calculation={calculation}
              disabled={stale}
            />
            <p className="secondary-lengths">
              Electrical lengths{' '}
              <HelpTip
                label="wavelengths and degrees"
                text="λ is wavelength; 360 degrees equals one wavelength. These phase lengths do not change when display units change."
              />
              <br />
              Feed {solution.feedlineDistanceWavelengths.toFixed(5)} λ ·{' '}
              {solution.feedlineDistanceDegrees.toFixed(2)}°<br />
              Stub {solution.stubLengthWavelengths.toFixed(5)} λ ·{' '}
              {solution.stubElectricalDegrees.toFixed(2)}°
            </p>
            <p className="residual-summary">
              Final |Γ| {solution.diagnostics.resultReflectionMagnitude.toExponential(3)} ·{' '}
              {solution.diagnostics.resultReflectionMagnitude <= 1e-8
                ? 'Verified ≤ 1×10⁻⁸'
                : 'Verification limit exceeded'}{' '}
              <HelpTip
                label="final reflection magnitude"
                text="Final |Γ| is the ideal numerical residual. Construction tolerances and loss are not modeled."
              />
            </p>
          </ResultCard>
          {index === 0 && interposedControls}
        </Fragment>
      ))}
      <AdvancedResultsPanel key={selected} solutions={result.solutions} selected={selected} />
      <ol className="matching-steps">
        <li>Start at load and follow the constant-SWR circle toward generator.</li>
        <li>Stop at the selected g = 1 stub junction.</li>
        <li>Add cancelling shunt-stub susceptance.</li>
        <li>Verify the ideal result at chart center.</li>
      </ol>
    </section>
  );
}
