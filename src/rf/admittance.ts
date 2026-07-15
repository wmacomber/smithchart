import type { Complex } from './complex';
import { complex, reciprocal } from './complex';
import type { Ohms } from './quantities';

export const impedanceToAdmittance = (impedance: Complex): Complex => reciprocal(impedance);
export const admittanceToImpedance = (admittance: Complex): Complex => reciprocal(admittance);
export const denormalizeAdmittance = (normalized: Complex, z0: Ohms): Complex =>
  complex(normalized.re / z0, normalized.im / z0);
