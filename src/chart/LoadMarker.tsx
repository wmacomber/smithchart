import { useId } from 'react';
import type { Complex } from '../rf';
import { CHART_CENTER, CHART_SIZE, reflectionToChartPoint } from './chartGeometry';
import type { LoadMarkerReadout } from './chartTypes';
import { useChartInteraction } from './useChartInteraction';

interface Props {
  readonly reflection: Complex;
  readonly readout: LoadMarkerReadout;
  readonly snapPointer: boolean;
  readonly onPreview: (reflection: Complex) => void;
  readonly onCommit: (reflection: Complex) => void;
  readonly onCancel: () => void;
}

const TOOLTIP_WIDTH = 164;
const TOOLTIP_HEIGHT = 42;
const TOOLTIP_GAP = 14;
const TOOLTIP_MARGIN = 8;

export function LoadMarker({
  reflection,
  readout,
  snapPointer,
  onPreview,
  onCommit,
  onCancel,
}: Props) {
  const point = reflectionToChartPoint(reflection);
  const reactId = useId().replace(/:/g, '');
  const instructionsId = `load-marker-instructions-${reactId}`;
  const statusId = `load-marker-status-${reactId}`;
  const interaction = useChartInteraction({
    reflection,
    snapPointer,
    onPreview,
    onCommit,
    onCancel,
  });
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
  const magnitude = Math.min(1, Math.hypot(reflection.re, reflection.im));

  return (
    <g
      className="marker-control"
      data-active={interaction.activeSource !== null ? 'true' : undefined}
    >
      <foreignObject
        className="marker-hit-container"
        x={point.x - 30}
        y={point.y - 30}
        width="60"
        height="60"
      >
        <div
          className="marker-hit-target"
          role="slider"
          tabIndex={0}
          aria-label="Load marker"
          aria-describedby={`${instructionsId} ${statusId}`}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={Number(magnitude.toFixed(4))}
          aria-valuetext={readout.accessibleText}
          onKeyDown={interaction.onKeyDown}
          onPointerDown={interaction.onPointerDown}
          onPointerMove={interaction.onPointerMove}
          onPointerUp={interaction.onPointerUp}
          onPointerCancel={interaction.onPointerCancel}
          onLostPointerCapture={interaction.onLostPointerCapture}
          onPointerEnter={interaction.onPointerEnter}
          onPointerLeave={interaction.onPointerLeave}
          onFocus={interaction.onFocus}
          onBlur={interaction.onBlur}
        />
      </foreignObject>
      <circle
        className="load-marker-focus-ring"
        cx={point.x}
        cy={point.y}
        r="14"
        aria-hidden="true"
      />
      <circle className="load-marker" cx={point.x} cy={point.y} r="9" aria-hidden="true" />
      {interaction.tooltipVisible && (
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
      <text id={instructionsId} className="sr-only-svg">
        Use arrow keys for fine movement, Shift plus arrow keys for coarse movement, Enter to
        commit, and Escape to cancel.
      </text>
      <text id={statusId} className="sr-only-svg" aria-live="polite" aria-atomic="true">
        {interaction.announcement}
      </text>
    </g>
  );
}
