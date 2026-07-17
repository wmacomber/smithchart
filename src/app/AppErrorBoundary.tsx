import { Component, createRef, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly onReload?: () => void;
}

export class AppErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  private readonly headingRef = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* Deliberately no telemetry or network logging. */
  }

  componentDidMount() {
    if (this.state.failed) this.headingRef.current?.focus();
  }

  componentDidUpdate(_: Props, previousState: { failed: boolean }) {
    if (!previousState.failed && this.state.failed) this.headingRef.current?.focus();
  }

  render() {
    return this.state.failed ? (
      <main className="fatal-error" role="alert" aria-labelledby="fatal-error-title">
        <h1 id="fatal-error-title" ref={this.headingRef} tabIndex={-1}>
          Instrument stopped safely
        </h1>
        <p>Your URL still contains the committed calculation.</p>
        <button type="button" onClick={this.props.onReload ?? (() => location.reload())}>
          Reload
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
