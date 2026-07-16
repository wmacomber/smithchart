export function MatchingLegend({
  compact,
  annotations,
}: {
  readonly compact: boolean;
  readonly annotations: readonly { id: 'A' | 'B'; feed: string; stub: string }[];
}) {
  return (
    <div className="matching-legend" aria-label="Matching path legend">
      <span className="legend-direction">↻ Toward generator</span>
      <div className={`legend-solutions ${compact ? 'is-compact' : ''}`}>
        {annotations.map((item) => (
          <span key={item.id} className={`legend-solution solution-${item.id.toLowerCase()}`}>
            <span className="legend-identity">
              <i aria-hidden="true" /> <strong>{item.id}</strong>
            </span>
            <span>{item.feed.replace(`${item.id} · `, 'Feed: ')}</span>
            <span>{item.stub.replace(/^([^·]+) · /, 'Stub ($1): ')}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
