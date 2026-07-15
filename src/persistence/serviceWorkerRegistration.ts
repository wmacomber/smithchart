import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker(onUpdate: (update: () => Promise<void>) => void): void {
  const updateSW = registerSW({ onNeedRefresh: () => onUpdate(() => updateSW(true)) });
}
