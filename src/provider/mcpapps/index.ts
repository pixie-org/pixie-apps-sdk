import { CallToolResponse, Provider, WidgetState } from "../../types";
import { UnknownObject, Theme, SafeArea, UserAgent, DisplayMode } from "../../types";

export class McpAppsProvider implements Provider {
    constructor() {}

    useToolInput(): UnknownObject {
        throw new Error("Not implemented");
    }
    
    useToolOutput(): UnknownObject {
        throw new Error("Not implemented");
    }

    useToolResponseMetadata(): UnknownObject {
        throw new Error("Not implemented");
    }

    useTheme(): Theme {
        throw new Error("Not implemented");
    }

    useDisplayMode(): DisplayMode {
        throw new Error("Not implemented");
    }

    useMaxHeight(): number {
        throw new Error("Not implemented");
    }

    useSafeArea(): SafeArea {
        throw new Error("Not implemented");
    }

    useUserAgent(): UserAgent {
        throw new Error("Not implemented");
    }

    useLocale(): string {
        throw new Error("Not implemented");
    }

    getWidgetState(): WidgetState {
        throw new Error("Not implemented");
    }

    setWidgetState(widgetState: WidgetState): any {
        throw new Error("Not implemented");
    }

    callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResponse> {
        throw new Error("Not implemented");
    }

    sendFollowupMessage(message: string): void {
        throw new Error("Not implemented");
    }

    openExternal(href: string): void {
        throw new Error("Not implemented");
    }

    requestDisplayMode(mode: DisplayMode): void {
        throw new Error("Not implemented");
    }
  
    requestModal(args: { title?: string; params?: UnknownObject }): Promise<unknown> {
        throw new Error("Not implemented");
    }
  
    requestClose(): Promise<void> {
        throw new Error("Not implemented");
    }
}