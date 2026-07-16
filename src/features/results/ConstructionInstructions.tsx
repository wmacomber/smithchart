import type { LengthUnit } from '../../app/workspaceTypes';
import { metersToFeet, type StubMatchSolution, type StubTermination } from '../../rf';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import { formatLength } from './lengthFormatting';
export function ConstructionInstructions({
  solution,
  termination,
  lengthUnit,
}: {
  readonly solution: StubMatchSolution;
  readonly termination: StubTermination;
  readonly lengthUnit: LengthUnit;
}) {
  const [fallback, setFallback] = useState(false);
  const feedlineLength =
    lengthUnit === 'm'
      ? `${formatLength(solution.feedlineDistanceMeters, lengthUnit)} (${metersToFeet(
          solution.feedlineDistanceMeters,
        ).toFixed(2)} ft)`
      : formatLength(solution.feedlineDistanceMeters, lengthUnit);
  const stubLength = formatLength(solution.stubLengthMeters, lengthUnit);
  const instruction = `Move ${feedlineLength} toward the transmitter from the load and connect a ${termination}-circuited shunt stub ${stubLength} long.`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(instruction);
      setFallback(false);
    } catch {
      setFallback(true);
    }
  };
  return (
    <div>
      <p className="construction">
        Move <strong>{feedlineLength}</strong> toward the transmitter from the load and connect a{' '}
        <strong>
          {termination}-circuited shunt stub {stubLength}
        </strong>{' '}
        long.
      </p>
      <button type="button" className="icon-button copy-instruction" onClick={() => void copy()}>
        <Copy size={16} aria-hidden="true" /> Copy instructions
      </button>
      {fallback && (
        <textarea
          className="copy-fallback"
          readOnly
          value={instruction}
          aria-label="Copyable construction instructions"
        />
      )}
    </div>
  );
}
