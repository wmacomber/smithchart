import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES } from '../app/workspaceReducer';
import { loadPreferences, savePreferences } from './preferences';

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('preferences', () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  it('saves a versioned preferences-only payload', () => {
    savePreferences({ ...DEFAULT_PREFERENCES, frequencyUnit: 'GHz' });
    expect(JSON.parse(storage.getItem('smith-match-preferences-v2')!)).toEqual({
      version: 2,
      ...DEFAULT_PREFERENCES,
      frequencyUnit: 'GHz',
    });
  });

  it('validates fields independently', () => {
    storage.setItem(
      'smith-match-preferences-v2',
      JSON.stringify({ version: 2, theme: 'dark', displayMode: 'bad', gridSnapping: true }),
    );
    expect(loadPreferences()).toEqual({ theme: 'dark', gridSnapping: true });
  });

  it('migrates the existing v1 payload when v2 is absent', () => {
    storage.setItem(
      'smith-match-preferences-v1',
      JSON.stringify({ theme: 'light', lengthUnit: 'ft', animationEnabled: false }),
    );
    expect(loadPreferences()).toEqual({
      theme: 'light',
      lengthUnit: 'ft',
      animationEnabled: false,
    });
  });

  it('survives malformed or denied storage', () => {
    storage.setItem('smith-match-preferences-v2', '{');
    expect(loadPreferences()).toEqual({});
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(loadPreferences()).toEqual({});
    expect(() => savePreferences(DEFAULT_PREFERENCES)).not.toThrow();
  });
});
