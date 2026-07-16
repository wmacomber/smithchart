import type { CalculationState, LengthUnit } from '../../app/workspaceTypes';
import { metersToFeet, type StubMatchSolution, type StubTermination } from '../../rf';
import { formatLength } from './lengthFormatting';

export interface MatchingResultText {
  readonly feedlineLength: string;
  readonly stubLength: string;
  readonly construction: string;
  readonly complete: string;
}

export function matchingResultText(
  solution: StubMatchSolution,
  termination: StubTermination,
  lengthUnit: LengthUnit,
  calculation: CalculationState,
): MatchingResultText {
  const feedlineLength = formatLength(solution.feedlineDistanceMeters, lengthUnit);
  const stubLength = formatLength(solution.stubLengthMeters, lengthUnit);
  const construction = `Move ${feedlineLength} toward the transmitter from the load and connect a ${termination}-circuited shunt stub ${stubLength} long.`;
  const complete = [
    `Solution ${solution.id}`,
    `Inputs: load ${calculation.load.kind === 'open' ? 'open circuit' : `${calculation.load.impedanceOhms.re} ${calculation.load.impedanceOhms.im < 0 ? '−' : '+'} j${Math.abs(calculation.load.impedanceOhms.im)} Ω`}; Z₀ ${calculation.characteristicImpedanceOhms} Ω; frequency ${(calculation.frequencyHz / 1e6).toFixed(6)} MHz; velocity factor ${calculation.velocityFactor}; ${termination}-circuited shunt stub.`,
    construction,
    `Feed line: ${solution.feedlineDistanceWavelengths.toFixed(5)} λ; ${solution.feedlineDistanceDegrees.toFixed(2)}°; ${solution.feedlineDistanceMeters.toFixed(3)} m; ${metersToFeet(solution.feedlineDistanceMeters).toFixed(2)} ft.`,
    `Stub: ${solution.stubLengthWavelengths.toFixed(5)} λ; ${solution.stubElectricalDegrees.toFixed(2)}°; ${solution.stubLengthMeters.toFixed(3)} m; ${metersToFeet(solution.stubLengthMeters).toFixed(2)} ft.`,
    `Junction y: ${solution.junctionNormalizedAdmittance.re.toFixed(6)} ${solution.junctionNormalizedAdmittance.im < 0 ? '−' : '+'} j${Math.abs(solution.junctionNormalizedAdmittance.im).toFixed(6)}.`,
    `Required stub susceptance: ${solution.requiredStubNormalizedSusceptance.toExponential(6)} normalized; ${solution.requiredStubSusceptanceSiemens.toExponential(6)} S.`,
    `Residual: |Γ| ${solution.diagnostics.resultReflectionMagnitude.toExponential(6)}; VSWR ${solution.residualVswr.toFixed(10)}.`,
    'Model: lossless, single-frequency, single shunt stub. One velocity factor applies to feed line and stub.',
    'Construction warning: calculated physical lengths are starting values. Connector and exposed-conductor length, end effects, dielectric tolerance, coupling, nearby objects, line loss, and calibration alter the installed match. Cut conservatively, measure, and trim incrementally.',
  ].join('\n');
  return { feedlineLength, stubLength, construction, complete };
}
