import type { Complex, StubMatchResult } from '../rf';

export function ChartDescription({
  load,
  result,
}: {
  readonly load: Complex;
  readonly result: StubMatchResult;
}) {
  const loadText = `${load.re.toFixed(2)} ${load.im < 0 ? 'minus' : 'plus'} j ${Math.abs(load.im).toFixed(2)}`;
  const description =
    result.status === 'solved'
      ? `Load ${loadText} ohms. Solution A reaches a unit conductance junction after ${result.solutions[0].feedlineDistanceWavelengths.toFixed(4)} wavelengths. Solution B after ${result.solutions[1].feedlineDistanceWavelengths.toFixed(4)} wavelengths.`
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
