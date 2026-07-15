import type { ReactNode } from 'react';
export function ResultCard({
  title,
  selected,
  onSelect,
  children,
}: {
  readonly title: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly children: ReactNode;
}) {
  return (
    <article className={`result-card ${selected ? 'selected' : ''}`}>
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
