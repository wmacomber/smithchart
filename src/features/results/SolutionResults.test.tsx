import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { complex, hertz, ohms, solveShuntStub } from '../../rf';
import { SolutionResults } from './SolutionResults';
import { matchingResultText } from './matchingResultText';
import { DEFAULT_CALCULATION } from '../../app/workspaceReducer';

const solved = solveShuntStub({
  load: { kind: 'finite', impedanceOhms: complex(35, -22) },
  characteristicImpedanceOhms: ohms(50),
  frequencyHz: hertz(14.2e6),
  velocityFactor: 0.66,
  termination: 'short',
});

describe('matching result presentation', () => {
  it('uses one complete text contract for construction and clipboard', () => {
    expect(solved.status).toBe('solved');
    if (solved.status !== 'solved') return;
    const text = matchingResultText(solved.solutions[0], 'short', 'm', DEFAULT_CALCULATION);
    expect(text.construction).toContain('toward the transmitter from the load');
    expect(text.complete).toContain('Feed line:');
    expect(text.complete).toContain('Stub:');
    expect(text.complete).toContain('Residual: |Γ|');
  });

  it('renders two cards, meaningful residuals, and selected-only copy action', () => {
    expect(solved.status).toBe('solved');
    if (solved.status !== 'solved') return;
    const markup = renderToStaticMarkup(
      <SolutionResults
        result={solved}
        termination="short"
        selected="A"
        lengthUnit="m"
        onSelect={() => undefined}
        calculation={DEFAULT_CALCULATION}
        onLoadMismatch={() => undefined}
      />,
    );
    expect((markup.match(/<article/g) ?? []).length).toBe(2);
    expect((markup.match(/Copy construction instructions/g) ?? []).length).toBe(1);
    expect(markup).toContain('Verified ≤ 1×10⁻⁸');
    expect(markup).toContain('Advanced RF details');
  });

  it('does not fabricate construction for matched or numerical failure states', () => {
    const matched = renderToStaticMarkup(
      <SolutionResults
        result={{
          status: 'matched',
          diagnostics: {
            loadReflectionMagnitude: 0,
            resultReflectionMagnitude: 0,
            conductanceError: 0,
            susceptanceError: 0,
          },
        }}
        termination="short"
        selected="A"
        lengthUnit="m"
        onSelect={() => undefined}
        calculation={DEFAULT_CALCULATION}
        onLoadMismatch={() => undefined}
      />,
    );
    expect(matched).toContain('No matching stub is required');
    expect(matched).not.toContain('<article');

    const failure = renderToStaticMarkup(
      <SolutionResults
        result={{
          status: 'numerical-failure',
          diagnostics: {
            loadReflectionMagnitude: 0.5,
            resultReflectionMagnitude: Number.POSITIVE_INFINITY,
            conductanceError: Number.NaN,
            susceptanceError: Number.NaN,
          },
        }}
        termination="short"
        selected="A"
        lengthUnit="m"
        onSelect={() => undefined}
        calculation={DEFAULT_CALCULATION}
        onLoadMismatch={() => undefined}
      />,
    );
    expect(failure).toContain('Numerical verification failed');
    expect(failure).toContain('Unavailable');
    expect(failure).not.toContain('<article');
  });
});
