export function serializeChart(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone
    .querySelectorAll(
      '.marker-hit-container,.load-marker-focus-ring,.load-marker-tooltip,.sr-only-svg,[data-layer="interaction-overlay"]',
    )
    .forEach((element) => element.remove());
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent =
    '.smith-background{fill:#fff}.smith-boundary{fill:none;stroke:#1b3448;stroke-width:2}.smith-grid{fill:none;stroke:#789}.smith-grid-line{fill:none;stroke:inherit}.grid-minor{stroke-width:.65}.grid-major,.grid-axis{stroke:#31576c;stroke-width:1.15}.admittance-grid{stroke:#9b6f48}.secondary-grid{opacity:.45;stroke-dasharray:3 3}.swr-circle{fill:none;stroke:#31576c;stroke-width:2;stroke-dasharray:4 5}.solution-selection-halo{fill:none;stroke:#fff;stroke-width:7}.solution-path,.stub-path{fill:none;stroke:#086c9f;stroke-width:3}.solution-b .solution-path,.solution-b .stub-path{stroke:#b45f06}.solution-b .solution-path{stroke-dasharray:10 5}.stub-path{stroke-dasharray:7 4}.junction-marker{fill:#086c9f;stroke:#fff;stroke-width:2}.solution-b .junction-marker{fill:#b45f06}.matching-annotation,.junction-label{font:8px sans-serif;fill:#086c9f;stroke:#fff;stroke-width:3;paint-order:stroke;text-anchor:middle}.solution-b .matching-annotation,.solution-b .junction-label{fill:#b45f06}.center-match-marker{fill:#fff;stroke:#31576c;stroke-width:2}.center-match-marker path{fill:none}.load-marker{fill:#c0362c;stroke:#fff;stroke-width:2}.smith-labels{font:11px sans-serif;fill:#263746;text-anchor:middle}.label-secondary{opacity:.45}.direction-arrow.solution-a{fill:#086c9f}.direction-arrow.solution-b{fill:#b45f06}';
  clone.prepend(style);
  return new XMLSerializer().serializeToString(clone);
}
