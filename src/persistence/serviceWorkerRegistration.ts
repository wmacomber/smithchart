import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker(onUpdate: (update: () => Promise<void>) => void): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => onUpdate(() => updateSW(true)),
    onRegisterError: (error) => console.error('Service worker registration failed.', error),
  });
}
