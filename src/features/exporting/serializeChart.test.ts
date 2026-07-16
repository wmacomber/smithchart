// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { serializeChart, type ChartExportMetadata } from './serializeChart';

const metadata: ChartExportMetadata = {
  schemaVersion: 1,
  application: { name: 'Smith Match', version: '1.2.3' },
  model: { kind: 'lossless-single-frequency-shunt-stub', termination: 'short' },
  calculation: {
    load: { kind: 'finite', impedanceOhms: { re: 35, im: -22 } },
    characteristicImpedanceOhms: 50,
    frequencyHz: 14_200_000,
    velocityFactor: 0.66,
  },
  chart: { displayMode: 'both', solutionView: 'overlay' },
  result: {
    status: 'solved',
    selectedSolution: 'A',
    instructions: ['Solution A\nMove toward transmitter.', 'Solution B\nUse alternate.'],
  },
};

function parse(serialized: string): SVGSVGElement {
  const document = new DOMParser().parseFromString(serialized, 'image/svg+xml');
  return document.documentElement as unknown as SVGSVGElement;
}

describe('serializeChart', () => {
  it('preserves chart geometry and embeds standalone style and metadata', () => {
    document.body.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" data-export-chart>
        <title id="old-title">Old title</title><desc id="old-desc">Old description</desc>
        <defs><clipPath id="boundary"><circle cx="400" cy="400" r="380" /></clipPath>
          <marker id="arrow"><path d="M0 0L10 5L0 10z" /></marker></defs>
        <g clip-path="url(#boundary)"><path class="solution-path" marker-end="url(#arrow)" d="M1 2L3 4" /></g>
      </svg>`;
    const svg = document.querySelector('svg') as SVGSVGElement;
    const serialized = serializeChart(svg, metadata);
    const exported = parse(serialized);

    expect(exported.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(exported.getAttribute('width')).toBe('800');
    expect(exported.getAttribute('height')).toBe('800');
    expect(exported.querySelector('.solution-path')?.getAttribute('marker-end')).toBe(
      'url(#arrow)',
    );
    expect(exported.querySelector('[clip-path]')?.getAttribute('clip-path')).toBe('url(#boundary)');
    expect(exported.querySelectorAll('style')).toHaveLength(1);
    expect(exported.querySelector('style')?.textContent).toContain('.smith-chart');
    expect(exported.querySelector('title')?.textContent).toBe('Smith Match chart');
    expect(exported.querySelector('desc')?.textContent).toContain('Solution A selected');

    const metadataElement = exported.querySelector('#smith-match-metadata');
    expect(metadataElement?.getAttribute('data-format')).toBe('application/json');
    expect(JSON.parse(metadataElement?.textContent ?? '')).toEqual(metadata);
    expect(svg.hasAttribute('data-export-chart')).toBe(true);
  });

  it('removes active content and external references from hostile source markup', () => {
    document.body.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" onload="alert(1)" style="background:url(https://bad.invalid/x)">
        <style>@import url(https://bad.invalid/x.css)</style>
        <script>alert(1)</script>
        <foreignObject><div>unsafe</div></foreignObject>
        <a href="https://bad.invalid/"><text>link</text></a>
        <image href="data:image/svg+xml,bad" />
        <animate attributeName="href" values="https://bad.invalid/" />
        <circle data-private="x" tabindex="0" onclick="alert(1)" filter="url(https://bad.invalid/filter)" />
      </svg>`;
    const serialized = serializeChart(document.querySelector('svg') as SVGSVGElement, metadata);
    const exported = parse(serialized);

    expect(exported.querySelectorAll('script,foreignObject,a,image,use,link,animate')).toHaveLength(
      0,
    );
    expect(exported.querySelectorAll('style')).toHaveLength(1);
    expect(serialized).not.toContain('bad.invalid');
    expect(serialized).not.toContain('onclick');
    expect(serialized).not.toContain('onload');
    expect(serialized).not.toContain('tabindex');
    expect(serialized).not.toContain('data-private');
  });
});
