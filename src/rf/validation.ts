import { isFiniteComplex } from './complex';
import type { StubMatchInput } from './stubMatch';

export type ValidationCode = 'non-finite' | 'positive' | 'range';

export interface ValidationIssue {
  readonly field: 'load' | 'characteristicImpedance' | 'frequency' | 'velocityFactor';
  readonly code: ValidationCode;
  readonly message: string;
}

export const validateStubMatchInput = (input: StubMatchInput): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.load.kind === 'finite' && !isFiniteComplex(input.load.impedanceOhms)) {
    issues.push({ field: 'load', code: 'non-finite', message: 'Load values must be finite.' });
  }
  if (
    !Number.isFinite(input.characteristicImpedanceOhms) ||
    input.characteristicImpedanceOhms <= 0
  ) {
    issues.push({
      field: 'characteristicImpedance',
      code: 'positive',
      message: 'Characteristic impedance must be greater than zero.',
    });
  }
  if (!Number.isFinite(input.frequencyHz) || input.frequencyHz <= 0) {
    issues.push({
      field: 'frequency',
      code: 'positive',
      message: 'Frequency must be greater than zero.',
    });
  }
  if (
    !Number.isFinite(input.velocityFactor) ||
    input.velocityFactor <= 0 ||
    input.velocityFactor > 1
  ) {
    issues.push({
      field: 'velocityFactor',
      code: 'range',
      message: 'Velocity factor must be greater than zero and no more than one.',
    });
  }
  return issues;
};
