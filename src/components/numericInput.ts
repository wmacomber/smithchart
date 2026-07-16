export type NumericInputIssue = 'empty' | 'incomplete' | 'invalid-number' | 'out-of-range' | null;

export interface NumericInputState {
  readonly raw: string;
  readonly parsed: number | null;
  readonly committed: number;
  readonly issue: NumericInputIssue;
  readonly dirty: boolean;
}

const COMPLETE_NUMBER = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;
const INCOMPLETE_NUMBER = /^(?:[+-]?|[+-]?\.|[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))[eE][+-]?)$/;

export function formatNumericValue(value: number): string {
  return String(Object.is(value, -0) ? 0 : value);
}

export function parseNumericInput(
  raw: string,
  committed: number,
  isAllowed: (value: number) => boolean = () => true,
): NumericInputState {
  const trimmed = raw.trim();
  if (trimmed === '') return { raw, parsed: null, committed, issue: 'empty', dirty: true };
  if (INCOMPLETE_NUMBER.test(trimmed))
    return { raw, parsed: null, committed, issue: 'incomplete', dirty: true };
  if (!COMPLETE_NUMBER.test(trimmed))
    return { raw, parsed: null, committed, issue: 'invalid-number', dirty: true };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed))
    return { raw, parsed: null, committed, issue: 'invalid-number', dirty: true };
  return {
    raw,
    parsed,
    committed,
    issue: isAllowed(parsed) ? null : 'out-of-range',
    dirty: true,
  };
}

export function resetNumericInput(value: number): NumericInputState {
  return {
    raw: formatNumericValue(value),
    parsed: value,
    committed: value,
    issue: null,
    dirty: false,
  };
}
