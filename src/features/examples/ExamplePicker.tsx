import type { ExamplePreset } from '../../app/workspaceTypes';
import { EXAMPLES } from './examples';

export function ExamplePicker({
  onSelect,
}: {
  readonly onSelect: (example: ExamplePreset) => void;
}) {
  return (
    <label className="example-picker">
      <span>Example</span>
      <select
        aria-label="Example preset"
        defaultValue=""
        onChange={(event) => {
          const value = EXAMPLES.find((item) => item.id === event.target.value);
          if (value) onSelect(value);
        }}
      >
        <option value="" disabled>
          Choose a preset…
        </option>
        {EXAMPLES.map((example) => (
          <option key={example.id} value={example.id}>
            {example.name}
          </option>
        ))}
      </select>
    </label>
  );
}
