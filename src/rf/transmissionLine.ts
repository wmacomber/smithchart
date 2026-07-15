import type { Complex } from './complex';
import { fromPolar, multiply } from './complex';
import type { Wavelengths } from './quantities';

export const rotateTowardGenerator = (reflection: Complex, distance: Wavelengths): Complex =>
  multiply(reflection, fromPolar(1, -4 * Math.PI * distance));
