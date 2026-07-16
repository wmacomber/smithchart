import { magnitude, type Complex, type StubMatchSolution } from '../rf';
import type { ChartDisplayDensity, SolutionView } from './chartTypes';
import { CHART_CENTER, CHART_RADIUS } from './chartGeometry';
import { FeedLinePath } from './FeedLinePath';
import { StubSusceptancePath } from './StubSusceptancePath';
import { matchingSolutionGeometry, separateNearbyLabels } from './matchingGeometry';

export function MatchingOverlay({
  loadReflection,
  solutions,
  selectedSolution,
  solutionView,
  density,
  markerIds,
}: {
  readonly loadReflection: Complex;
  readonly solutions: readonly [StubMatchSolution, StubMatchSolution];
  readonly selectedSolution: 'A' | 'B';
  readonly solutionView: SolutionView;
  readonly density: ChartDisplayDensity;
  readonly markerIds: Readonly<Record<'A' | 'B', string>>;
}) {
  const geometries = solutions.map((solution) =>
    matchingSolutionGeometry(loadReflection, solution),
  );
  const [labelA, labelB] = separateNearbyLabels(
    geometries[0]!.feedLabelPoint,
    geometries[1]!.feedLabelPoint,
  );
  const labelPoints = [labelA, labelB] as const;
  const compact = density === 'compact';

  return (
    <>
      <g data-layer="swr-circle" aria-hidden="true">
        <circle
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={magnitude(loadReflection) * CHART_RADIUS}
          className="swr-circle matching-step-swr"
        />
      </g>
      <g data-layer="solution-paths" aria-hidden="true">
        {solutions.map((solution, index) => {
          const selected = solution.id === selectedSolution;
          const showPath = selected || solutionView === 'overlay';
          return (
            <FeedLinePath
              key={solution.id}
              solution={solution}
              geometry={geometries[index]!}
              markerId={markerIds[solution.id]}
              showPath={showPath}
              selected={selected}
              feedLabel={
                compact
                  ? `${solution.id} feed`
                  : `${solution.id} feed · ${solution.feedlineDistanceDegrees.toFixed(2)}°`
              }
              labelPoint={labelPoints[index]!}
            />
          );
        })}
        {solutions.map((solution, index) => {
          const selected = solution.id === selectedSolution;
          if (!selected && solutionView !== 'overlay') return null;
          return (
            <StubSusceptancePath
              key={solution.id}
              solution={solution}
              geometry={geometries[index]!}
              markerId={markerIds[solution.id]}
              selected={selected}
              label={
                compact
                  ? `${solution.id} stub`
                  : `${solution.id} stub · ${solution.stubElectricalDegrees.toFixed(2)}°`
              }
            />
          );
        })}
        <g className="center-match-marker matching-step-center">
          <circle cx={CHART_CENTER} cy={CHART_CENTER} r="7" />
          <path
            d={`M ${CHART_CENTER - 10} ${CHART_CENTER} H ${CHART_CENTER + 10} M ${CHART_CENTER} ${CHART_CENTER - 10} V ${CHART_CENTER + 10}`}
          />
        </g>
      </g>
    </>
  );
}
