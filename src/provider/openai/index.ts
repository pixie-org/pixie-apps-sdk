import { Provider, WidgetState } from "../../types";
import { isOpenAiAvailable } from "../../utils";
import { UnknownObject, Theme, SafeArea, UserAgent, DisplayMode } from "../../types";
import { useOpenAiGlobal } from "./use-openai-global";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class OpenAiProvider implements Provider {
    constructor() {
        if (!isOpenAiAvailable()) {
            throw new Error('OpenAI is not available');
        }
    }

    useToolInput(): UnknownObject {
        return useOpenAiGlobal("toolInput") as UnknownObject;
    }
    
    useToolOutput(): UnknownObject {
        return useOpenAiGlobal("toolOutput") as UnknownObject;
    }

    useToolResponseMetadata(): UnknownObject {
        return useOpenAiGlobal("toolResponseMetadata") as UnknownObject;
    }

    useTheme(): Theme {
        return useOpenAiGlobal("theme") as Theme;
    }

    useDisplayMode(): DisplayMode {
        return useOpenAiGlobal("displayMode") as DisplayMode;
    }

    useMaxHeight(): number {
        return useOpenAiGlobal("maxHeight") as number;
    }

    useSafeArea(): SafeArea {
        return useOpenAiGlobal("safeArea") as SafeArea;
    }

    useUserAgent(): UserAgent {
        return useOpenAiGlobal("userAgent") as UserAgent;
    }

    useLocale(): string {
        return useOpenAiGlobal("locale") as string;
    }

    getWidgetState(): WidgetState {
        return window.openai.widgetState as WidgetState;
    }

    setWidgetState(widgetState: WidgetState): any {
        return window.openai.setWidgetState(widgetState);
    }

    async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
        const result = await window.openai.callTool(name, args);
        // if result is a string, convert it back to struct
        if (typeof result === "string") {
            return JSON.parse(result) as CallToolResult;
        }
        return result as CallToolResult;
    }

    sendFollowupMessage(message: string): void {
        window.openai.sendFollowUpMessage({ prompt: message });
    }

    openExternal(href: string): void {
        window.openai.openExternal({ href });
    }

    requestDisplayMode(mode: DisplayMode): void {
        window.openai.requestDisplayMode({ mode });
    }
  
    requestModal(args: { title?: string; params?: UnknownObject }): Promise<unknown> {
        return window.openai.requestModal(args);
    }
  
    requestClose(): Promise<void> {
        return window.openai.requestClose();
    }
}