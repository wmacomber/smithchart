import type { Complex, StubMatchSolution } from '../rf';
import { magnitude } from '../rf';
import { arcPath, CHART_CENTER, CHART_RADIUS, reflectionToChartPoint } from './chartGeometry';

export function TransformationPath({
  load,
  solution,
}: {
  readonly load: Complex;
  readonly solution: StubMatchSolution;
}) {
  const target = solution.resultingReflectionCoefficient;
  const junctionGamma = {
    re:
      (solution.junctionNormalizedImpedance.re ** 2 +
        solution.junctionNormalizedImpedance.im ** 2 -
        1) /
      ((solution.junctionNormalizedImpedance.re + 1) ** 2 +
        solution.junctionNormalizedImpedance.im ** 2),
    im:
      (2 * solution.junctionNormalizedImpedance.im) /
      ((solution.junctionNormalizedImpedance.re + 1) ** 2 +
        solution.junctionNormalizedImpedance.im ** 2),
  };
  const junction = reflectionToChartPoint(junctionGamma);
  void target;
  return (
    <g className={`solution-path solution-${solution.id.toLowerCase()}`}>
      <circle
        cx={CHART_CENTER}
        cy={CHART_CENTER}
        r={magnitude(load) * CHART_RADIUS}
        className="swr-circle"
      />
      <path
        d={arcPath(load, junctionGamma, magnitude(load), true)}
        markerEnd="url(#direction-arrow)"
      />
      <circle cx={junction.x} cy={junction.y} r="6" className="junction-marker" />
    </g>
  );
}
