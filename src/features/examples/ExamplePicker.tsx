import { useEffect, useId, useRef } from 'react';
import type { ExampleCategory, ExamplePreset } from '../../app/workspaceTypes';
import { EXAMPLES } from './examples';

const CATEGORY_LABELS: Readonly<Record<ExampleCategory, string>> = {
  fundamentals: 'Fundamentals',
  'edge-cases': 'Edge cases',
  systems: 'Practical systems',
};

export function ExamplePicker({
  open,
  onClose,
  onSelect,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (example: ExamplePreset) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="education-dialog examples-dialog"
      aria-labelledby={headingId}
      onClose={onClose}
    >
      <header className="dialog-header">
        <div>
          <span className="eyebrow">Worked starting points</span>
          <h2 id={headingId}>Examples</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      {(['fundamentals', 'edge-cases', 'systems'] as const).map((category) => (
        <section key={category}>
          <h3>{CATEGORY_LABELS[category]}</h3>
          <div className="example-list">
            {EXAMPLES.filter((example) => example.category === category).map((example) => (
              <article key={example.id} className="example-card">
                <h4>{example.name}</h4>
                <p>{example.description}</p>
                <p className="example-goal">Learn: {example.learningGoal}</p>
                <button type="button" onClick={() => onSelect(example)}>
                  Load example
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </dialog>
  );
}
