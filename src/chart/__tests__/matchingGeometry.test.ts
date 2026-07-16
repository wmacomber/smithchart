import { describe, expect, it } from 'vitest';
import referenceDocument from '../../../tests/reference-cases/cases.json';
import {
  chartPointToReflection,
  CHART_CENTER,
  CHART_RADIUS,
  reflectionToChartPoint,
} from '../chartGeometry';
import {
  matchingAnnotations,
  matchingSolutionGeometry,
  separateNearbyLabels,
} from '../matchingGeometry';
import {
  complex,
  hertz,
  impedanceToAdmittance,
  magnitude,
  normalizeImpedance,
  ohms,
  impedanceToReflection,
  reflectionToImpedance,
  solveShuntStub,
} from '../../rf';

const result = solveShuntStub({
  load: { kind: 'finite', impedanceOhms: complex(35, -22) },
  characteristicImpedanceOhms: ohms(50),
  frequencyHz: hertz(14.2e6),
  velocityFactor: 0.66,
  termination: 'short',
});

if (result.status !== 'solved') throw new Error('Expected solved geometry fixture.');
const loadReflection = impedanceToReflection(normalizeImpedance(complex(35, -22), ohms(50)));

describe('matching visualization geometry', () => {
  it('maps solver feed-line values to clockwise SWR arcs and junctions', () => {
    for (const solution of result.solutions) {
      const geometry = matchingSolutionGeometry(loadReflection, solution);
      expect(geometry.feedSweepRadians).toBeCloseTo(
        4 * Math.PI * solution.feedlineDistanceWavelengths,
        12,
      );
      expect(magnitude(geometry.junctionReflection)).toBeCloseTo(magnitude(loadReflection), 12);
      const expected = reflectionToChartPoint(geometry.junctionReflection);
      expect(geometry.junctionPoint).toEqual(expected);
      const y = impedanceToAdmittance(reflectionToImpedance(geometry.junctionReflection));
      expect(y.re).toBeCloseTo(1, 9);
    }
  });

  it('keeps stub samples on g=1 and ends at exact chart center', () => {
    for (const solution of result.solutions) {
      const geometry = matchingSolutionGeometry(loadReflection, solution);
      const first = chartPointToReflection(geometry.stubPoints[0]!);
      const firstY = impedanceToAdmittance(reflectionToImpedance(first));
      expect(firstY.im).toBeCloseTo(solution.junctionNormalizedAdmittance.im, 9);
      for (const point of geometry.stubPoints) {
        const y = impedanceToAdmittance(reflectionToImpedance(chartPointToReflection(point)));
        expect(y.re).toBeCloseTo(1, 9);
      }
      expect(geometry.stubPoints.at(-1)).toEqual({ x: CHART_CENTER, y: CHART_CENTER });
    }
  });

  it('formats solver-owned electrical and physical annotations', () => {
    const labels = matchingAnnotations(result.solutions, 'short', 'm');
    expect(labels[0]!.feed).toContain(result.solutions[0].feedlineDistanceDegrees.toFixed(2));
    expect(labels[1]!.stub).toContain(result.solutions[1].stubLengthWavelengths.toFixed(5));
    expect(labels[0]!.feed).toContain('m');
  });

  it('separates colliding labels without moving distant labels', () => {
    expect(separateNearbyLabels({ x: 10, y: 10 }, { x: 11, y: 11 })).toEqual([
      { x: 10, y: -2 },
      { x: 11, y: 23 },
    ]);
    expect(separateNearbyLabels({ x: 0, y: 0 }, { x: CHART_RADIUS, y: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: CHART_RADIUS, y: 0 },
    ]);
  });
});

describe('solver-to-renderer reference consistency', () => {
  for (const reference of referenceDocument.cases) {
    for (const termination of ['open', 'short'] as const) {
      it(`${reference.id} ${termination}`, () => {
        const input = reference.input;
        const rendered = solveShuntStub({
          load: {
            kind: 'finite',
            impedanceOhms: complex(input.resistanceOhms, input.reactanceOhms),
          },
          characteristicImpedanceOhms: ohms(input.characteristicImpedanceOhms),
          frequencyHz: hertz(input.frequencyHz),
          velocityFactor: input.velocityFactor,
          termination,
        });
        expect(rendered.status).toBe('solved');
        if (rendered.status !== 'solved') return;
        const gamma = complex(
          reference.expected.loadReflectionCoefficient.re,
          reference.expected.loadReflectionCoefficient.im,
        );
        const annotations = matchingAnnotations(rendered.solutions, termination, 'm');
        rendered.solutions.forEach((solution, index) => {
          const geometry = matchingSolutionGeometry(gamma, solution);
          const expected = reference.expected.solutions[index]!;
          const expectedJunction = impedanceToReflection(expected.junctionNormalizedImpedance);
          expect(geometry.junctionReflection.re).toBeCloseTo(expectedJunction.re, 8);
          expect(geometry.junctionReflection.im).toBeCloseTo(expectedJunction.im, 8);
          expect(geometry.stubPoints.at(-1)).toEqual({ x: CHART_CENTER, y: CHART_CENTER });
          expect(annotations[index]!.feed).toContain(
            solution.feedlineDistanceWavelengths.toFixed(5),
          );
          expect(annotations[index]!.stub).toContain(solution.stubLengthMeters.toFixed(3));
        });
      });
    }
  }
});
