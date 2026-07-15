import type { StubMatchSolution, StubTermination } from '../../rf';
import { metersToFeet } from '../../rf';
import { Copy } from 'lucide-react';
import { useState } from 'react';
export function ConstructionInstructions({
  solution,
  termination,
}: {
  readonly solution: StubMatchSolution;
  readonly termination: StubTermination;
}) {
  const [fallback, setFallback] = useState(false);
  const instruction = `Move ${solution.feedlineDistanceMeters.toFixed(3)} m (${metersToFeet(solution.feedlineDistanceMeters).toFixed(2)} ft) toward the transmitter from the load and connect a ${termination}-circuited shunt stub ${solution.stubLengthMeters.toFixed(3)} m long.`;
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
        Move <strong>{solution.feedlineDistanceMeters.toFixed(3)} m</strong> (
        {metersToFeet(solution.feedlineDistanceMeters).toFixed(2)} ft) toward the transmitter from
        the load and connect a{' '}
        <strong>
          {termination}-circuited shunt stub {solution.stubLengthMeters.toFixed(3)} m
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
