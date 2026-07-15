import type { KeyboardEvent, PointerEvent } from 'react';
import type { Complex } from '../rf';
import { complex } from '../rf';
import {
  CHART_SIZE,
  chartPointToReflection,
  clampReflectionToUnitDisk,
  reflectionToChartPoint,
} from './chartGeometry';

interface Props {
  readonly reflection: Complex;
  readonly onPreview: (reflection: Complex) => void;
  readonly onCommit: (reflection: Complex) => void;
  readonly onCancel: () => void;
}

export function LoadMarker({ reflection, onPreview, onCommit, onCancel }: Props) {
  const point = reflectionToChartPoint(reflection);
  const fromPointer = (event: PointerEvent<SVGCircleElement>) => {
    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    return clampReflectionToUnitDisk(
      chartPointToReflection({
        x: ((event.clientX - rect.left) / rect.width) * CHART_SIZE,
        y: ((event.clientY - rect.top) / rect.height) * CHART_SIZE,
      }),
    );
  };
  const handleKey = (event: KeyboardEvent<SVGCircleElement>) => {
    if (event.key === 'Escape') return onCancel();
    if (event.key === 'Enter') return onCommit(reflection);
    const step = event.shiftKey ? 0.02 : 0.002;
    const moves: Record<string, Complex> = {
      ArrowLeft: complex(-step, 0),
      ArrowRight: complex(step, 0),
      ArrowUp: complex(0, step),
      ArrowDown: complex(0, -step),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const next = complex(reflection.re + move.re, reflection.im + move.im);
    const length = Math.hypot(next.re, next.im);
    onPreview(length > 1 ? complex(next.re / length, next.im / length) : next);
  };
  return (
    <g>
      <circle className="load-marker" cx={point.x} cy={point.y} r="9" aria-hidden="true" />
      <circle
        className="marker-hit-target"
        cx={point.x}
        cy={point.y}
        r="27"
        role="slider"
        tabIndex={0}
        aria-label="Load reflection coefficient. Use arrow keys to adjust, Enter to commit, Escape to cancel."
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={Number(Math.hypot(reflection.re, reflection.im).toFixed(4))}
        aria-valuetext={`magnitude ${Math.hypot(reflection.re, reflection.im).toFixed(3)}, phase ${((Math.atan2(reflection.im, reflection.re) * 180) / Math.PI).toFixed(1)} degrees`}
        onKeyDown={handleKey}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onPreview(fromPointer(event));
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) onPreview(fromPointer(event));
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          onCommit(fromPointer(event));
        }}
        onPointerCancel={onCancel}
      />
    </g>
  );
}
