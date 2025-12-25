import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type UnknownObject = Record<string, unknown>;

export type WidgetState = UnknownObject;

export type Theme = "light" | "dark";

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};

export type DisplayMode = "pip" | "inline" | "fullscreen";

export type CallToolResponse = {
   result: string;
};
 
export interface Provider {
   useToolInput: () => UnknownObject;
   useToolOutput: () => UnknownObject;
   useToolResponseMetadata: () => UnknownObject;

   useTheme: () => Theme;
   useDisplayMode: () => DisplayMode;
   useMaxHeight: () => number;
   useSafeArea: () => SafeArea;
   useUserAgent: () => UserAgent;
   useLocale: () => string;

   getWidgetState: () => WidgetState;
   setWidgetState: (widgetState: WidgetState) => void;

   callTool: (name: string, args?: Record<string, unknown>) => Promise<CallToolResult>;
   sendFollowupMessage: (message: string) => void;
   openExternal: (href: string) => void;
   requestDisplayMode: (mode: DisplayMode) => void;
   requestModal: (args: { title?: string; params?: UnknownObject }) => Promise<unknown>;
   requestClose: () => Promise<void>;
}
