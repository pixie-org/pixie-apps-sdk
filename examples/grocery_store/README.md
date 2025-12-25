# Grocery Store MCP Server

A minimal MCP server with a React shopping cart widget that uses Pixie SDK

## Features

- **MCP Server**: Node.js server that exposes a `search-groceries` tool
- **React Widget**: Shopping cart widget with:
  - Carousel of grocery items
  - Click item to go fullscreen
  - Add to cart functionality
  - Checkout button that opens external link
- **Uses window.pixie**: All interactions use `window.pixie` API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the widget:
```bash
npm run build
```

3. Start the servers:
```bash
npm start
```

This starts three servers:
- **OpenAI Apps compatible Server** on `http://localhost:8000` (set `PORT` env var to change)
- **MCP Apps compatible Server** on `http://localhost:8001` (set `MCP_APPS_PORT` env var to change)
- **Static File Server** on `http://localhost:8002` (set `STATIC_PORT` env var to change)

The static file server serves the built JS/CSS files, while the MCP server serves the widget HTML.

## Usage

The MCP server exposes:
- **Tool**: `search-groceries` - Takes a user query and returns matching grocery items
- **Resource**: Grocery store widget HTML

The widget displays groceries in a carousel. Users can:
- Click on any grocery item to request fullscreen display mode
- Add items to cart
- Adjust quantities
- Click checkout to open an external link

## Project Structure

```
examples/grocery_store/
├── src/
│   ├── server.ts          # MCP server + static file server
│   └── widget/
│       ├── index.tsx      # React widget component
│       ├── index.html     # HTML template
│       └── icons.tsx       # Grocery item icons
├── assets/                # Built widget files (HTML, JS, CSS)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

