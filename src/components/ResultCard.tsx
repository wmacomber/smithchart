import type { ReactNode } from 'react';
export function ResultCard({
  title,
  selected,
  onSelect,
  children,
  solutionId,
}: {
  readonly title: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly children: ReactNode;
  readonly solutionId?: 'A' | 'B';
}) {
  return (
    <article
      className={`result-card ${solutionId ? `solution-${solutionId.toLowerCase()}` : ''} ${selected ? 'selected' : ''}`}
    >
      <header>
        <h3>{title}</h3>
        <button type="button" aria-pressed={selected} onClick={onSelect}>
          {selected ? 'Selected' : 'Select'}
        </button>
      </header>
      {children}
    </article>
  );
}
