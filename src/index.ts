import { Provider } from './types';
import { getProvider } from './provider';

if (typeof window !== 'undefined') {
  if (!window.pixie) {
    let providerInstance: Provider | null = null;
    
    window.pixie = new Proxy({} as Provider, {
      get(_target, prop) {
        // Initialize provider on first access
        if (!providerInstance) {
          providerInstance = getProvider();
        }
        return providerInstance[prop as keyof Provider];
      }
    });
  }
}

declare global {
  interface Window {
    pixie: Provider;
  }
}

