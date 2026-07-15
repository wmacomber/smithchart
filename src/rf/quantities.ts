export type Ohms = number & { readonly __unit: 'ohms' };
export type Siemens = number & { readonly __unit: 'siemens' };
export type Hertz = number & { readonly __unit: 'hertz' };
export type Meters = number & { readonly __unit: 'meters' };
export type Wavelengths = number & { readonly __unit: 'wavelengths' };
export type Degrees = number & { readonly __unit: 'degrees' };
export type Radians = number & { readonly __unit: 'radians' };

export const ohms = (value: number): Ohms => value as Ohms;
export const siemens = (value: number): Siemens => value as Siemens;
export const hertz = (value: number): Hertz => value as Hertz;
export const meters = (value: number): Meters => value as Meters;
export const wavelengths = (value: number): Wavelengths => value as Wavelengths;
export const degrees = (value: number): Degrees => value as Degrees;
export const radians = (value: number): Radians => value as Radians;

export const SPEED_OF_LIGHT_METERS_PER_SECOND = 299_792_458;
export const mediumWavelengthMeters = (frequency: Hertz, velocityFactor: number): Meters =>
  meters((SPEED_OF_LIGHT_METERS_PER_SECOND * velocityFactor) / frequency);
export const wavelengthDistanceMeters = (length: Wavelengths, wavelength: Meters): Meters =>
  meters(length * wavelength);
export const wavelengthElectricalDegrees = (length: Wavelengths): Degrees => degrees(length * 360);
export const metersToFeet = (value: Meters): number => value / 0.3048;
