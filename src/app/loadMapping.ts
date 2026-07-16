import {
  complex,
  denormalizeImpedance,
  impedanceToReflection,
  normalizeImpedance,
  ohms,
  reflectionToImpedance,
  type Complex,
  type Load,
} from '../rf';
import type { LoadMarkerReadout } from '../chart/chartTypes';

const OPEN_TOLERANCE = 1e-10;

export function loadToReflection(load: Load, z0: number): Complex {
  return load.kind === 'open'
    ? complex(1, 0)
    : impedanceToReflection(normalizeImpedance(load.impedanceOhms, ohms(z0)));
}

export function reflectionToLoad(reflection: Complex, z0: number): Load {
  if (Math.hypot(reflection.re - 1, reflection.im) < OPEN_TOLERANCE) return { kind: 'open' };
  const impedance = denormalizeImpedance(reflectionToImpedance(reflection), ohms(z0));
  return { kind: 'finite', impedanceOhms: impedance };
}

function numberText(value: number, digits: number): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return Number(normalized.toFixed(digits)).toString();
}

export function formatLoadMarkerReadout(load: Load, reflection: Complex): LoadMarkerReadout {
  const magnitude = Math.hypot(reflection.re, reflection.im);
  const phase = (Math.atan2(reflection.im, reflection.re) * 180) / Math.PI;
  const reflectionText = `|Γ| ${numberText(magnitude, 3)} ∠ ${numberText(phase, 1)}°`;
  if (load.kind === 'open') {
    return {
      impedanceText: 'Exact open circuit',
      reflectionText,
      accessibleText: `Exact open circuit, reflection magnitude ${numberText(magnitude, 3)}, phase ${numberText(phase, 1)} degrees`,
    };
  }
  const resistance = numberText(load.impedanceOhms.re, 3);
  const reactance = numberText(Math.abs(load.impedanceOhms.im), 3);
  const sign = load.impedanceOhms.im < 0 ? '−' : '+';
  return {
    impedanceText: `${resistance} ${sign} j${reactance} Ω`,
    reflectionText,
    accessibleText: `${resistance} ohms resistance, ${load.impedanceOhms.im < 0 ? 'minus' : 'plus'} j ${reactance} ohms reactance, reflection magnitude ${numberText(magnitude, 3)}, phase ${numberText(phase, 1)} degrees`,
  };
}
