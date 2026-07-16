import { SegmentedControl } from '../../components/SegmentedControl';
import type { StubTermination } from '../../rf';
import { HelpTip } from '../../components/Tooltip';

export function StubControls({
  termination,
  onChange,
}: {
  readonly termination: StubTermination;
  readonly onChange: (value: StubTermination) => void;
}) {
  return (
    <section>
      <div className="section-heading">
        <h2>Stub</h2>
        <HelpTip
          label="stub termination"
          text="Open and short shunt stubs can supply the same required susceptance with different physical lengths."
        />
      </div>
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
