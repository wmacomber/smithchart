import { Component, type ReactNode } from 'react';
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* Deliberately no telemetry or network logging. */
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>Instrument stopped safely</h1>
        <p>Your URL still contains the committed calculation.</p>
        <button type="button" onClick={() => location.reload()}>
          Reload
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
