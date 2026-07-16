import { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SmithChart } from '../SmithChart';
import {
  complex,
  hertz,
  impedanceToReflection,
  normalizeImpedance,
  ohms,
  solveShuntStub,
} from '../../rf';

const layerNames = (markup: string): readonly string[] =>
  [...markup.matchAll(/data-layer="([^"]+)"/g)].map((match) => match[1]!);

describe('static Smith chart SVG', () => {
  it('renders accessible export-safe markup in exact layer order', () => {
    const markup = renderToStaticMarkup(
      <SmithChart
        displayMode="both"
        density="dense"
        accessibleTitle="Verification chart"
        accessibleDescription="Geometry verification fixture."
      />,
    );
    expect(markup).toContain('<svg');
    expect(markup).toContain('role="img"');
    expect(markup).toContain('<title');
    expect(markup).toContain('Verification chart</title>');
    expect(markup).toContain('<desc');
    expect(markup).toContain('data-export-chart="true"');
    expect(markup).toContain('data-density="dense"');
    expect(layerNames(markup)).toEqual([
      'background',
      'resistance-grid',
      'reactance-grid',
      'admittance-grid',
      'labels',
      'swr-circle',
      'solution-paths',
      'markers',
      'interaction-overlay',
      'boundary',
    ]);
    expect(markup).not.toContain('tabindex');
    expect(markup).not.toMatch(/<(?:image|foreignObject)\b/);
    expect(markup).not.toMatch(/(?:href|src)="https?:/);
  });

  it('creates unique definition and accessible IDs for multiple instances', () => {
    const markup = renderToStaticMarkup(
      <Fragment>
        <SmithChart displayMode="impedance" density="compact" />
        <SmithChart displayMode="admittance" density="compact" />
      </Fragment>,
    );
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    expect(new Set(ids).size).toBe(ids.length);
    expect((markup.match(/<title/g) ?? []).length).toBe(2);
    expect((markup.match(/<desc/g) ?? []).length).toBe(2);
  });

  it('keeps dense combined static node count below the performance budget', () => {
    const markup = renderToStaticMarkup(<SmithChart displayMode="both" density="dense" />);
    const renderedNodes = (markup.match(/<(?:circle|path|line|text)\b/g) ?? []).length;
    expect(renderedNodes).toBeLessThan(100);
  });

  it('renders both intersections and selected or overlay solution paths', () => {
    const result = solveShuntStub({
      load: { kind: 'finite', impedanceOhms: complex(35, -22) },
      characteristicImpedanceOhms: ohms(50),
      frequencyHz: hertz(14.2e6),
      velocityFactor: 0.66,
      termination: 'short',
    });
    expect(result.status).toBe('solved');
    if (result.status !== 'solved') return;
    const selected = renderToStaticMarkup(
      <SmithChart
        displayMode="both"
        density="dense"
        loadReflection={impedanceToReflection(normalizeImpedance(complex(35, -22), ohms(50)))}
        solutions={result.solutions}
        selectedSolution="A"
        solutionView="selected"
        termination="short"
      />,
    );
    expect((selected.match(/class="solution-path/g) ?? []).length).toBe(1);
    expect(selected).toContain('data-solution="A"');
    expect(selected).toContain('data-solution="B"');
    const overlay = renderToStaticMarkup(
      <SmithChart
        displayMode="both"
        density="dense"
        loadReflection={impedanceToReflection(normalizeImpedance(complex(35, -22), ohms(50)))}
        solutions={result.solutions}
        selectedSolution="A"
        solutionView="overlay"
        termination="short"
      />,
    );
    expect((overlay.match(/class="solution-path/g) ?? []).length).toBe(2);
    expect((overlay.match(/class="stub-path/g) ?? []).length).toBe(2);
  });
});
