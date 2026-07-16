import { useState } from 'react';

const STEPS = [
  [
    'Set the load',
    'Enter resistance and reactance, or load the antenna example. The red marker shows that load on the chart.',
  ],
  [
    'Follow the path',
    'Move clockwise toward the generator until the constant-SWR circle reaches either g = 1 junction.',
  ],
  [
    'Compare A and B',
    'Both matches are valid. Compare feed distance and stub length, then select the construction that fits.',
  ],
  [
    'Build, measure, and trim',
    'Copy the selected instructions. Treat physical lengths as starting values and trim the assembled network while measuring.',
  ],
] as const;

export function FirstUseGuide({
  visible,
  restartToken,
  startTour = false,
  onDismiss,
  onLoadExample,
}: {
  readonly visible: boolean;
  readonly restartToken: number;
  readonly startTour?: boolean;
  readonly onDismiss: () => void;
  readonly onLoadExample: () => void;
}) {
  const [tour, setTour] = useState<{ token: number; step: number } | null>(() =>
    startTour ? { token: restartToken, step: 0 } : null,
  );
  const activeTour = tour;
  if (!visible && !activeTour) return null;
  if (activeTour) {
    const [title, text] = STEPS[activeTour.step]!;
    return (
      <aside className="first-use guided-tour" aria-labelledby="tour-title">
        <div>
          <span className="eyebrow" aria-current="step">
            Step {activeTour.step + 1} of {STEPS.length}
          </span>
          <strong id="tour-title">{title}</strong>
          <p>{text}</p>
        </div>
        <div className="tour-actions">
          <button
            type="button"
            disabled={activeTour.step === 0}
            onClick={() => setTour({ token: activeTour.token, step: activeTour.step - 1 })}
          >
            Back
          </button>
          {activeTour.step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setTour({ token: activeTour.token, step: activeTour.step + 1 })}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTour(null);
                onDismiss();
              }}
            >
              Finish
            </button>
          )}
        </div>
      </aside>
    );
  }
  return (
    <aside className="first-use first-use-prompt">
      <div>
        <strong>New to this workflow?</strong> Follow one match from load to construction.
      </div>
      <div className="tour-actions">
        <button type="button" onClick={() => setTour({ token: restartToken, step: 0 })}>
          Take guided tour
        </button>
        <button type="button" onClick={onLoadExample}>
          Load antenna example
        </button>
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </aside>
  );
}
