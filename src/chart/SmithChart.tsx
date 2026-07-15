import { CHART_SIZE } from './chartGeometry';
import type { SmithChartProps } from './chartTypes';
import { LoadMarker } from './LoadMarker';
import { SmithGrid } from './SmithGrid';
import { SmithLabels } from './SmithLabels';
import { StubPath } from './StubPath';
import { TransformationPath } from './TransformationPath';

export function SmithChart(props: SmithChartProps) {
  const selected = props.solutions?.find((solution) => solution.id === props.selectedSolution);
  return (
    <svg
      className="smith-chart"
      viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
      role="group"
      aria-labelledby="chart-title"
      aria-describedby="chart-description"
      data-export-chart
    >
      <title id="chart-title">Interactive Smith chart</title>
      <defs>
        <marker
          id="direction-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g data-layer="background" />
      <g data-layer="resistance-grid">
        <SmithGrid displayMode={props.displayMode} />
      </g>
      <g data-layer="labels">
        <SmithLabels />
      </g>
      <g data-layer="swr-circle" />
      <g data-layer="solution-paths">
        {selected && (
          <g key={selected.id}>
            <TransformationPath load={props.loadReflection} solution={selected} />
            <StubPath solution={selected} />
          </g>
        )}
      </g>
      <g data-layer="markers">
        <LoadMarker
          reflection={props.loadReflection}
          onPreview={props.onLoadPreview}
          onCommit={props.onLoadCommit}
          onCancel={props.onLoadCancel}
        />
      </g>
      <g data-layer="interaction-overlay" />
    </svg>
  );
}
