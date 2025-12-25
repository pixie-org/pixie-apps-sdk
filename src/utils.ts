
/**
 * Checks if the OpenAI provider is available by checking for window.openai.
 * Returns true if window.openai exists, false otherwise.
 */
export function isOpenAiAvailable(): boolean {
    return typeof window !== "undefined" && window.openai != null;
}
