/**
 * Grocery Store MCP server (Node) - MCP Apps variant.
 *
 * Serves the grocery-store widget HTML and exposes a tool:
 * - search-groceries: takes user query and returns list of grocery items
 *
 * Uses @modelcontextprotocol/sdk over SSE transport. Make sure assets are built
 * (npm run build) so the widget HTML is available in /assets before starting.
 */
import { createGroceryServer } from "./common/grocery-store.js";
import {
  readWidgetHtml,
  createMcpHttpServer,
  type SessionRecord,
} from "./common/server-utils.js";

const MIME_TYPE = "text/html+mcp";
const SERVER_NAME = "grocery-store-node-mcpapps";

// Port configuration
const portEnv = Number(process.env.MCP_APPS_PORT ?? 8001);
const port = Number.isFinite(portEnv) ? portEnv : 8001;
const staticPortEnv = Number(process.env.STATIC_PORT ?? 8002);
const staticPort = Number.isFinite(staticPortEnv) ? staticPortEnv : 8002;

// Read widget HTML
const widgetHtml = readWidgetHtml(staticPort);

// Create grocery server factory
function createServer() {
  return createGroceryServer(SERVER_NAME, MIME_TYPE, widgetHtml);
}

// Start MCP server (static server is started by server.ts)
const sessions = new Map<string, SessionRecord>();
createMcpHttpServer(port, sessions, createServer, "Grocery Store MCP Apps");
