import type { StubMatchResult, StubTermination } from '../../rf';
import type { LengthUnit } from '../../app/workspaceTypes';
import { ResultCard } from '../../components/ResultCard';
import { Disclosure } from '../../components/Disclosure';
import { ConstructionInstructions } from './ConstructionInstructions';
import { ResultDetails } from './ResultDetails';
export function SolutionResults({
  result,
  termination,
  selected,
  lengthUnit,
  onSelect,
}: {
  readonly result: StubMatchResult;
  readonly termination: StubTermination;
  readonly selected: 'A' | 'B';
  readonly lengthUnit: LengthUnit;
  readonly onSelect: (id: 'A' | 'B') => void;
}) {
  if (result.status === 'matched')
    return (
      <section className="status-panel">
        <h2>Already matched</h2>
        <p>No matching stub is required.</p>
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
      </section>
    );
  return (
    <section className="solutions" aria-live="polite">
      {result.solutions.map((solution) => (
        <ResultCard
          key={solution.id}
          title={`Solution ${solution.id}`}
          selected={selected === solution.id}
          onSelect={() => onSelect(solution.id)}
        >
          <ConstructionInstructions
            solution={solution}
            termination={termination}
            lengthUnit={lengthUnit}
          />
          <Disclosure title="Detailed RF quantities">
            <ResultDetails solution={solution} />
          </Disclosure>
        </ResultCard>
      ))}
    </section>
  );
}
