import type { LengthUnit, SolutionView } from '../app/workspaceTypes';
import { formatLength } from '../features/results/lengthFormatting';
import type { Complex, StubMatchResult, StubTermination } from '../rf';

const complexText = (value: Complex, digits = 2): string =>
  `${value.re.toFixed(digits)} ${value.im < 0 ? 'minus' : 'plus'} j ${Math.abs(value.im).toFixed(digits)}`;

export function ChartDescription({
  load,
  characteristicImpedanceOhms,
  reflection,
  result,
  selectedSolution,
  solutionView,
  termination,
  lengthUnit,
}: {
  readonly load: Complex;
  readonly characteristicImpedanceOhms: number;
  readonly reflection: Complex | null;
  readonly result: StubMatchResult;
  readonly selectedSolution: 'A' | 'B';
  readonly solutionView: SolutionView;
  readonly termination: StubTermination;
  readonly lengthUnit: LengthUnit;
}) {
  const finiteLoad = Number.isFinite(load.re) && Number.isFinite(load.im);
  const loadText = finiteLoad ? `${complexText(load)} ohms` : 'an open circuit';
  const normalizedText = finiteLoad
    ? complexText({
        re: load.re / characteristicImpedanceOhms,
        im: load.im / characteristicImpedanceOhms,
      })
    : 'infinite';
  const reflectionText = reflection
    ? `Reflection magnitude ${Math.hypot(reflection.re, reflection.im).toFixed(4)}, phase ${((Math.atan2(reflection.im, reflection.re) * 180) / Math.PI).toFixed(2)} degrees.`
    : 'Reflection coefficient is not finite.';
  const description =
    result.status === 'solved'
      ? `Load ${loadText}; normalized impedance ${normalizedText}. ${reflectionText} Movement toward generator is clockwise. ${solutionView === 'overlay' ? 'Both complete matching paths are shown.' : `Solution ${selectedSolution} is shown; both unit-conductance intersections remain marked.`} ${result.solutions
          .map(
            (solution) =>
              `Solution ${solution.id}: intersection normalized admittance ${complexText(solution.junctionNormalizedAdmittance)}. Move ${solution.feedlineDistanceWavelengths.toFixed(5)} wavelengths, ${solution.feedlineDistanceDegrees.toFixed(2)} degrees, ${formatLength(solution.feedlineDistanceMeters, lengthUnit)}, toward generator; add a ${termination}-circuited shunt stub ${solution.stubLengthWavelengths.toFixed(5)} wavelengths, ${solution.stubElectricalDegrees.toFixed(2)} degrees, ${formatLength(solution.stubLengthMeters, lengthUnit)}. Final reflection magnitude ${solution.diagnostics.resultReflectionMagnitude.toExponential(3)}.`,
          )
          .join(' ')}`
      : result.status === 'matched'
        ? `Load ${loadText}; normalized impedance ${normalizedText}. ${reflectionText} Load is already matched at chart center. No feed-line move or stub is required.`
        : result.status === 'no-passive-solution'
          ? `Load ${loadText}; normalized impedance ${normalizedText}. ${reflectionText} No passive shunt-stub solution: ${result.reason.replaceAll('-', ' ')}.`
          : result.status === 'invalid-input'
            ? `Calculation input is invalid. ${result.issues.map((issue) => issue.message).join(' ')}`
            : `Numerical verification failed. No construction lengths are available. ${reflectionText}`;

  return (
    <details className="chart-summary">
      <summary>Chart summary</summary>
      <p id="chart-description">{description}</p>
    </details>
  );
}
