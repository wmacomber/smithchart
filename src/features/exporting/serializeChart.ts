export function serializeChart(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent =
    '.smith-boundary{fill:#fff;stroke:#1b3448;stroke-width:2}.smith-grid{fill:none;stroke:#789;stroke-width:.7}.admittance-grid{stroke:#9b6f48}.secondary{opacity:.45}.solution-path{fill:none;stroke:#086c9f;stroke-width:3}.stub-path{fill:none;stroke:#b45f06;stroke-width:3}.load-marker{fill:#c0362c;stroke:#fff;stroke-width:2}.smith-labels{font:12px sans-serif;fill:#263746}';
  clone.prepend(style);
  return new XMLSerializer().serializeToString(clone);
}
