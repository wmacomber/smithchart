import { NumberField } from '../../components/NumberField';
import { UnitField } from '../../components/UnitField';
import type { FrequencyUnit, LengthUnit } from '../../app/workspaceTypes';
import { HelpTip } from '../../components/Tooltip';

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
  onDraftValidityChange,
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
  readonly onDraftValidityChange?: (fieldId: string, invalid: boolean) => void;
}) {
  const factor = FREQUENCY_FACTORS[frequencyUnit];
  return (
    <section>
      <h2>Transmission line</h2>
      <NumberField
        label="Characteristic impedance (Z₀)"
        value={characteristicImpedanceOhms}
        unit="Ω"
        unitLabel="ohms"
        isAllowed={(value) => value > 0}
        errorMessage="Enter an impedance greater than zero."
        onCommit={onCharacteristicImpedanceCommit}
        helpText="Z₀ is the transmission line reference impedance used to normalize the load."
        fieldId="characteristic-impedance"
        onDraftValidityChange={onDraftValidityChange}
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
        helpText="Frequency sets wavelength. The unit selector converts Hz, kHz, MHz, or GHz without changing the physical frequency."
        fieldId="frequency"
        onDraftValidityChange={onDraftValidityChange}
      />
      <NumberField
        label="Velocity factor"
        value={velocityFactor}
        isAllowed={(value) => value > 0 && value <= 1}
        errorMessage="Enter a velocity factor above zero and no more than one."
        onCommit={onVelocityFactorCommit}
        helpText="Velocity factor is wave speed in the line divided by light speed. Use manufacturer data; it changes physical length, not degrees or wavelengths."
        fieldId="velocity-factor"
        onDraftValidityChange={onDraftValidityChange}
      />
      <div className="preference-select">
        <span>
          Length unit{' '}
          <HelpTip
            label="physical length units"
            text="Metres, centimetres, feet, and inches are alternate displays of the same calculated physical length."
          />
        </span>
        <select
          aria-label="Length unit"
          data-focus-key="length-unit"
          value={lengthUnit}
          onChange={(event) => onLengthUnitChange(event.target.value as LengthUnit)}
        >
          <option value="m">Metres (m)</option>
          <option value="cm">Centimetres (cm)</option>
          <option value="ft">Feet (ft)</option>
          <option value="in">Inches (in)</option>
        </select>
      </div>
    </section>
  );
}
