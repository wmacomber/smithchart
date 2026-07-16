import type { LengthUnit, SolutionId, SolutionView } from '../../app/workspaceTypes';
import type { StubMatchSolution } from '../../rf';
import { HelpTip } from '../../components/Tooltip';
import { formatLength } from '../results/lengthFormatting';

export function SolutionComparison({
  solutions,
  selected,
  view,
  lengthUnit,
  onSelect,
  onViewChange,
}: {
  readonly solutions: readonly [StubMatchSolution, StubMatchSolution];
  readonly selected: SolutionId;
  readonly view: SolutionView;
  readonly lengthUnit: LengthUnit;
  readonly onSelect: (id: SolutionId) => void;
  readonly onViewChange: (view: SolutionView) => void;
}) {
  return (
    <section className="solution-comparison" aria-labelledby="solution-comparison-title">
      <header>
        <h2 id="solution-comparison-title">Compare both solutions</h2>
        <HelpTip
          label="toward generator"
          text="Measure feed-line distance from the load toward the transmitter or generator."
        />
      </header>
      <div className="comparison-options">
        {solutions.map((solution) => (
          <button
            key={solution.id}
            type="button"
            className={`comparison-option solution-${solution.id.toLowerCase()}`}
            aria-pressed={selected === solution.id}
            onClick={() => onSelect(solution.id)}
          >
            <strong>Solution {solution.id}</strong>
            <span>Feed {formatLength(solution.feedlineDistanceMeters, lengthUnit)}</span>
            <span>Stub {formatLength(solution.stubLengthMeters, lengthUnit)}</span>
          </button>
        ))}
      </div>
      <label className="compare-toggle">
        <input
          type="checkbox"
          checked={view === 'overlay'}
          onChange={(event) => onViewChange(event.target.checked ? 'overlay' : 'selected')}
        />
        Compare both paths on chart
      </label>
    </section>
  );
}
