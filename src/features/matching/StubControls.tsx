import { SegmentedControl } from '../../components/SegmentedControl';
import type { StubTermination } from '../../rf';

export function StubControls({
  termination,
  onChange,
}: {
  readonly termination: StubTermination;
  readonly onChange: (value: StubTermination) => void;
}) {
  return (
    <section>
      <h2>Stub</h2>
      <SegmentedControl
        label="Termination"
        value={termination}
        options={[
          { value: 'open', label: 'Open' },
          { value: 'short', label: 'Short' },
        ]}
        onChange={onChange}
      />
    </section>
  );
}
