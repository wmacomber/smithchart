import { describe, expect, it } from 'vitest';
import { CHART_LABEL_SAFE_INSET, getLabelLayout, labelBounds, labelsOverlap } from '../labelLayout';
import type { ChartDisplayMode, GridDensity } from '../chartTypes';

const densities: readonly GridDensity[] = ['compact', 'regular', 'dense'];
const modes: readonly ChartDisplayMode[] = ['impedance', 'admittance', 'both'];

describe('chart label layout', () => {
  for (const density of densities) {
    for (const mode of modes) {
      it(`${density} ${mode} remains bounded and collision-free`, () => {
        const labels = getLabelLayout(density, mode);
        for (const [index, label] of labels.entries()) {
          const bounds = labelBounds(label);
          expect(bounds.left).toBeGreaterThanOrEqual(CHART_LABEL_SAFE_INSET);
          expect(bounds.top).toBeGreaterThanOrEqual(CHART_LABEL_SAFE_INSET);
          expect(bounds.right).toBeLessThanOrEqual(400 - CHART_LABEL_SAFE_INSET);
          expect(bounds.bottom).toBeLessThanOrEqual(400 - CHART_LABEL_SAFE_INSET);
          for (const other of labels.slice(index + 1)) {
            expect(labelsOverlap(label, other)).toBe(false);
          }
        }
      });
    }
  }

  it('omits compact secondary numeric labels and limits larger combined modes to unity', () => {
    expect(getLabelLayout('compact', 'both').some((label) => label.kind === 'secondary')).toBe(
      false,
    );
    for (const density of ['regular', 'dense'] as const) {
      const secondary = getLabelLayout(density, 'both').filter(
        (label) => label.kind === 'secondary',
      );
      expect(secondary.length).toBeGreaterThan(0);
      expect(secondary.every((label) => label.text.includes('1'))).toBe(true);
    }
  });

  it('caches immutable layouts', () => {
    const first = getLabelLayout('regular', 'impedance');
    expect(getLabelLayout('regular', 'impedance')).toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
  });
});
