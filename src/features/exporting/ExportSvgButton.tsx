import { Download } from 'lucide-react';
import { serializeChart, type ChartExportMetadata } from './serializeChart';

export function ExportSvgButton({
  metadata,
  disabled = false,
}: {
  readonly metadata: ChartExportMetadata;
  readonly disabled?: boolean;
}) {
  const save = () => {
    const svg = document.querySelector<SVGSVGElement>('[data-export-chart]');
    if (!svg) return;
    const blob = new Blob([serializeChart(svg, metadata)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smith-match.svg';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return (
    <button type="button" disabled={disabled} onClick={save} className="icon-button">
      <Download size={16} aria-hidden="true" /> Export SVG
    </button>
  );
}
