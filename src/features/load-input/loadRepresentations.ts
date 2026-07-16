import {
  admittanceToImpedance,
  complex,
  impedanceToAdmittance,
  impedanceToReflection,
  isFiniteComplex,
  normalizeImpedance,
  ohms,
  reflectionToImpedance,
  type Load,
} from '../../rf';
import type { LoadRepresentation } from '../../app/workspaceTypes';

export interface RepresentationValues {
  readonly first: number;
  readonly second: number;
}

export function normalizePhaseDegrees(value: number): number {
  const normalized = ((((value + 180) % 360) + 360) % 360) - 180;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function loadToRepresentation(
  load: Load,
  characteristicImpedanceOhms: number,
  representation: LoadRepresentation,
): RepresentationValues | null {
  if (load.kind === 'open') return null;
  if (representation === 'impedance')
    return { first: load.impedanceOhms.re, second: load.impedanceOhms.im };
  if (representation === 'admittance') {
    const admittance = impedanceToAdmittance(load.impedanceOhms);
    return isFiniteComplex(admittance) ? { first: admittance.re, second: admittance.im } : null;
  }
  const reflection = impedanceToReflection(
    normalizeImpedance(load.impedanceOhms, ohms(characteristicImpedanceOhms)),
  );
  return isFiniteComplex(reflection)
    ? {
        first: Math.hypot(reflection.re, reflection.im),
        second: normalizePhaseDegrees((Math.atan2(reflection.im, reflection.re) * 180) / Math.PI),
      }
    : null;
}

export function representationToLoad(
  representation: LoadRepresentation,
  first: number,
  second: number,
  characteristicImpedanceOhms: number,
): Load | null {
  if (![first, second, characteristicImpedanceOhms].every(Number.isFinite)) return null;
  if (representation === 'impedance')
    return { kind: 'finite', impedanceOhms: complex(first, second) };
  if (representation === 'admittance') {
    if (first === 0 && second === 0) return { kind: 'open' };
    const impedance = admittanceToImpedance(complex(first, second));
    return isFiniteComplex(impedance) ? { kind: 'finite', impedanceOhms: impedance } : null;
  }
  if (first < 0 || characteristicImpedanceOhms <= 0) return null;
  const phaseRadians = (normalizePhaseDegrees(second) * Math.PI) / 180;
  const reflection = complex(first * Math.cos(phaseRadians), first * Math.sin(phaseRadians));
  if (reflection.re === 1 && Math.abs(reflection.im) < 1e-15) return { kind: 'open' };
  const normalized = reflectionToImpedance(reflection);
  const impedance = complex(
    normalized.re * characteristicImpedanceOhms,
    normalized.im * characteristicImpedanceOhms,
  );
  return isFiniteComplex(impedance) ? { kind: 'finite', impedanceOhms: impedance } : null;
}
