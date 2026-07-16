import { useState } from 'react';
import type { StubMatchSolution } from '../../rf';
import { HelpTip } from '../../components/Tooltip';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResultDetails } from './ResultDetails';

export function AdvancedResultsPanel({
  solutions,
  selected,
}: {
  readonly solutions: readonly [StubMatchSolution, StubMatchSolution];
  readonly selected: 'A' | 'B';
}) {
  const [tab, setTab] = useState(selected);
  const solution = solutions.find((item) => item.id === tab)!;
  return (
    <details className="advanced-results">
      <summary>Advanced RF details</summary>
      <div className="advanced-heading">
        <SegmentedControl
          label="Advanced details solution"
          value={tab}
          options={[
            { value: 'A', label: 'Solution A' },
            { value: 'B', label: 'Solution B' },
          ]}
          onChange={setTab}
        />
        <HelpTip
          label="residual reflection coefficient"
          text="Final |Γ| verifies the ideal numerical match. It does not include construction tolerances or loss."
        />
      </div>
      <ResultDetails solution={solution} />
    </details>
  );
}
