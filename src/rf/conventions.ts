export const PRIMITIVE_ABSOLUTE_TOLERANCE = 1e-12;
export const PRIMITIVE_RELATIVE_TOLERANCE = 1e-10;
export const SOLVER_ABSOLUTE_TOLERANCE = 1e-10;
export const SOLVER_RELATIVE_TOLERANCE = 1e-9;
export const MAX_RESULT_REFLECTION = 1e-8;
export const HALF_WAVELENGTH = 0.5;

export const canonicalHalfWavelength = (value: number): number => {
  const wrapped = ((value % HALF_WAVELENGTH) + HALF_WAVELENGTH) % HALF_WAVELENGTH;
  return HALF_WAVELENGTH - wrapped <= PRIMITIVE_ABSOLUTE_TOLERANCE ? 0 : wrapped;
};

export const positiveAngle = (angle: number): number => {
  const turn = 2 * Math.PI;
  return ((angle % turn) + turn) % turn;
};
