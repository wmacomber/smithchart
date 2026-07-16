import { Share2 } from 'lucide-react';

export function ShareButton({
  url,
  disabled = false,
}: {
  readonly url: string;
  readonly disabled?: boolean;
}) {
  const share = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy calculation URL', url);
    }
  };
  return (
    <button type="button" disabled={disabled} onClick={() => void share()} className="icon-button">
      <Share2 size={16} aria-hidden="true" /> Share
    </button>
  );
}
