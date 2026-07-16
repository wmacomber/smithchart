import { complex, type Load } from '../../rf';
import { NumberField } from '../../components/NumberField';
import { SegmentedControl } from '../../components/SegmentedControl';
import type { LoadRepresentation } from '../../app/workspaceTypes';
import { loadToRepresentation, representationToLoad } from './loadRepresentations';

export function LoadInputPanel({
  load,
  characteristicImpedanceOhms,
  representation,
  onRepresentationChange,
  onLoadCommit,
}: {
  readonly load: Load;
  readonly characteristicImpedanceOhms: number;
  readonly representation: LoadRepresentation;
  readonly onRepresentationChange: (value: LoadRepresentation) => void;
  readonly onLoadCommit: (load: Load) => void;
}) {
  const values = loadToRepresentation(load, characteristicImpedanceOhms, representation);
  const labels =
    representation === 'impedance'
      ? (['Resistance', 'Reactance', 'Ω'] as const)
      : representation === 'admittance'
        ? (['Conductance', 'Susceptance', 'S'] as const)
        : (['Magnitude', 'Phase', ''] as const);

  const commitPart = (part: 'first' | 'second', value: number) => {
    if (!values) return;
    const next = representationToLoad(
      representation,
      part === 'first' ? value : values.first,
      part === 'second' ? value : values.second,
      characteristicImpedanceOhms,
    );
    if (next) onLoadCommit(next);
  };

  return (
    <section>
      <h2>Load</h2>
      <SegmentedControl
        label="Entry representation"
        value={representation}
        options={[
          { value: 'impedance', label: 'Z', accessibleLabel: 'Impedance' },
          { value: 'admittance', label: 'Y', accessibleLabel: 'Admittance' },
          { value: 'reflection', label: 'Γ', accessibleLabel: 'Reflection coefficient' },
        ]}
        onChange={onRepresentationChange}
      />
      {load.kind === 'open' ? (
        <div className="open-load">
          <strong>Exact open circuit</strong>
          <button
            type="button"
            onClick={() =>
              onLoadCommit({
                kind: 'finite',
                impedanceOhms: complex(characteristicImpedanceOhms, 0),
              })
            }
          >
            Enter finite load
          </button>
        </div>
      ) : values ? (
        <>
          <NumberField
            key={`${representation}-first`}
            label={labels[0]}
            value={values.first}
            unit={labels[2]}
            isAllowed={representation === 'reflection' ? (value) => value >= 0 : undefined}
            errorMessage="Enter a magnitude of zero or greater."
            onCommit={(value) => commitPart('first', value)}
          />
          <NumberField
            key={`${representation}-second`}
            label={labels[1]}
            value={values.second}
            unit={representation === 'reflection' ? '°' : labels[2]}
            onCommit={(value) => commitPart('second', value)}
          />
        </>
      ) : (
        <p className="field-error" role="status">
          This load cannot be represented with finite values in the selected mode.
        </p>
      )}
      <button type="button" className="text-button" onClick={() => onLoadCommit({ kind: 'open' })}>
        Set exact open
      </button>
    </section>
  );
}
