import type { ReactNode } from 'react';
export function Disclosure({
  title,
  children,
  open = false,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly open?: boolean;
}) {
  return (
    <details open={open}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}
