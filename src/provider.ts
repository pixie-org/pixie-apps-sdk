import { Provider } from './types';
import { OpenAiProvider} from './provider/openai';
import { isOpenAiAvailable } from './utils';

let cachedProvider: Provider | null = null;

function initializeProvider(): Provider {
    if (isOpenAiAvailable()) {
        return new OpenAiProvider();
    }
    // raise error
    throw new Error('No provider available');
}

export function getProvider(): Provider {
  if (!cachedProvider) {
    cachedProvider = initializeProvider();
  }
  return cachedProvider;
}
