import type { StubMatchSolution } from '../rf';
import { admittanceToReflection, complex } from '../rf';
import { reflectionToChartPoint } from './chartGeometry';

export function StubPath({ solution }: { readonly solution: StubMatchSolution }) {
  const startB = solution.junctionNormalizedAdmittance.im;
  const points = Array.from({ length: 25 }, (_, index) => {
    const b = startB * (1 - index / 24);
    return reflectionToChartPoint(admittanceToReflection(complex(1, b)));
  });
  return (
    <polyline
      className={`stub-path solution-${solution.id.toLowerCase()}`}
      points={points.map((p) => `${p.x},${p.y}`).join(' ')}
    />
  );
}
