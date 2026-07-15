import type { Complex } from './complex';
import { add, complex, divide, magnitude, subtract } from './complex';

const ONE = complex(1);

export const impedanceToReflection = (normalizedImpedance: Complex): Complex =>
  divide(subtract(normalizedImpedance, ONE), add(normalizedImpedance, ONE));

export const reflectionToImpedance = (reflection: Complex): Complex =>
  divide(add(ONE, reflection), subtract(ONE, reflection));

export const admittanceToReflection = (normalizedAdmittance: Complex): Complex =>
  divide(subtract(ONE, normalizedAdmittance), add(ONE, normalizedAdmittance));

export const reflectionToVswr = (reflection: Complex): number => {
  const rho = magnitude(reflection);
  return rho >= 1 ? Number.POSITIVE_INFINITY : (1 + rho) / (1 - rho);
};
