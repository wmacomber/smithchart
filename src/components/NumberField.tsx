import { useEffect, useState } from 'react';

interface Props {
  readonly label: string;
  readonly value: number;
  readonly unit?: string;
  readonly onCommit: (value: number) => void;
  readonly isAllowed?: (value: number) => boolean;
  readonly errorMessage?: string;
}

export function NumberField({
  label,
  value,
  unit,
  onCommit,
  isAllowed = () => true,
  errorMessage = 'Enter a valid finite number.',
}: Props) {
  const [raw, setRaw] = useState(String(value));
  const parsed = raw.trim() === '' ? null : Number(raw);
  const valid = parsed !== null && Number.isFinite(parsed) && isAllowed(parsed);
  // External undo, URL restore, and chart manipulation must reset field text.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRaw(String(value)), [value]);
  const commit = () => {
    if (valid) onCommit(parsed);
    else setRaw(String(value));
  };
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <label className="number-field" htmlFor={id}>
      <span>{label}</span>
      <span className="field-control">
        <input
          id={id}
          value={raw}
          inputMode="decimal"
          aria-invalid={!valid}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setRaw(String(value));
          }}
        />
        {unit && <span aria-hidden="true">{unit}</span>}
      </span>
      {!valid && (
        <span className="field-error" role="alert">
          {errorMessage}
        </span>
      )}
    </label>
  );
}
