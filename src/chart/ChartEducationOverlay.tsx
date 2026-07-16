import { magnitude, type Complex, type StubMatchSolution } from '../rf';
import type { ChartEducationTarget } from '../features/tutorial/topics';
import { CHART_CENTER, CHART_RADIUS } from './chartGeometry';
import { matchingSolutionGeometry } from './matchingGeometry';

export function ChartEducationOverlay({
  target,
  loadReflection,
  solutions,
  selectedSolution,
}: {
  readonly target: ChartEducationTarget;
  readonly loadReflection?: Complex;
  readonly solutions?: readonly [StubMatchSolution, StubMatchSolution];
  readonly selectedSolution: 'A' | 'B';
}) {
  const selected = solutions?.find((solution) => solution.id === selectedSolution);
  const geometry =
    loadReflection && selected ? matchingSolutionGeometry(loadReflection, selected) : null;
  const allGeometry =
    loadReflection && solutions
      ? solutions.map((solution) => matchingSolutionGeometry(loadReflection, solution))
      : [];
  const loadPoint = loadReflection
    ? {
        x: CHART_CENTER + loadReflection.re * CHART_RADIUS,
        y: CHART_CENTER - loadReflection.im * CHART_RADIUS,
      }
    : null;
  const label = target.replaceAll('-', ' ');
  return (
    <g
      className={`chart-education-overlay education-${target}`}
      data-education-target={target}
      aria-hidden="true"
    >
      {(target === 'chart-overview' || target === 'matched-center') && (
        <circle
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={target === 'chart-overview' ? CHART_RADIUS : 18}
        />
      )}
      {target === 'chart-overview' && (
        <path d={`M 28 ${CHART_CENTER} H 372 M ${CHART_CENTER} 28 V 372`} />
      )}
      {target === 'normalization' && loadPoint && (
        <circle cx={loadPoint.x} cy={loadPoint.y} r="18" />
      )}
      {target === 'reflection' && loadReflection && (
        <circle cx={CHART_CENTER} cy={CHART_CENTER} r={magnitude(loadReflection) * CHART_RADIUS} />
      )}
      {target === 'feedline-rotation' && geometry && <path d={geometry.feedPath} />}
      {target === 'unit-conductance' &&
        allGeometry.map((item, index) => (
          <circle key={index} cx={item.junctionPoint.x} cy={item.junctionPoint.y} r="15" />
        ))}
      {(target === 'stub-path' ||
        target === 'electrical-length' ||
        target === 'physical-length' ||
        target === 'velocity-factor') &&
        geometry && (
          <polyline
            points={geometry.stubPoints.map((point) => `${point.x},${point.y}`).join(' ')}
          />
        )}
      <g className="education-callout">
        <rect x="118" y="344" width="164" height="28" rx="8" />
        <text x="200" y="362">
          Showing: {label}
        </text>
      </g>
    </g>
  );
}
