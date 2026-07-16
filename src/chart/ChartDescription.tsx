import type { Complex, StubMatchResult, StubTermination } from '../rf';
import type { SolutionView } from './chartTypes';

export function ChartDescription({
  load,
  result,
  selectedSolution,
  solutionView,
  termination,
}: {
  readonly load: Complex;
  readonly result: StubMatchResult;
  readonly selectedSolution: 'A' | 'B';
  readonly solutionView: SolutionView;
  readonly termination: StubTermination;
}) {
  const loadText = `${load.re.toFixed(2)} ${load.im < 0 ? 'minus' : 'plus'} j ${Math.abs(load.im).toFixed(2)}`;
  const description =
    result.status === 'solved'
      ? `Load ${loadText} ohms. Constant SWR circle shown. Movement toward generator is clockwise. ${solutionView === 'overlay' ? 'Both complete matching paths are shown.' : `Solution ${selectedSolution} complete path is shown; both unit-conductance intersections remain marked.`} ${result.solutions
          .map(
            (solution) =>
              `Solution ${solution.id}: move ${solution.feedlineDistanceWavelengths.toFixed(5)} wavelengths, ${solution.feedlineDistanceDegrees.toFixed(2)} degrees, toward generator to the g equals 1 junction; add a ${termination}-circuited shunt stub ${solution.stubLengthWavelengths.toFixed(5)} wavelengths, ${solution.stubElectricalDegrees.toFixed(2)} degrees, to reach chart center. Final reflection magnitude ${solution.diagnostics.resultReflectionMagnitude.toExponential(3)}.`,
          )
          .join(' ')}`
      : result.status === 'matched'
        ? 'Load is already matched.'
        : result.status === 'no-passive-solution'
          ? `No passive shunt-stub solution: ${result.reason}.`
          : 'Calculation input or numerical result is invalid.';
  return (
    <p id="chart-description" className="sr-only">
      {description}
    </p>
  );
}
