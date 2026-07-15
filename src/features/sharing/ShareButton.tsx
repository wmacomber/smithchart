import { Share2 } from 'lucide-react';

export function ShareButton({ url }: { readonly url: string }) {
  const share = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy calculation URL', url);
    }
  };
  return (
    <button type="button" onClick={() => void share()} className="icon-button">
      <Share2 size={16} aria-hidden="true" /> Share
    </button>
  );
}
