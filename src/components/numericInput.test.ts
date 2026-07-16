import { describe, expect, it } from 'vitest';
import { parseNumericInput, resetNumericInput } from './numericInput';

describe('numeric input state', () => {
  it.each(['', '   '])('classifies %j as empty', (raw) => {
    expect(parseNumericInput(raw, 4).issue).toBe('empty');
  });

  it.each(['-', '+', '.', '-.', '1e', '1e+', '1E-'])('classifies %j as incomplete', (raw) => {
    expect(parseNumericInput(raw, 4).issue).toBe('incomplete');
  });

  it.each(['NaN', 'Infinity', '1,000', '0x10', '2MHz', '1 2'])('rejects %j', (raw) => {
    expect(parseNumericInput(raw, 4).issue).toBe('invalid-number');
  });

  it.each([
    ['-22', -22],
    ['.5', 0.5],
    ['5.', 5],
    ['1e6', 1e6],
    [' -1.2e-3 ', -0.0012],
  ])('parses %j', (raw, expected) => {
    expect(parseNumericInput(raw as string, 4)).toMatchObject({
      parsed: expected,
      issue: null,
      dirty: true,
      committed: 4,
    });
  });

  it('separates range errors and normalizes reset negative zero', () => {
    expect(parseNumericInput('-1', 4, (value) => value > 0).issue).toBe('out-of-range');
    expect(resetNumericInput(-0)).toEqual({
      raw: '0',
      parsed: -0,
      committed: -0,
      issue: null,
      dirty: false,
    });
  });
});
