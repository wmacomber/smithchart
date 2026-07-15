import { CHART_CENTER, CHART_RADIUS, circleGeometry } from './chartGeometry';

const RESISTANCES = [0, 0.2, 0.5, 1, 2, 5];
const REACTANCES = [0.2, 0.5, 1, 2, 5];

function ImpedanceGrid({ className }: { readonly className: string }) {
  return (
    <g className={className}>
      <line
        x1={CHART_CENTER - CHART_RADIUS}
        y1={CHART_CENTER}
        x2={CHART_CENTER + CHART_RADIUS}
        y2={CHART_CENTER}
      />
      {RESISTANCES.map((r) => {
        const circle = circleGeometry(r / (r + 1), 0, 1 / (r + 1));
        return <circle key={`r-${r}`} {...circle} />;
      })}
      {REACTANCES.flatMap((x) =>
        [x, -x].map((value) => {
          const circle = circleGeometry(1, 1 / value, 1 / Math.abs(value));
          return <circle key={`x-${value}`} {...circle} />;
        }),
      )}
    </g>
  );
}

export function SmithGrid({
  displayMode,
}: {
  readonly displayMode: 'impedance' | 'admittance' | 'both';
}) {
  return (
    <>
      <defs>
        <clipPath id="smith-boundary">
          <circle cx={CHART_CENTER} cy={CHART_CENTER} r={CHART_RADIUS} />
        </clipPath>
      </defs>
      <circle className="smith-boundary" cx={CHART_CENTER} cy={CHART_CENTER} r={CHART_RADIUS} />
      <g clipPath="url(#smith-boundary)">
        {displayMode !== 'admittance' && <ImpedanceGrid className="smith-grid impedance-grid" />}
        {displayMode !== 'impedance' && (
          <g transform={`rotate(180 ${CHART_CENTER} ${CHART_CENTER})`}>
            <ImpedanceGrid
              className={`smith-grid admittance-grid ${displayMode === 'both' ? 'secondary' : ''}`}
            />
          </g>
        )}
      </g>
    </>
  );
}
