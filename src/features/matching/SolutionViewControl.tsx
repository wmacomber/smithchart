import type { SolutionView } from '../../app/workspaceTypes';
import { SegmentedControl } from '../../components/SegmentedControl';

export function SolutionViewControl({
  value,
  onChange,
}: {
  readonly value: SolutionView;
  readonly onChange: (value: SolutionView) => void;
}) {
  return (
    <SegmentedControl
      label="Matching paths"
      value={value}
      options={[
        { value: 'selected', label: 'Show selected' },
        { value: 'overlay', label: 'Compare both' },
      ]}
      onChange={onChange}
    />
  );
}
