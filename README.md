# Pixie Apps SDK

[![npm version](https://img.shields.io/npm/v/pixie-apps-sdk)](https://www.npmjs.com/package/pixie-apps-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

SDK for building Pixie Apps that work with both OpenAI Apps and MCP Apps platforms.

## Installation

```bash
npm install pixie-apps-sdk
```

## Quick Start

Simply import the SDK in your widget code, and `window.pixie` will be automatically available:

```typescript
import 'pixie-apps-sdk';
```

That's it! The SDK automatically detects the platform (OpenAI Apps or MCP Apps) and initializes `window.pixie` accordingly.

## Usage

Once imported, you can use `window.pixie` throughout your application:

### React Hooks

The SDK provides React hooks for accessing tool data and UI state:

```typescript
function MyWidget() {
  // Tool data
  const toolInput = window.pixie.useToolInput();
  const toolOutput = window.pixie.useToolOutput();
  const toolResponseMetadata = window.pixie.useToolResponseMetadata();

  // UI state
  const theme = window.pixie.useTheme(); // "light" | "dark"
  const displayMode = window.pixie.useDisplayMode(); // "pip" | "inline" | "fullscreen"
  const maxHeight = window.pixie.useMaxHeight();
  const safeArea = window.pixie.useSafeArea();
  const userAgent = window.pixie.useUserAgent();
  const locale = window.pixie.useLocale();

  // Widget state (persistent across renders)
  const widgetState = window.pixie.getWidgetState();
  window.pixie.setWidgetState({ myData: 'value' });

  return <div>My Widget</div>;
}
```

### Actions

```typescript
// Call a tool
const result = await window.pixie.callTool('tool-name', { arg1: 'value' });

// Send a follow-up message
window.pixie.sendFollowupMessage('Can you show me more items?');

// Open external link
window.pixie.openExternal('https://example.com');

// Request display mode change
window.pixie.requestDisplayMode('fullscreen');

// Request modal
const modalResult = await window.pixie.requestModal({
  title: 'My Modal',
  params: { message: 'Hello' }
});

// Request to close widget
await window.pixie.requestClose();
```

## TypeScript Support

The SDK includes full TypeScript definitions. Import types as needed:

```typescript
import type { Provider, WidgetState, Theme, DisplayMode } from 'pixie-apps-sdk';

declare global {
  interface Window {
    pixie: Provider;
  }
}
```

## Complete Example

```typescript
import { useEffect, useState } from 'react';
import 'pixie-apps-sdk';

type MyPayload = {
  items?: Array<{ name: string; price: number }>;
};

function ShoppingWidget() {
  const toolOutput = window.pixie.useToolOutput() as MyPayload | null;
  const theme = window.pixie.useTheme();
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    if (toolOutput?.items) {
      // Process tool output
      console.log('Received items:', toolOutput.items);
    }
  }, [toolOutput]);

  const handleAddToCart = (itemName: string) => {
    setCart([...cart, itemName]);
    // Persist state
    window.pixie.setWidgetState({ cart });
  };

  const handleCheckout = () => {
    window.pixie.openExternal('https://checkout.example.com');
  };

  return (
    <div style={{ 
      background: theme === 'dark' ? '#000' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      <h1>My Shopping Widget</h1>
      {toolOutput?.items?.map(item => (
        <div key={item.name}>
          <span>{item.name} - ${item.price}</span>
          <button onClick={() => handleAddToCart(item.name)}>
            Add to Cart
          </button>
        </div>
      ))}
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}
```

## API Reference

### Hooks

All hooks are React hooks that automatically re-render when values change.

- `useToolInput()` - Get the tool input data
- `useToolOutput()` - Get the tool output data
- `useToolResponseMetadata()` - Get tool response metadata
- `useTheme()` - Get current theme ("light" | "dark")
- `useDisplayMode()` - Get current display mode ("pip" | "inline" | "fullscreen")
- `useMaxHeight()` - Get maximum widget height
- `useSafeArea()` - Get safe area insets
- `useUserAgent()` - Get user agent information
- `useLocale()` - Get current locale string

### State Management

- `getWidgetState()` - Get current widget state (persistent)
- `setWidgetState(state)` - Update widget state

### Actions

- `callTool(name, args?)` - Call a tool and return result
- `sendFollowupMessage(message)` - Send a follow-up message to the assistant
- `openExternal(href)` - Open an external URL
- `requestDisplayMode(mode)` - Request a display mode change
- `requestModal(args)` - Request a modal dialog
- `requestClose()` - Request to close the widget

## Platform Support

The SDK automatically detects and works with:
- **OpenAI Apps** - Uses `window.openai` API
- **MCP Apps** - Uses MCP Apps protocol

No configuration needed - just import and use!

## Requirements

- React 18+ (peer dependency)
- React DOM 18+ (peer dependency)

## License

See LICENSE file for details.
