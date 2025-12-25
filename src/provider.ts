import { Provider } from './types';
import { OpenAiProvider} from './provider/openai';
import { isOpenAiAvailable } from './utils';
import { McpAppsProvider } from './provider/mcpapps';

let cachedProvider: Provider | null = null;

function initializeProvider(): Provider {
    if (isOpenAiAvailable()) {
        return new OpenAiProvider();
    }
    return new McpAppsProvider();
}

export function getProvider(): Provider {
  if (!cachedProvider) {
    cachedProvider = initializeProvider();
  }
  return cachedProvider;
}
