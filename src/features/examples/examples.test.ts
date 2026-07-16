import { describe, expect, it } from 'vitest';
import { hertz, ohms, solveShuntStub } from '../../rf';
import { EXAMPLES } from './examples';
import { parseUrlState, serializeUrlState } from '../../persistence/urlState';

const REQUIRED_IDS = [
  'matched',
  'resistive',
  'capacitive',
  'inductive',
  'near-open',
  'near-short',
  '75-ohm',
  'hf',
  'vhf',
];

describe('example presets', () => {
  it('provides the complete, unique, documented preset set', () => {
    expect(EXAMPLES.map((example) => example.id).sort()).toEqual([...REQUIRED_IDS].sort());
    expect(new Set(EXAMPLES.map((example) => example.id))).toHaveProperty('size', EXAMPLES.length);
    for (const example of EXAMPLES) {
      expect(example.description.length).toBeGreaterThan(10);
      expect(example.learningGoal.length).toBeGreaterThan(10);
      expect(example.calculation.characteristicImpedanceOhms).toBeGreaterThan(0);
      expect(example.calculation.frequencyHz).toBeGreaterThan(0);
      expect(example.calculation.velocityFactor).toBeGreaterThan(0);
      expect(example.calculation.velocityFactor).toBeLessThanOrEqual(1);
    }
  });

  it('matches expected solver states and returns two verified solutions otherwise', () => {
    for (const example of EXAMPLES) {
      const calculation = example.calculation;
      const result = solveShuntStub({
        load: calculation.load,
        characteristicImpedanceOhms: ohms(calculation.characteristicImpedanceOhms),
        frequencyHz: hertz(calculation.frequencyHz),
        velocityFactor: calculation.velocityFactor,
        termination: calculation.termination,
      });
      expect(result.status, example.id).toBe(example.expectedStatus);
      if (result.status !== 'solved') continue;
      expect(result.solutions).toHaveLength(2);
      expect(result.solutions[0].feedlineDistanceWavelengths).not.toBe(
        result.solutions[1].feedlineDistanceWavelengths,
      );
      for (const solution of result.solutions) {
        expect(solution.feedlineDistanceWavelengths).toBeGreaterThanOrEqual(0);
        expect(solution.feedlineDistanceWavelengths).toBeLessThan(0.5);
        expect(solution.stubLengthWavelengths).toBeGreaterThanOrEqual(0);
        expect(solution.stubLengthWavelengths).toBeLessThan(0.5);
        expect(solution.diagnostics.resultReflectionMagnitude).toBeLessThanOrEqual(1e-8);
      }
    }
  });

  it('covers both terminations and 50/75-ohm systems', () => {
    expect(new Set(EXAMPLES.map((example) => example.calculation.termination))).toEqual(
      new Set(['open', 'short']),
    );
    expect(
      new Set(EXAMPLES.map((example) => example.calculation.characteristicImpedanceOhms)),
    ).toEqual(new Set([50, 75]));
  });

  it('round-trips every preset through canonical URL state', () => {
    for (const example of EXAMPLES) {
      const calculation = { ...example.calculation, selectedSolution: 'A' as const };
      expect(parseUrlState(serializeUrlState(calculation)).state.calculation).toEqual(calculation);
    }
  });
});
