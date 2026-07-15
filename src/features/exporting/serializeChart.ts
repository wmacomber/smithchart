export function serializeChart(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent =
    '.smith-background{fill:#fff}.smith-boundary{fill:none;stroke:#1b3448;stroke-width:2}.smith-grid{fill:none;stroke:#789}.smith-grid-line{fill:none;stroke:inherit}.grid-minor{stroke-width:.65}.grid-major,.grid-axis{stroke:#31576c;stroke-width:1.15}.admittance-grid{stroke:#9b6f48}.secondary-grid{opacity:.45;stroke-dasharray:3 3}.solution-path,.stub-path,.swr-circle{fill:none;stroke:#086c9f;stroke-width:3}.stub-path{stroke-dasharray:7 4}.load-marker{fill:#c0362c;stroke:#fff;stroke-width:2}.smith-labels{font:11px sans-serif;fill:#263746;text-anchor:middle}.label-secondary{opacity:.45}.direction-arrow{fill:#086c9f}.marker-hit-target,[data-layer="interaction-overlay"]{display:none}';
  clone.prepend(style);
  return new XMLSerializer().serializeToString(clone);
}
