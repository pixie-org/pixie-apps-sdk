import { Provider, UnknownObject, Theme, DisplayMode, SafeArea, UserAgent, WidgetState } from './types';
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getProvider } from './provider';

// Get the provider instance (initializes if needed)
function getPixieProvider(): Provider {
  return getProvider();
}

// Export all hooks and functions
export function useToolInput(): UnknownObject {
  return getPixieProvider().useToolInput();
}

export function useToolOutput(): UnknownObject {
  return getPixieProvider().useToolOutput();
}

export function useToolResponseMetadata(): UnknownObject {
  return getPixieProvider().useToolResponseMetadata();
}

export function useTheme(): Theme {
  return getPixieProvider().useTheme();
}

export function useDisplayMode(): DisplayMode {
  return getPixieProvider().useDisplayMode();
}

export function useMaxHeight(): number {
  return getPixieProvider().useMaxHeight();
}

export function useSafeArea(): SafeArea {
  return getPixieProvider().useSafeArea();
}

export function useUserAgent(): UserAgent {
  return getPixieProvider().useUserAgent();
}

export function useLocale(): string {
  return getPixieProvider().useLocale();
}

export function getWidgetState(): WidgetState {
  return getPixieProvider().getWidgetState();
}

export function setWidgetState(widgetState: WidgetState): void {
  return getPixieProvider().setWidgetState(widgetState);
}

export function callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
  return getPixieProvider().callTool(name, args);
}

export function sendFollowupMessage(message: string): void {
  return getPixieProvider().sendFollowupMessage(message);
}

export function openExternal(href: string): void {
  return getPixieProvider().openExternal(href);
}

export function requestDisplayMode(mode: DisplayMode): void {
  return getPixieProvider().requestDisplayMode(mode);
}

export function requestModal(args: { title?: string; params?: UnknownObject }): Promise<unknown> {
  return getPixieProvider().requestModal(args);
}

export function requestClose(): Promise<void> {
  return getPixieProvider().requestClose();
}

// Export types
export type { Provider, WidgetState, Theme, DisplayMode, SafeArea, UserAgent, UnknownObject } from './types';
export type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// Also expose on window.pixie for backward compatibility
if (typeof window !== 'undefined') {
  if (!window.pixie) {
    window.pixie = getPixieProvider();
  }
}

declare global {
  interface Window {
    pixie: Provider;
  }
}

