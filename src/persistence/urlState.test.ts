import { describe, expect, it } from 'vitest';
import { parseUrlState, serializeUrlState } from './urlState';
describe('URL state', () => {
  it('parses canonical units and round trips', () => {
    const parsed = parseUrlState(
      '?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=B',
    );
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state.frequencyHz).toBe(14.2e6);
    expect(serializeUrlState(parsed.state)).toBe(
      '?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=B',
    );
  });
  it('represents exact open without infinity', () =>
    expect(parseUrlState('?load=open').state.load).toEqual({ kind: 'open' }));
  it('warns and defaults invalid known values', () =>
    expect(parseUrlState('?z0=0&f=nope').warnings.length).toBe(2));
});
