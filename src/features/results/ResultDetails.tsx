import type { StubMatchSolution } from '../../rf';
export function ResultDetails({ solution }: { readonly solution: StubMatchSolution }) {
  return (
    <dl className="result-details">
      <div>
        <dt>Feed line</dt>
        <dd>
          {solution.feedlineDistanceWavelengths.toFixed(5)} λ ·{' '}
          {solution.feedlineDistanceDegrees.toFixed(2)}°
        </dd>
      </div>
      <div>
        <dt>Stub</dt>
        <dd>
          {solution.stubLengthWavelengths.toFixed(5)} λ ·{' '}
          {solution.stubElectricalDegrees.toFixed(2)}°
        </dd>
      </div>
      <div>
        <dt>Junction y</dt>
        <dd>
          {solution.junctionNormalizedAdmittance.re.toFixed(5)}{' '}
          {solution.junctionNormalizedAdmittance.im < 0 ? '−' : '+'} j
          {Math.abs(solution.junctionNormalizedAdmittance.im).toFixed(5)}
        </dd>
      </div>
      <div>
        <dt>Required B</dt>
        <dd>{solution.requiredStubSusceptanceSiemens.toExponential(4)} S</dd>
      </div>
      <div>
        <dt>Residual VSWR</dt>
        <dd>{solution.residualVswr.toFixed(8)}</dd>
      </div>
    </dl>
  );
}
