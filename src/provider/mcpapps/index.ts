import { Provider, WidgetState } from "../../types";
import { UnknownObject, Theme, SafeArea, UserAgent, DisplayMode } from "../../types";
import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";
import { createStateStore } from "./types";
import {CallToolResult} from "@modelcontextprotocol/sdk/types.js";

type HostContext = {
    theme?: Theme;
    displayMode?: DisplayMode;
    maxHeight?: number;
    safeArea?: SafeArea;
    userAgent?: UserAgent;
    locale?: string;
    [key: string]: unknown; // Allow other fields from host context
};

export class McpAppsProvider implements Provider {
    private app: App;
    private toolInputStore: ReturnType<typeof createStateStore<UnknownObject>>;
    private toolOutputStore: ReturnType<typeof createStateStore<UnknownObject>>;
    private toolResponseMetadataStore: ReturnType<typeof createStateStore<UnknownObject>>;
    private hostContextStore: ReturnType<typeof createStateStore<HostContext>>;

    // local widget state - MCP Apps support not there yet.
    private widgetState: UnknownObject = {};

    constructor() {
        this.app = new App({
            name: "Pixie Apps SDK",
            version: "1.0.3",
        });
        this.app.connect(new PostMessageTransport(window.parent));

        this.toolInputStore = createStateStore<UnknownObject>({});
        this.toolOutputStore = createStateStore<UnknownObject>({});
        this.toolResponseMetadataStore = createStateStore<UnknownObject>({});
        this.hostContextStore = createStateStore<HostContext>({});

        const initialContext = this.app.getHostContext();
        this.hostContextStore.setState(initialContext as HostContext);
        this.app.onhostcontextchanged = (params) => {
            const currentContext = this.hostContextStore.getState();
            this.hostContextStore.setState({
                ...currentContext,
                ...params,
            } as HostContext);
        };

        this.app.ontoolinput = (params) => {
            this.toolInputStore.setState(params as UnknownObject);
        };

        this.app.ontoolresult = (params) => {
            const toolResult = params as CallToolResult;
            this.toolOutputStore.setState(toolResult.structuredContent || {});
            this.toolResponseMetadataStore.setState(toolResult._meta as UnknownObject);
        };
    }

    useToolInput(): UnknownObject {
        return this.toolInputStore.useStore();
    }
    
    useToolOutput(): UnknownObject {
        return this.toolOutputStore.useStore();
    }

    useToolResponseMetadata(): UnknownObject {
        return this.toolResponseMetadataStore.useStore();
    }

    useTheme(): Theme {
        const context = this.hostContextStore.useStore();
        return (context.theme as Theme) || "light";
    }

    useDisplayMode(): DisplayMode {
        const context = this.hostContextStore.useStore();
        return (context.displayMode as DisplayMode) || "inline";
    }

    useMaxHeight(): number {
        const context = this.hostContextStore.useStore();
        return context.maxHeight ?? 0;
    }

    useSafeArea(): SafeArea {
        const context = this.hostContextStore.useStore();
        return context.safeArea || {
            insets: { top: 0, bottom: 0, left: 0, right: 0 }
        };
    }

    useUserAgent(): UserAgent {
        const context = this.hostContextStore.useStore();
        return context.userAgent || {
            device: { type: "unknown" },
            capabilities: { hover: false, touch: false }
        };
    }

    useLocale(): string {
        const context = this.hostContextStore.useStore();
        return context.locale as string;
    }

    getWidgetState(): WidgetState {
        console.error("Getting widget state is not implemented for MCP Apps.");
        return this.widgetState;
    }

    setWidgetState(widgetState: WidgetState): any {
        console.error("Setting widget state is not implemented for MCP Apps.");
        this.widgetState = widgetState;
    }

    callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
        return this.app.callServerTool({name, arguments: args});
    }

    sendFollowupMessage(message: string): void {
        this.app.sendMessage({
            role: "user",
            content: [{ type: "text", text: message }]
        });
    }

    openExternal(href: string): void {
        this.app.openLink({url: href});
    }

    requestDisplayMode(mode: DisplayMode): void {
        this.app.requestDisplayMode({mode: mode});
    }
  
    requestModal(args: { title?: string; params?: UnknownObject }): Promise<unknown> {
        throw new Error("Not implemented yet for MCP Apps.");
    }
  
    requestClose(): Promise<void> {
        throw new Error("Not implemented yet for MCP Apps.");
    }
}