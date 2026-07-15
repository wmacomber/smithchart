import { Fragment, memo } from 'react';
import { CHART_CENTER, CHART_RADIUS, reactanceArc, resistanceCircle } from './chartGeometry';
import { GRID_DEFINITIONS, isMajorGridValue } from './gridDefinitions';
import { lowerGridDensity } from './gridDensity';
import type { ChartCircle, ChartDisplayMode, GridDensity } from './chartTypes';

interface GridGeometry {
  readonly resistances: readonly { readonly value: number; readonly circle: ChartCircle }[];
  readonly reactances: readonly { readonly value: number; readonly path: string }[];
}

const geometryCache = new Map<GridDensity, GridGeometry>();

const geometryForDensity = (density: GridDensity): GridGeometry => {
  const cached = geometryCache.get(density);
  if (cached) return cached;
  const definition = GRID_DEFINITIONS[density];
  const geometry = Object.freeze({
    resistances: Object.freeze(
      definition.resistances.map((value) =>
        Object.freeze({ value, circle: Object.freeze(resistanceCircle(value)) }),
      ),
    ),
    reactances: Object.freeze(
      definition.reactances.flatMap((magnitude) =>
        [magnitude, -magnitude].map((value) =>
          Object.freeze({ value, path: reactanceArc(value).path }),
        ),
      ),
    ),
  });
  geometryCache.set(density, geometry);
  return geometry;
};

function Axis() {
  return (
    <line
      className="smith-grid-line grid-axis"
      x1={CHART_CENTER - CHART_RADIUS}
      y1={CHART_CENTER}
      x2={CHART_CENTER + CHART_RADIUS}
      y2={CHART_CENTER}
    />
  );
}

function ResistanceCurves({ geometry }: { readonly geometry: GridGeometry }) {
  return geometry.resistances.map(({ value, circle }) => (
    <circle
      key={`r-${value}`}
      className={`smith-grid-line resistance-curve ${isMajorGridValue(value) ? 'grid-major' : 'grid-minor'}`}
      {...circle}
    />
  ));
}

function ReactanceCurves({ geometry }: { readonly geometry: GridGeometry }) {
  return geometry.reactances.map(({ value, path }) => (
    <path
      key={`x-${value}`}
      className={`smith-grid-line reactance-curve ${isMajorGridValue(Math.abs(value)) ? 'grid-major' : 'grid-minor'}`}
      d={path}
    />
  ));
}

export const SmithGrid = memo(function SmithGrid({
  displayMode,
  density,
  clipPathId,
}: {
  readonly displayMode: ChartDisplayMode;
  readonly density: GridDensity;
  readonly clipPathId: string;
}) {
  const impedanceGeometry = geometryForDensity(density);
  const admittanceDensity = displayMode === 'both' ? lowerGridDensity(density) : density;
  const admittanceGeometry = geometryForDensity(admittanceDensity);
  const showImpedance = displayMode !== 'admittance';
  const showAdmittance = displayMode !== 'impedance';

  return (
    <Fragment>
      <g
        data-layer="resistance-grid"
        className="smith-grid impedance-grid"
        clipPath={`url(#${clipPathId})`}
        aria-hidden="true"
      >
        {showImpedance && <Axis />}
        {showImpedance && <ResistanceCurves geometry={impedanceGeometry} />}
      </g>
      <g
        data-layer="reactance-grid"
        className="smith-grid impedance-grid"
        clipPath={`url(#${clipPathId})`}
        aria-hidden="true"
      >
        {showImpedance && <ReactanceCurves geometry={impedanceGeometry} />}
      </g>
      <g
        data-layer="admittance-grid"
        className={`smith-grid admittance-grid ${displayMode === 'both' ? 'secondary-grid' : ''}`}
        clipPath={`url(#${clipPathId})`}
        aria-hidden="true"
      >
        {showAdmittance && (
          <g transform={`rotate(180 ${CHART_CENTER} ${CHART_CENTER})`}>
            <Axis />
            <ResistanceCurves geometry={admittanceGeometry} />
            <ReactanceCurves geometry={admittanceGeometry} />
          </g>
        )}
      </g>
    </Fragment>
  );
});
