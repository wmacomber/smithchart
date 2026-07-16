import { NumberField } from '../../components/NumberField';
import { UnitField } from '../../components/UnitField';
import type { FrequencyUnit, LengthUnit } from '../../app/workspaceTypes';

const FREQUENCY_FACTORS: Readonly<Record<FrequencyUnit, number>> = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
  GHz: 1e9,
};

export function TransmissionLineInputs({
  characteristicImpedanceOhms,
  frequencyHz,
  velocityFactor,
  frequencyUnit,
  lengthUnit,
  onCharacteristicImpedanceCommit,
  onFrequencyCommit,
  onVelocityFactorCommit,
  onFrequencyUnitChange,
  onLengthUnitChange,
}: {
  readonly characteristicImpedanceOhms: number;
  readonly frequencyHz: number;
  readonly velocityFactor: number;
  readonly frequencyUnit: FrequencyUnit;
  readonly lengthUnit: LengthUnit;
  readonly onCharacteristicImpedanceCommit: (value: number) => void;
  readonly onFrequencyCommit: (value: number) => void;
  readonly onVelocityFactorCommit: (value: number) => void;
  readonly onFrequencyUnitChange: (value: FrequencyUnit) => void;
  readonly onLengthUnitChange: (value: LengthUnit) => void;
}) {
  const factor = FREQUENCY_FACTORS[frequencyUnit];
  return (
    <section>
      <h2>Transmission line</h2>
      <NumberField
        label="Characteristic impedance"
        value={characteristicImpedanceOhms}
        unit="Ω"
        isAllowed={(value) => value > 0}
        errorMessage="Enter an impedance greater than zero."
        onCommit={onCharacteristicImpedanceCommit}
      />
      <UnitField
        label="Frequency"
        value={frequencyHz / factor}
        unit={frequencyUnit}
        units={['Hz', 'kHz', 'MHz', 'GHz']}
        isAllowed={(value) => value > 0 && Number.isFinite(value * factor)}
        errorMessage="Enter a frequency greater than zero."
        onCommit={(value) => onFrequencyCommit(value * factor)}
        onUnitChange={onFrequencyUnitChange}
      />
      <NumberField
        label="Velocity factor"
        value={velocityFactor}
        isAllowed={(value) => value > 0 && value <= 1}
        errorMessage="Enter a velocity factor above zero and no more than one."
        onCommit={onVelocityFactorCommit}
      />
      <label className="preference-select">
        <span>Length unit</span>
        <select
          value={lengthUnit}
          onChange={(event) => onLengthUnitChange(event.target.value as LengthUnit)}
        >
          <option value="m">Metres (m)</option>
          <option value="cm">Centimetres (cm)</option>
          <option value="ft">Feet (ft)</option>
          <option value="in">Inches (in)</option>
        </select>
      </label>
    </section>
  );
}
