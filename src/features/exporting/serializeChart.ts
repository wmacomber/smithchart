export interface ChartExportMetadata {
  readonly schemaVersion: 1;
  readonly application: {
    readonly name: 'Smith Match';
    readonly version: string;
  };
  readonly model: {
    readonly kind: 'lossless-single-frequency-shunt-stub';
    readonly termination: 'open' | 'short';
  };
  readonly calculation: {
    readonly load:
      | { readonly kind: 'open' }
      | {
          readonly kind: 'finite';
          readonly impedanceOhms: { readonly re: number; readonly im: number };
        };
    readonly characteristicImpedanceOhms: number;
    readonly frequencyHz: number;
    readonly velocityFactor: number;
  };
  readonly chart: {
    readonly displayMode: 'impedance' | 'admittance' | 'both';
    readonly solutionView: 'selected' | 'overlay';
  };
  readonly result: {
    readonly status:
      'solved' | 'matched' | 'no-passive-solution' | 'invalid-input' | 'numerical-failure';
    readonly selectedSolution: 'A' | 'B';
    readonly instructions: readonly string[];
  };
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const EXPORTED_STYLE = `
.smith-chart{display:block;width:800px;height:800px;max-width:100%;background:#fff;color-scheme:light;font-family:system-ui,sans-serif}
.smith-background{fill:#fff}
.smith-boundary{fill:none;stroke:#1b3448;stroke-width:2}
.smith-grid,.smith-grid-line{fill:none;stroke:#789}
.grid-minor{stroke-width:.65}
.grid-major,.grid-axis{stroke:#31576c;stroke-width:1.15}
.admittance-grid{stroke:#9b6f48}
.secondary-grid{opacity:.45;stroke-dasharray:3 3}
.smith-labels{font:11px system-ui,sans-serif;fill:#263746;text-anchor:middle}
.label-secondary{opacity:.45}
.swr-circle{fill:none;stroke:#31576c;stroke-width:2;stroke-dasharray:4 5}
.matching-solution.is-alternate{opacity:.78}
.solution-selection-halo{fill:none;stroke:#fff;stroke-width:7}
.solution-path,.stub-path{fill:none;stroke:#086c9f;stroke-width:3}
.solution-b .solution-path,.solution-b .stub-path{stroke:#b45f06}
.solution-b .feed-line-path{stroke-dasharray:10 5}
.stub-path{stroke-dasharray:7 4}
.junction-marker{fill:#086c9f;stroke:#fff;stroke-width:2}
.solution-b .junction-marker{fill:#b45f06}
.matching-annotation,.junction-label{font:8px system-ui,sans-serif;fill:#086c9f;stroke:#fff;stroke-width:3;paint-order:stroke;text-anchor:middle}
.solution-b .matching-annotation,.solution-b .junction-label{fill:#b45f06}
.center-match-marker{fill:#fff;stroke:#31576c;stroke-width:2}
.center-match-marker path{fill:none}
.load-marker{fill:#c0362c;stroke:#fff;stroke-width:2}
.direction-arrow.solution-a{fill:#086c9f}
.direction-arrow.solution-b{fill:#b45f06}
`.trim();

const ACTIVE_CONTENT =
  'script,foreignObject,a,image,use,iframe,object,embed,audio,video,style,link,animate,animateMotion,animateTransform,set,discard,mpath,feImage';
const INTERNAL_URL = /^url\(\s*#[A-Za-z_][A-Za-z0-9_.:-]*\s*\)$/i;
const EXTERNAL_VALUE = /(?:\bjavascript:|\bdata:|https?:|\/\/)/i;

function sanitizeElement(element: Element): void {
  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value.trim();
    if (
      name.startsWith('on') ||
      name.startsWith('data-') ||
      name === 'style' ||
      name === 'href' ||
      name === 'xlink:href' ||
      name === 'tabindex' ||
      (name !== 'xmlns' && EXTERNAL_VALUE.test(value)) ||
      (/url\(/i.test(value) && !INTERNAL_URL.test(value))
    ) {
      element.removeAttribute(attribute.name);
    }
  }
}

function exportDescription(metadata: ChartExportMetadata): string {
  if (metadata.result.status === 'solved') {
    return `Lossless single-frequency ${metadata.model.termination}-circuited shunt-stub match. Solution ${metadata.result.selectedSolution} selected.`;
  }
  return `Smith chart calculation status: ${metadata.result.status}.`;
}

export function serializeChart(svg: SVGSVGElement, metadata: ChartExportMetadata): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NAMESPACE);
  clone.setAttribute('width', '800');
  clone.setAttribute('height', '800');
  clone.setAttribute('role', 'img');
  clone
    .querySelectorAll(
      `${ACTIVE_CONTENT},.marker-hit-container,.load-marker-focus-ring,.load-marker-tooltip,.sr-only-svg,[data-layer="interaction-overlay"]`,
    )
    .forEach((element) => element.remove());

  sanitizeElement(clone);
  clone.querySelectorAll('*').forEach(sanitizeElement);

  let title: Element | null = clone.querySelector('title');
  if (!title) {
    title = document.createElementNS(SVG_NAMESPACE, 'title');
    clone.prepend(title);
  }
  title.id = 'smith-match-export-title';
  title.textContent = 'Smith Match chart';

  let description: Element | null = clone.querySelector('desc');
  if (!description) {
    description = document.createElementNS(SVG_NAMESPACE, 'desc');
    title.after(description);
  }
  description.id = 'smith-match-export-description';
  description.textContent = exportDescription(metadata);
  clone.setAttribute('aria-labelledby', title.id);
  clone.setAttribute('aria-describedby', description.id);

  const metadataElement = document.createElementNS(SVG_NAMESPACE, 'metadata');
  metadataElement.id = 'smith-match-metadata';
  metadataElement.setAttribute('data-format', 'application/json');
  metadataElement.textContent = JSON.stringify(metadata, null, 2);
  description.after(metadataElement);

  const style = document.createElementNS(SVG_NAMESPACE, 'style');
  style.textContent = EXPORTED_STYLE;
  metadataElement.after(style);

  return new XMLSerializer().serializeToString(clone);
}
