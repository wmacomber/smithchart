import type { Complex } from './complex';
import { complex } from './complex';
import type { Ohms } from './quantities';

export const normalizeImpedance = (impedanceOhms: Complex, z0: Ohms): Complex =>
  complex(impedanceOhms.re / z0, impedanceOhms.im / z0);

export const denormalizeImpedance = (normalized: Complex, z0: Ohms): Complex =>
  complex(normalized.re * z0, normalized.im * z0);
