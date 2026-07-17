import type { Complex } from '../rf';
import { CHART_CENTER, CHART_SIZE, reflectionToChartPoint } from './chartGeometry';
import type { LoadMarkerReadout } from './chartTypes';

interface Props {
  readonly reflection: Complex;
  readonly readout: LoadMarkerReadout;
  readonly tooltipVisible: boolean;
}

const TOOLTIP_WIDTH = 164;
const TOOLTIP_HEIGHT = 42;
const TOOLTIP_GAP = 14;
const TOOLTIP_MARGIN = 8;

export function LoadMarker({ reflection, readout, tooltipVisible }: Props) {
  const point = reflectionToChartPoint(reflection);
  const tooltipX = Math.min(
    CHART_SIZE - TOOLTIP_WIDTH - TOOLTIP_MARGIN,
    Math.max(
      TOOLTIP_MARGIN,
      point.x > CHART_CENTER ? point.x - TOOLTIP_WIDTH - TOOLTIP_GAP : point.x + TOOLTIP_GAP,
    ),
  );
  const tooltipY = Math.min(
    CHART_SIZE - TOOLTIP_HEIGHT - TOOLTIP_MARGIN,
    Math.max(
      TOOLTIP_MARGIN,
      point.y > CHART_CENTER ? point.y - TOOLTIP_HEIGHT - TOOLTIP_GAP : point.y + TOOLTIP_GAP,
    ),
  );

  return (
    <g className="marker-control">
      <circle className="load-marker" cx={point.x} cy={point.y} r="9" aria-hidden="true" />
      {tooltipVisible && (
        <g
          className="load-marker-tooltip"
          transform={`translate(${tooltipX} ${tooltipY})`}
          aria-hidden="true"
        >
          <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx="5" />
          <text x="8" y="16">
            {readout.impedanceText}
          </text>
          <text x="8" y="33">
            {readout.reflectionText}
          </text>
        </g>
      )}
    </g>
  );
}
