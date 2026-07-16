import type { CalculationState } from '../../app/workspaceTypes';
import type { StubMatchResult } from '../../rf';

function loadText(calculation: CalculationState): string {
  if (calculation.load.kind === 'open') return 'Open circuit';
  const { re, im } = calculation.load.impedanceOhms;
  return `${re} ${im < 0 ? '−' : '+'} j${Math.abs(im)} Ω`;
}

export function PrintWorksheetSummary({
  calculation,
  result,
  stale,
  version,
}: {
  readonly calculation: CalculationState;
  readonly result: StubMatchResult;
  readonly stale: boolean;
  readonly version: string;
}) {
  const alternate = calculation.selectedSolution === 'A' ? 'B' : 'A';
  return (
    <section className="print-only print-worksheet-summary" aria-label="Calculation worksheet">
      <header>
        <p className="eyebrow">Printable calculation worksheet</p>
        <h2>Smith Match v{version}</h2>
      </header>
      {stale && (
        <p className="print-stale-warning">
          Invalid draft omitted. Worksheet shows last committed valid calculation.
        </p>
      )}
      <dl>
        <div>
          <dt>Load</dt>
          <dd>{loadText(calculation)}</dd>
        </div>
        <div>
          <dt>Characteristic impedance</dt>
          <dd>{calculation.characteristicImpedanceOhms} Ω</dd>
        </div>
        <div>
          <dt>Frequency</dt>
          <dd>
            {calculation.frequencyHz} Hz ({(calculation.frequencyHz / 1e6).toFixed(6)} MHz)
          </dd>
        </div>
        <div>
          <dt>Velocity factor</dt>
          <dd>{calculation.velocityFactor}</dd>
        </div>
        <div>
          <dt>Stub termination</dt>
          <dd>{calculation.termination}-circuited shunt stub</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{result.status}</dd>
        </div>
        {result.status === 'solved' && (
          <>
            <div>
              <dt>Selected solution</dt>
              <dd>Solution {calculation.selectedSolution}</dd>
            </div>
            <div>
              <dt>Alternate solution</dt>
              <dd>Solution {alternate}</dd>
            </div>
          </>
        )}
      </dl>
      <p>
        Model: lossless, single-frequency, single shunt stub. One velocity factor applies to feed
        line and stub.
      </p>
    </section>
  );
}
