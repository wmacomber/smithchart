import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { resolveGridDensity } from './gridDensity';
import type { GridDensity, GridDensityMode } from './chartTypes';

export function useChartSize(
  mode: GridDensityMode,
): readonly [RefObject<SVGSVGElement | null>, GridDensity] {
  const ref = useRef<SVGSVGElement>(null);
  const [autoDensity, setAutoDensity] = useState<GridDensity>(() =>
    resolveGridDensity('auto', null),
  );

  useEffect(() => {
    if (mode !== 'auto') return;
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const update = (width: number) =>
      setAutoDensity((current) => {
        const next = resolveGridDensity('auto', width);
        return current === next ? current : next;
      });
    update(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [mode]);

  return [ref, mode === 'auto' ? autoDensity : mode];
}
