import { DEFAULT_CALCULATION, DEFAULT_WORKSPACE } from '../app/workspaceReducer';
import type { CalculationState, WorkspaceState } from '../app/workspaceTypes';

const NUMBER = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?$/i;
const FREQUENCY = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(hz|khz|mhz|ghz)$/i;
const FACTORS: Readonly<Record<string, number>> = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 };
const KNOWN_KEYS = ['v', 'load', 'r', 'x', 'z0', 'f', 'vf', 'stub', 'solution'] as const;

function scalar(value: number): string {
  return String(Object.is(value, -0) ? 0 : value);
}

function parseScalar(value: string | null): number | null {
  if (value === null || !NUMBER.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseFrequency(value: string | null): number | null {
  if (!value) return null;
  const match = FREQUENCY.exec(value.trim());
  if (!match) return null;
  const numeric = Number(match[1]);
  const factor = FACTORS[match[2]!.toLowerCase()]!;
  const result = numeric * factor;
  return Number.isFinite(result) && result > 0 ? result : null;
}

export function formatFrequency(value: number): string {
  for (const [suffix, factor] of [
    ['GHz', 1e9],
    ['MHz', 1e6],
    ['kHz', 1e3],
    ['Hz', 1],
  ] as const) {
    const scaled = value / factor;
    if (factor !== 1 && scaled < 1) continue;
    const candidate = `${scalar(scaled)}${suffix}`;
    if (parseFrequency(candidate) === value) return candidate;
  }
  return `${scalar(value)}Hz`;
}

function duplicateKeys(params: URLSearchParams): ReadonlySet<string> {
  return new Set(KNOWN_KEYS.filter((key) => params.getAll(key).length > 1));
}

function parseV1(params: URLSearchParams, warnings: string[]): CalculationState {
  const duplicates = duplicateKeys(params);
  let calculation = DEFAULT_CALCULATION;

  if (duplicates.has('load')) warnings.push('Duplicate load parameter was replaced.');
  else if (params.has('load')) {
    if (params.get('load') === 'open') calculation = { ...calculation, load: { kind: 'open' } };
    else warnings.push('Invalid load parameter was replaced.');
  } else {
    const duplicateLoadParts = duplicates.has('r') || duplicates.has('x');
    if (duplicateLoadParts) warnings.push('Duplicate load parameters were replaced.');
    else if (params.has('r') || params.has('x')) {
      const defaultLoad = DEFAULT_CALCULATION.load;
      const defaultR = defaultLoad.kind === 'finite' ? defaultLoad.impedanceOhms.re : 35;
      const defaultX = defaultLoad.kind === 'finite' ? defaultLoad.impedanceOhms.im : -22;
      const r = params.has('r') ? parseScalar(params.get('r')) : defaultR;
      const x = params.has('x') ? parseScalar(params.get('x')) : defaultX;
      if (r !== null && x !== null)
        calculation = { ...calculation, load: { kind: 'finite', impedanceOhms: { re: r, im: x } } };
      else warnings.push('Invalid load parameters were replaced with defaults.');
    }
  }

  if (duplicates.has('z0')) warnings.push('Duplicate characteristic impedance was replaced.');
  else if (params.has('z0')) {
    const z0 = parseScalar(params.get('z0'));
    if (z0 !== null && z0 > 0) calculation = { ...calculation, characteristicImpedanceOhms: z0 };
    else warnings.push('Invalid characteristic impedance was replaced.');
  }

  if (duplicates.has('f')) warnings.push('Duplicate frequency was replaced.');
  else if (params.has('f')) {
    const frequency = parseFrequency(params.get('f'));
    if (frequency !== null) calculation = { ...calculation, frequencyHz: frequency };
    else warnings.push('Invalid frequency was replaced.');
  }

  if (duplicates.has('vf')) warnings.push('Duplicate velocity factor was replaced.');
  else if (params.has('vf')) {
    const velocityFactor = parseScalar(params.get('vf'));
    if (velocityFactor !== null && velocityFactor > 0 && velocityFactor <= 1)
      calculation = { ...calculation, velocityFactor };
    else warnings.push('Invalid velocity factor was replaced.');
  }

  if (duplicates.has('stub')) warnings.push('Duplicate stub termination was replaced.');
  else if (params.has('stub')) {
    const stub = params.get('stub');
    if (stub === 'shunt-open' || stub === 'shunt-short')
      calculation = { ...calculation, termination: stub === 'shunt-open' ? 'open' : 'short' };
    else warnings.push('Invalid stub termination was replaced.');
  }

  if (duplicates.has('solution')) warnings.push('Duplicate selected solution was replaced.');
  else if (params.has('solution')) {
    const solution = params.get('solution');
    if (solution === 'A' || solution === 'B')
      calculation = { ...calculation, selectedSolution: solution };
    else warnings.push('Invalid selected solution was replaced.');
  }
  return calculation;
}

export function parseUrlState(search: string): {
  state: WorkspaceState;
  warnings: readonly string[];
} {
  const params = new URLSearchParams(search);
  const warnings: string[] = [];
  if (params.getAll('v').length > 1) {
    warnings.push('Duplicate URL version; calculation defaults were restored.');
    return { state: DEFAULT_WORKSPACE, warnings };
  }
  const version = params.get('v');
  if (version !== null && version !== '1') {
    warnings.push('Unsupported URL version; calculation defaults were restored.');
    return { state: DEFAULT_WORKSPACE, warnings };
  }
  return {
    state: { ...DEFAULT_WORKSPACE, calculation: parseV1(params, warnings) },
    warnings,
  };
}

export function serializeUrlState(calculation: CalculationState): string {
  const params = new URLSearchParams();
  params.set('v', '1');
  if (calculation.load.kind === 'open') params.set('load', 'open');
  else {
    params.set('r', scalar(calculation.load.impedanceOhms.re));
    params.set('x', scalar(calculation.load.impedanceOhms.im));
  }
  params.set('z0', scalar(calculation.characteristicImpedanceOhms));
  params.set('f', formatFrequency(calculation.frequencyHz));
  params.set('vf', scalar(calculation.velocityFactor));
  params.set('stub', `shunt-${calculation.termination}`);
  params.set('solution', calculation.selectedSolution);
  return `?${params.toString()}`;
}
