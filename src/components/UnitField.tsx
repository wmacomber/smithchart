import { useId } from 'react';
import { NumberField } from './NumberField';

export function UnitField<T extends string>({
  label,
  value,
  unit,
  units,
  onCommit,
  onUnitChange,
  isAllowed,
  errorMessage,
  helpText,
  fieldId,
  onDraftValidityChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly unit: T;
  readonly units: readonly T[];
  readonly onCommit: (value: number) => void;
  readonly onUnitChange: (unit: T) => void;
  readonly isAllowed?: (value: number) => boolean;
  readonly errorMessage?: string;
  readonly helpText?: string;
  readonly fieldId?: string;
  readonly onDraftValidityChange?: (fieldId: string, invalid: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="unit-field">
      <NumberField
        label={label}
        value={value}
        onCommit={onCommit}
        isAllowed={isAllowed}
        errorMessage={errorMessage}
        helpText={helpText}
        fieldId={fieldId}
        onDraftValidityChange={onDraftValidityChange}
      />
      <label className="unit-select" htmlFor={id}>
        <span>{label} unit</span>
        <select id={id} value={unit} onChange={(event) => onUnitChange(event.target.value as T)}>
          {units.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
