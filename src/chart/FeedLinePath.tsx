import type { StubMatchSolution } from '../rf';
import type { ChartPoint } from './chartTypes';
import type { MatchingSolutionGeometry } from './matchingGeometry';

export function FeedLinePath({
  solution,
  geometry,
  markerId,
  showPath,
  selected,
  feedLabel,
  labelPoint,
}: {
  readonly solution: StubMatchSolution;
  readonly geometry: MatchingSolutionGeometry;
  readonly markerId: string;
  readonly showPath: boolean;
  readonly selected: boolean;
  readonly feedLabel: string;
  readonly labelPoint: ChartPoint;
}) {
  const identity = `solution-${solution.id.toLowerCase()}`;
  const state = selected ? 'is-selected' : 'is-alternate';
  const { junctionPoint } = geometry;

  return (
    <g className={`matching-solution ${identity} ${state}`} data-solution={solution.id}>
      {showPath && (
        <>
          {selected && <path d={geometry.feedPath} className="solution-selection-halo" />}
          <path
            d={geometry.feedPath}
            className="solution-path feed-line-path matching-step-feed"
            markerEnd={`url(#${markerId})`}
          />
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            className="matching-annotation feed-line-label matching-step-label"
          >
            {feedLabel}
          </text>
        </>
      )}
      {solution.id === 'A' ? (
        <circle
          cx={junctionPoint.x}
          cy={junctionPoint.y}
          r="6"
          className="junction-marker matching-step-junction"
        />
      ) : (
        <rect
          x={junctionPoint.x - 5}
          y={junctionPoint.y - 5}
          width="10"
          height="10"
          transform={`rotate(45 ${junctionPoint.x} ${junctionPoint.y})`}
          className="junction-marker matching-step-junction"
        />
      )}
      <text
        x={junctionPoint.x + 10}
        y={junctionPoint.y - 8}
        className="junction-label matching-step-junction"
      >
        {solution.id}
      </text>
    </g>
  );
}
