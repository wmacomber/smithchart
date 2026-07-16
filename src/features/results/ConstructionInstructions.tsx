import type { CalculationState, LengthUnit } from '../../app/workspaceTypes';
import type { StubMatchSolution, StubTermination } from '../../rf';
import { Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { matchingResultText } from './matchingResultText';
export function ConstructionInstructions({
  solution,
  termination,
  lengthUnit,
  selected,
  calculation,
  disabled = false,
}: {
  readonly solution: StubMatchSolution;
  readonly termination: StubTermination;
  readonly lengthUnit: LengthUnit;
  readonly selected: boolean;
  readonly calculation: CalculationState;
  readonly disabled?: boolean;
}) {
  const [fallback, setFallback] = useState(false);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const text = matchingResultText(solution, termination, lengthUnit, calculation);
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => {
    if (fallback) fallbackRef.current?.select();
  }, [fallback]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.complete);
      setFallback(false);
      setCopyStatus(`Solution ${solution.id} instructions copied.`);
    } catch {
      setFallback(true);
      setCopyStatus('Clipboard unavailable. Copy from the text field.');
    }
  };
  return (
    <div>
      <p className="construction">
        Move <strong>{text.feedlineLength}</strong> toward the transmitter from the load and connect
        a{' '}
        <strong>
          {termination}-circuited shunt stub {text.stubLength}
        </strong>{' '}
        long.
      </p>
      {selected && (
        <button
          type="button"
          className="icon-button copy-instruction"
          disabled={disabled}
          onClick={() => void copy()}
        >
          <Copy size={16} aria-hidden="true" /> Copy construction instructions
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {copyStatus}
      </span>
      {fallback && (
        <textarea
          ref={fallbackRef}
          className="copy-fallback"
          readOnly
          value={text.complete}
          aria-label="Copyable construction instructions"
        />
      )}
    </div>
  );
}
