import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="icon-button">
      <Printer size={16} aria-hidden="true" /> Print
    </button>
  );
}
