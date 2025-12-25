/**
 * Grocery Store MCP server (Node).
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
  createStaticFileServer,
  createMcpHttpServer,
  type SessionRecord,
} from "./common/server-utils.js";

const MIME_TYPE = "text/html+skybridge";
const SERVER_NAME = "grocery-store-node";

// Port configuration
const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;
const staticPortEnv = Number(process.env.STATIC_PORT ?? 8002);
const staticPort = Number.isFinite(staticPortEnv) ? staticPortEnv : 8002;

// Read widget HTML
const widgetHtml = readWidgetHtml(staticPort);

// Create grocery server factory
function createServer() {
  return createGroceryServer(SERVER_NAME, MIME_TYPE, widgetHtml);
}

// Start static file server
createStaticFileServer(staticPort);

// Start MCP server
const sessions = new Map<string, SessionRecord>();
createMcpHttpServer(port, sessions, createServer, "Grocery Store");
