import type {
  DisplayMode,
  FrequencyUnit,
  LengthUnit,
  LoadRepresentation,
  Theme,
  SolutionView,
  WorkspacePreferences,
} from '../app/workspaceTypes';

const V1_KEY = 'smith-match-preferences-v1';
const V2_KEY = 'smith-match-preferences-v2';
const V3_KEY = 'smith-match-preferences-v3';
const V4_KEY = 'smith-match-preferences-v4';

type JsonRecord = Record<string, unknown>;
type MutablePartialPreferences = {
  -readonly [Key in keyof WorkspacePreferences]?: WorkspacePreferences[Key];
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.includes(value as T);
}

function validatePreferences(value: unknown): Partial<WorkspacePreferences> {
  if (!isRecord(value)) return {};
  const result: MutablePartialPreferences = {};
  if (
    oneOf<LoadRepresentation>(value.loadRepresentation, ['impedance', 'admittance', 'reflection'])
  )
    result.loadRepresentation = value.loadRepresentation;
  if (oneOf<DisplayMode>(value.displayMode, ['impedance', 'admittance', 'both']))
    result.displayMode = value.displayMode;
  if (oneOf<LengthUnit>(value.lengthUnit, ['m', 'cm', 'ft', 'in']))
    result.lengthUnit = value.lengthUnit;
  if (oneOf<FrequencyUnit>(value.frequencyUnit, ['Hz', 'kHz', 'MHz', 'GHz']))
    result.frequencyUnit = value.frequencyUnit;
  if (oneOf<Theme>(value.theme, ['system', 'light', 'dark'])) result.theme = value.theme;
  if (typeof value.animationEnabled === 'boolean') result.animationEnabled = value.animationEnabled;
  if (typeof value.gridSnapping === 'boolean') result.gridSnapping = value.gridSnapping;
  if (oneOf<SolutionView>(value.solutionView, ['selected', 'overlay']))
    result.solutionView = value.solutionView;
  if (typeof value.firstUseDismissed === 'boolean')
    result.firstUseDismissed = value.firstUseDismissed;
  return result;
}

function readJson(key: string): unknown {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}

export function loadPreferences(): Partial<WorkspacePreferences> {
  try {
    const v4 = readJson(V4_KEY);
    if (v4 !== null) return isRecord(v4) && v4.version === 4 ? validatePreferences(v4) : {};
    const v3 = readJson(V3_KEY);
    if (v3 !== null) return isRecord(v3) && v3.version === 3 ? validatePreferences(v3) : {};
    const v2 = readJson(V2_KEY);
    if (v2 !== null) return isRecord(v2) && v2.version === 2 ? validatePreferences(v2) : {};
    return validatePreferences(readJson(V1_KEY));
  } catch {
    return {};
  }
}

export function savePreferences(preferences: WorkspacePreferences): void {
  try {
    localStorage.setItem(V4_KEY, JSON.stringify({ version: 4, ...preferences }));
  } catch {
    /* Storage may be unavailable; calculation remains functional. */
  }
}
