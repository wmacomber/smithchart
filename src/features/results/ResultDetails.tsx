import type { ReactNode } from 'react';
import type { StubMatchSolution } from '../../rf';

function DetailGroup({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section>
      <h4>{title}</h4>
      <dl className="result-details">{children}</dl>
    </section>
  );
}

function Detail({ name, value }: { readonly name: string; readonly value: ReactNode }) {
  return (
    <div>
      <dt>{name}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function ResultDetails({ solution }: { readonly solution: StubMatchSolution }) {
  const signed = (value: { readonly re: number; readonly im: number }, digits = 6) =>
    `${value.re.toFixed(digits)} ${value.im < 0 ? '−' : '+'} j${Math.abs(value.im).toFixed(digits)}`;
  return (
    <div className="advanced-detail-groups">
      <DetailGroup title="Electrical lengths">
        <Detail
          name="Feed line"
          value={
            <>
              {solution.feedlineDistanceWavelengths.toFixed(5)} λ ·{' '}
              {solution.feedlineDistanceDegrees.toFixed(2)}°
            </>
          }
        />
        <Detail
          name="Stub"
          value={
            <>
              {solution.stubLengthWavelengths.toFixed(5)} λ ·{' '}
              {solution.stubElectricalDegrees.toFixed(2)}°
            </>
          }
        />
      </DetailGroup>
      <DetailGroup title="Junction quantities">
        <Detail name="Normalized z" value={signed(solution.junctionNormalizedImpedance)} />
        <Detail name="Impedance" value={<>{signed(solution.junctionImpedanceOhms)} Ω</>} />
        <Detail name="Normalized y" value={signed(solution.junctionNormalizedAdmittance)} />
        <Detail name="Admittance" value={<>{signed(solution.junctionAdmittanceSiemens)} S</>} />
        <Detail
          name="Required stub b"
          value={solution.requiredStubNormalizedSusceptance.toExponential(6)}
        />
        <Detail
          name="Required stub B"
          value={`${solution.requiredStubSusceptanceSiemens.toExponential(6)} S`}
        />
      </DetailGroup>
      <DetailGroup title="Verification">
        <Detail
          name="Load |Γ|"
          value={solution.diagnostics.loadReflectionMagnitude.toExponential(6)}
        />
        <Detail
          name="Final |Γ|"
          value={solution.diagnostics.resultReflectionMagnitude.toExponential(6)}
        />
        <Detail
          name="Conductance error"
          value={solution.diagnostics.conductanceError.toExponential(6)}
        />
        <Detail
          name="Susceptance error"
          value={solution.diagnostics.susceptanceError.toExponential(6)}
        />
        <Detail name="Residual VSWR" value={solution.residualVswr.toFixed(10)} />
      </DetailGroup>
    </div>
  );
}
