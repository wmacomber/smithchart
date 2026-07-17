// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppErrorBoundary } from './AppErrorBoundary';

function ThrowingChild(): never {
  throw new Error('expected test failure');
}

describe('AppErrorBoundary', () => {
  it('focuses an alert fallback and provides recovery without telemetry', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const reload = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AppErrorBoundary onReload={reload}>
          <ThrowingChild />
        </AppErrorBoundary>,
      );
    });

    const fallback = container.querySelector<HTMLElement>('[role="alert"]')!;
    const heading = container.querySelector<HTMLHeadingElement>('h1')!;
    const button = container.querySelector<HTMLButtonElement>('button')!;
    expect(fallback.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading).toBe(document.activeElement);
    expect(fallback.textContent).toContain('URL still contains the committed calculation');
    button.click();
    expect(reload).toHaveBeenCalledOnce();

    await act(async () => root.unmount());
    container.remove();
    consoleError.mockRestore();
  });
});
