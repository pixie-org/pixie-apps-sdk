import { Provider } from './types';
import { getProvider } from './provider';

if (typeof window !== 'undefined') {
  if (!window.pixie) {
    // Automatically initialize the provider when the module is imported
    window.pixie = getProvider();
  }
}

declare global {
  interface Window {
    pixie: Provider;
  }
}

