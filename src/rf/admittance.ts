import type { Complex } from './complex';
import { complex, reciprocal } from './complex';
import type { Ohms } from './quantities';

export const impedanceToAdmittance = (impedance: Complex): Complex => reciprocal(impedance);
export const admittanceToImpedance = (admittance: Complex): Complex => reciprocal(admittance);
export const normalizeAdmittance = (admittanceSiemens: Complex, z0: Ohms): Complex =>
  complex(admittanceSiemens.re * z0, admittanceSiemens.im * z0);
export const denormalizeAdmittance = (normalized: Complex, z0: Ohms): Complex =>
  complex(normalized.re / z0, normalized.im / z0);
