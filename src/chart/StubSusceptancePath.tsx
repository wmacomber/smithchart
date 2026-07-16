import type { StubMatchSolution } from '../rf';
import type { MatchingSolutionGeometry } from './matchingGeometry';

export function StubSusceptancePath({
  solution,
  geometry,
  markerId,
  selected,
  label,
}: {
  readonly solution: StubMatchSolution;
  readonly geometry: MatchingSolutionGeometry;
  readonly markerId: string;
  readonly selected: boolean;
  readonly label: string;
}) {
  const points = geometry.stubPoints.map((point) => `${point.x},${point.y}`).join(' ');
  return (
    <g
      className={`matching-solution solution-${solution.id.toLowerCase()} ${selected ? 'is-selected' : 'is-alternate'}`}
    >
      {selected && <polyline points={points} className="solution-selection-halo stub-halo" />}
      <polyline
        className="stub-path matching-step-stub"
        points={points}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={solution.id === 'A' ? 104 : 296}
        y={solution.id === 'A' ? 188 : 214}
        className="matching-annotation stub-label matching-step-label"
      >
        {label}
      </text>
    </g>
  );
}
