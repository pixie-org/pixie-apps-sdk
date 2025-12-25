/**
 * Shared server utilities: static file server, session handling, and HTTP server setup.
 */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Go up from src/common to project root (two levels up)
const ROOT_DIR = path.resolve(__dirname, "..", "..");
export const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

export function readWidgetHtml(staticPort: number): string {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(
      `Widget assets not found. Expected directory ${ASSETS_DIR}. Run "npm run build" before starting the server.`
    );
  }

  // Try direct path first
  const directPath = path.join(ASSETS_DIR, "grocery-store.html");
  let htmlContents: string | null = null;

  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    // Try nested path (src/widget/index.html)
    const nestedPath = path.join(ASSETS_DIR, "src", "widget", "index.html");
    if (fs.existsSync(nestedPath)) {
      htmlContents = fs.readFileSync(nestedPath, "utf8");
    } else {
      // Try to find any HTML file matching the pattern
      const allFiles = fs.readdirSync(ASSETS_DIR, { recursive: true });
      const candidates = allFiles
        .filter((file): file is string => typeof file === "string")
        .filter(
          (file: string) =>
            file.endsWith("grocery-store.html") ||
            file.endsWith("index.html") ||
            (file.startsWith("grocery-store-") && file.endsWith(".html"))
        )
        .sort();
      if (candidates.length > 0) {
        const fallback = candidates[candidates.length - 1];
        htmlContents = fs.readFileSync(
          path.join(ASSETS_DIR, fallback),
          "utf8"
        );
      }
    }
  }

  if (!htmlContents) {
    throw new Error(
      `Widget HTML for "grocery-store" not found in ${ASSETS_DIR}. Run "npm run build" to generate the assets.`
    );
  }

  // Replace script src paths to point to static server
  htmlContents = htmlContents.replace(
    /src="\/([^"]+)"/g,
    `src="http://localhost:${staticPort}/$1"`
  );

  return htmlContents;
}

export type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

export const ssePath = "/mcp";
export const postPath = "/mcp/messages";

export async function handleSseRequest(
  res: ServerResponse,
  createServerFn: () => Server
): Promise<SessionRecord | null> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createServerFn();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  const session: SessionRecord = { server, transport };

  transport.onclose = async () => {
    await server.close();
  };

  transport.onerror = (error: Error) => {
    console.error("SSE transport error", error);
  };

  try {
    await server.connect(transport);
    return session;
  } catch (error) {
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
    return null;
  }
}

export async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  sessions: Map<string, SessionRecord>
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    const errorResponse = JSON.stringify({ error: "Missing sessionId query parameter" });
    res.writeHead(400, {
      "Content-Type": "application/json",
    }).end(errorResponse);
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    const errorResponse = JSON.stringify({ error: "Unknown session" });
    res.writeHead(404, {
      "Content-Type": "application/json",
    }).end(errorResponse);
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      const errorResponse = JSON.stringify({ error: "Failed to process message" });
      res.writeHead(500, {
        "Content-Type": "application/json",
      }).end(errorResponse);
    }
  }
}

export function createStaticFileServer(staticPort: number) {
  const staticServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url || req.method !== "GET") {
        res.writeHead(404).end("Not Found");
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
      const filePath = path.join(ASSETS_DIR, url.pathname.slice(1));

      // Security: ensure file is within assets directory
      if (!filePath.startsWith(ASSETS_DIR)) {
        res.writeHead(403).end("Forbidden");
        return;
      }

      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath);
          const mimeTypes: Record<string, string> = {
            ".js": "application/javascript",
            ".html": "text/html",
            ".css": "text/css",
            ".json": "application/json",
          };
          const contentType = mimeTypes[ext] || "application/octet-stream";

          res.writeHead(200, {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
          });
          res.end(content);
        } else {
          res.writeHead(404).end("Not Found");
        }
      } catch (error) {
        console.error("Error serving static file", error);
        res.writeHead(500).end("Internal Server Error");
      }
    }
  );

  staticServer.on("clientError", (err: Error, socket: { end: (data: string) => void }) => {
    console.error("Static server client error", err);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  staticServer.listen(staticPort, () => {
    console.log(`Static file server listening on http://localhost:${staticPort}`);
    console.log(`  Serving files from: ${ASSETS_DIR}`);
  });

  return staticServer;
}

export function createMcpHttpServer(
  port: number,
  sessions: Map<string, SessionRecord>,
  createServerFn: () => Server,
  serverName?: string
) {
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url) {
        res.writeHead(400).end("Missing URL");
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

      if (
        req.method === "OPTIONS" &&
        (url.pathname === ssePath || url.pathname === postPath)
      ) {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "content-type",
        });
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === ssePath) {
        const session = await handleSseRequest(res, createServerFn);
        if (session) {
          sessions.set(session.transport.sessionId, session);
          session.transport.onclose = async () => {
            sessions.delete(session.transport.sessionId);
            await session.server.close();
          };
        }
        return;
      }

      if (req.method === "POST" && url.pathname === postPath) {
        await handlePostMessage(req, res, url, sessions);
        return;
      }

      res.writeHead(404).end("Not Found");
    }
  );

  httpServer.on("clientError", (err: Error, socket: { end: (data: string) => void }) => {
    console.error("HTTP client error", err);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  httpServer.listen(port, () => {
    const name = serverName ? `${serverName} ` : "";
    console.log(`${name}MCP server listening on http://localhost:${port}`);
    console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
    console.log(
      `  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`
    );
  });

  return httpServer;
}

