import { DEFAULT_WORKSPACE } from '../app/workspaceReducer';
import type { WorkspaceState } from '../app/workspaceTypes';

const FREQUENCY = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(hz|khz|mhz|ghz)$/i;
const FACTORS: Record<string, number> = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 };

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
  ] as const) {
    const scaled = value / factor;
    if (scaled >= 1 && Number.isInteger(scaled * 1e6))
      return `${Number(scaled.toFixed(6))}${suffix}`;
  }
  return `${value}Hz`;
}

export function parseUrlState(search: string): {
  state: WorkspaceState;
  warnings: readonly string[];
} {
  const params = new URLSearchParams(search);
  const warnings: string[] = [];
  let state = DEFAULT_WORKSPACE;
  if (params.has('v') && params.get('v') !== '1')
    warnings.push('Unsupported URL version; compatible values were restored where possible.');
  if (params.get('load') === 'open') state = { ...state, load: { kind: 'open' } };
  else {
    const defaultR = state.load.kind === 'finite' ? state.load.impedanceOhms.re : 35;
    const defaultX = state.load.kind === 'finite' ? state.load.impedanceOhms.im : -22;
    const r = Number(params.get('r') ?? defaultR);
    const x = Number(params.get('x') ?? defaultX);
    if (Number.isFinite(r) && Number.isFinite(x))
      state = { ...state, load: { kind: 'finite', impedanceOhms: { re: r, im: x } } };
    else warnings.push('Invalid load parameters were replaced with defaults.');
  }
  const z0 = params.has('z0') ? Number(params.get('z0')) : state.characteristicImpedanceOhms;
  if (Number.isFinite(z0) && z0 > 0) state = { ...state, characteristicImpedanceOhms: z0 };
  else warnings.push('Invalid characteristic impedance was replaced.');
  if (params.has('f')) {
    const frequency = parseFrequency(params.get('f'));
    if (frequency) state = { ...state, frequencyHz: frequency };
    else warnings.push('Invalid frequency was replaced.');
  }
  const vf = params.has('vf') ? Number(params.get('vf')) : state.velocityFactor;
  if (Number.isFinite(vf) && vf > 0 && vf <= 1) state = { ...state, velocityFactor: vf };
  else warnings.push('Invalid velocity factor was replaced.');
  const stub = params.get('stub');
  if (stub === 'shunt-open' || stub === 'shunt-short')
    state = { ...state, termination: stub === 'shunt-open' ? 'open' : 'short' };
  const solution = params.get('solution');
  if (solution === 'A' || solution === 'B') state = { ...state, selectedSolution: solution };
  return { state, warnings };
}

export function serializeUrlState(state: WorkspaceState): string {
  const params = new URLSearchParams();
  params.set('v', '1');
  if (state.load.kind === 'open') params.set('load', 'open');
  else {
    params.set('r', String(state.load.impedanceOhms.re));
    params.set('x', String(state.load.impedanceOhms.im));
  }
  params.set('z0', String(state.characteristicImpedanceOhms));
  params.set('f', formatFrequency(state.frequencyHz));
  params.set('vf', String(state.velocityFactor));
  params.set('stub', `shunt-${state.termination}`);
  params.set('solution', state.selectedSolution);
  return `?${params.toString()}`;
}
