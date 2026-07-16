import { serializeChart } from './serializeChart';
import { Download } from 'lucide-react';
export function ExportSvgButton({ disabled = false }: { readonly disabled?: boolean }) {
  const save = () => {
    const svg = document.querySelector<SVGSVGElement>('[data-export-chart]');
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([serializeChart(svg)], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smith-match.svg';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" disabled={disabled} onClick={save} className="icon-button">
      <Download size={16} aria-hidden="true" /> Export SVG
    </button>
  );
}
