import { useEffect, useId, useRef } from 'react';
import { LEARN_CATEGORIES, TOPICS, type LearnTopic } from './topics';

export function LearnPanel({
  open,
  onClose,
  onShowTopic,
  onRestartTour,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onShowTopic: (topic: LearnTopic) => void;
  readonly onRestartTour: () => void;
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
      className="education-dialog learn-dialog"
      aria-labelledby={headingId}
      onClose={onClose}
    >
      <header className="dialog-header">
        <div>
          <span className="eyebrow">RF refresher</span>
          <h2 id={headingId}>Learn the match</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <button
        type="button"
        onClick={() => {
          onClose();
          onRestartTour();
        }}
      >
        Restart guided tour
      </button>
      {LEARN_CATEGORIES.map((category) => (
        <section key={category} className="learn-category">
          <h3>{category}</h3>
          {TOPICS.filter((topic) => topic.category === category).map((topic) => (
            <details key={topic.id}>
              <summary>{topic.title}</summary>
              <p className="topic-summary">{topic.summary}</p>
              {topic.explanation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {topic.technicalDetail && (
                <details className="technical-detail">
                  <summary>Technical detail</summary>
                  <p>{topic.technicalDetail}</p>
                </details>
              )}
              <button type="button" onClick={() => onShowTopic(topic)}>
                Show this on the chart
              </button>
            </details>
          ))}
        </section>
      ))}
    </dialog>
  );
}
