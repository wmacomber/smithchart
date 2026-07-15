import { TOPICS } from './topics';
export function LearnPanel() {
  return (
    <section className="learn-panel">
      <h2>Learn the match</h2>
      {TOPICS.map(([title, text]) => (
        <details key={title}>
          <summary>{title}</summary>
          <p>{text}</p>
          <button
            type="button"
            onClick={() => document.querySelector<SVGElement>('.marker-hit-target')?.focus()}
          >
            Show this on chart
          </button>
        </details>
      ))}
    </section>
  );
}
