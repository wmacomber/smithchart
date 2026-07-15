import type { ReactNode } from 'react';
export function Tooltip({
  text,
  children,
}: {
  readonly text: string;
  readonly children: ReactNode;
}) {
  return (
    <span className="tooltip" title={text}>
      {children}
    </span>
  );
}
