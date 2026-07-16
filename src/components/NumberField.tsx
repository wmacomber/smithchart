import { useEffect, useId, useState } from 'react';
import { parseNumericInput, resetNumericInput, type NumericInputIssue } from './numericInput';

interface Props {
  readonly label: string;
  readonly value: number;
  readonly unit?: string;
  readonly onCommit: (value: number) => void;
  readonly isAllowed?: (value: number) => boolean;
  readonly errorMessage?: string;
  readonly className?: string;
}

const DEFAULT_MESSAGES: Record<Exclude<NumericInputIssue, null>, string> = {
  empty: 'Enter a number.',
  incomplete: 'Finish entering the number.',
  'invalid-number': 'Enter a valid finite number.',
  'out-of-range': 'Enter a value in the allowed range.',
};

export function NumberField({
  label,
  value,
  unit,
  onCommit,
  isAllowed = () => true,
  errorMessage,
  className,
}: Props) {
  const [draft, setDraft] = useState(() => resetNumericInput(value));
  const reactId = useId();
  const id = `number-field-${reactId.replace(/:/g, '')}`;
  const errorId = `${id}-error`;
  const unitId = `${id}-unit`;

  // Committed changes from undo, URL restore, examples, units, or representation reset drafts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(resetNumericInput(value)), [value]);

  const commit = () => {
    if (draft.issue === null && draft.parsed !== null) {
      setDraft(resetNumericInput(draft.parsed));
      onCommit(draft.parsed);
    }
  };
  const message = draft.issue
    ? draft.issue === 'out-of-range' && errorMessage
      ? errorMessage
      : DEFAULT_MESSAGES[draft.issue]
    : null;

  return (
    <label className={`number-field${className ? ` ${className}` : ''}`} htmlFor={id}>
      <span>{label}</span>
      <span className="field-control">
        <input
          id={id}
          type="text"
          value={draft.raw}
          inputMode="decimal"
          aria-invalid={message ? true : undefined}
          aria-errormessage={message ? errorId : undefined}
          aria-describedby={unit ? unitId : undefined}
          onChange={(event) =>
            setDraft(parseNumericInput(event.target.value, draft.committed, isAllowed))
          }
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(resetNumericInput(value));
            }
          }}
        />
        {unit && (
          <span id={unitId} className="field-unit">
            {unit}
          </span>
        )}
      </span>
      {message && (
        <span id={errorId} className="field-error" aria-live="polite">
          {message}
        </span>
      )}
    </label>
  );
}
