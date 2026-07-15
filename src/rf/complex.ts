export interface Complex {
  readonly re: number;
  readonly im: number;
}

export const complex = (re: number, im = 0): Complex => ({ re, im });
export const add = (a: Complex, b: Complex): Complex => complex(a.re + b.re, a.im + b.im);
export const subtract = (a: Complex, b: Complex): Complex => complex(a.re - b.re, a.im - b.im);
export const multiply = (a: Complex, b: Complex): Complex =>
  complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const divide = (a: Complex, b: Complex): Complex => {
  const scale = Math.max(Math.abs(b.re), Math.abs(b.im));
  if (scale === 0) return complex(Number.NaN, Number.NaN);
  const scaledRe = b.re / scale;
  const scaledIm = b.im / scale;
  const denominator = scaledRe * scaledRe + scaledIm * scaledIm;
  return complex(
    ((a.re / scale) * scaledRe + (a.im / scale) * scaledIm) / denominator,
    ((a.im / scale) * scaledRe - (a.re / scale) * scaledIm) / denominator,
  );
};
export const reciprocal = (value: Complex): Complex => divide(complex(1), value);
export const conjugate = (value: Complex): Complex => complex(value.re, -value.im);
export const magnitude = (value: Complex): number => Math.hypot(value.re, value.im);
export const phase = (value: Complex): number => Math.atan2(value.im, value.re);
export const fromPolar = (radius: number, angleRadians: number): Complex =>
  complex(radius * Math.cos(angleRadians), radius * Math.sin(angleRadians));
export const isFiniteComplex = (value: Complex): boolean =>
  Number.isFinite(value.re) && Number.isFinite(value.im);
