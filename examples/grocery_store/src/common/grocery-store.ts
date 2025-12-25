/**
 * Shared grocery store logic: database, search, and server creation.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export type GroceryItem = {
  name: string;
  description: string;
  price?: number;
};

export type GroceryPayload = {
  items: GroceryItem[];
};

const TEMPLATE_URI = "ui://widget/grocery-store.html";

// Simple grocery database
const groceryDatabase: Record<string, GroceryItem[]> = {
  breakfast: [
    { name: "Eggs", description: "Fresh farm eggs, 12 count", price: 3.99 },
    { name: "Bread", description: "Whole grain bread, sliced", price: 2.49 },
    { name: "Milk", description: "Whole milk, 1 gallon", price: 4.29 },
    { name: "Butter", description: "Unsalted butter, 1 lb", price: 4.99 },
    { name: "Cereal", description: "Breakfast cereal, family size", price: 5.49 },
    { name: "Orange Juice", description: "Fresh squeezed orange juice, 64 oz", price: 4.99 },
  ],
  dairy: [
    { name: "Milk", description: "Whole milk, 1 gallon", price: 4.29 },
    { name: "Cheese", description: "Cheddar cheese, 8 oz", price: 3.99 },
    { name: "Yogurt", description: "Greek yogurt, 32 oz", price: 5.99 },
    { name: "Butter", description: "Unsalted butter, 1 lb", price: 4.99 },
    { name: "Sour Cream", description: "Sour cream, 16 oz", price: 2.99 },
    { name: "Cream Cheese", description: "Cream cheese, 8 oz", price: 3.49 },
  ],
  fruit: [
    { name: "Apples", description: "Red delicious apples, 3 lb bag", price: 4.99 },
    { name: "Bananas", description: "Organic bananas, 1 lb", price: 1.99 },
    { name: "Oranges", description: "Navel oranges, 3 lb bag", price: 4.49 },
    { name: "Strawberries", description: "Fresh strawberries, 1 lb", price: 3.99 },
    { name: "Grapes", description: "Red seedless grapes, 1 lb", price: 3.49 },
    { name: "Blueberries", description: "Fresh blueberries, 6 oz", price: 4.99 },
  ],
  vegetable: [
    { name: "Carrots", description: "Fresh carrots, 1 lb bag", price: 1.99 },
    { name: "Lettuce", description: "Romaine lettuce, 1 head", price: 2.49 },
    { name: "Tomatoes", description: "Roma tomatoes, 1 lb", price: 2.99 },
    { name: "Onions", description: "Yellow onions, 3 lb bag", price: 2.49 },
    { name: "Broccoli", description: "Fresh broccoli, 1 lb", price: 2.99 },
    { name: "Spinach", description: "Baby spinach, 10 oz", price: 3.49 },
  ],
};

export function searchGroceries(query: string): GroceryItem[] {
  const lowerQuery = query.toLowerCase();
  
  // Check for category matches
  for (const [category, items] of Object.entries(groceryDatabase)) {
    if (lowerQuery.includes(category)) {
      return items.slice(0, 6); // Limit to 6 items
    }
  }
  
  // Check for specific item matches
  const allItems: GroceryItem[] = [];
  for (const items of Object.values(groceryDatabase)) {
    allItems.push(...items);
  }
  
  const matched = allItems.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  );
  
  if (matched.length > 0) {
    return matched.slice(0, 6); // Limit to 6 items
  }
  
  // Default: return breakfast items (limited to 6)
  return groceryDatabase.breakfast.slice(0, 6);
}

const searchInputSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "User query describing what groceries they want to find (e.g., 'breakfast items', 'dairy products', 'fruits')",
    },
  },
  required: ["query"],
  additionalProperties: false,
} as const;

const searchParser = z.object({
  query: z.string(),
});

function toolDescriptorMeta() {
  return {
    "openai/outputTemplate": TEMPLATE_URI,
    "openai/toolInvocation/invoking": "Searching for groceries",
    "openai/toolInvocation/invoked": "Groceries found",
    "openai/widgetAccessible": true,
  } as const;
}

function toolInvocationMeta(invocation: string) {
  return {
    ...toolDescriptorMeta(),
    invocation,
  };
}

export function createGroceryServer(
  serverName: string,
  mimeType: string,
  widgetHtml: string
): Server {
  const tools: Tool[] = [
    {
      name: "search-groceries",
      title: "Search for groceries",
      description: "Takes a user query and returns a list of matching grocery items to display in the carousel.",
      inputSchema: searchInputSchema,
      _meta: toolDescriptorMeta(),
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
  ];

  const resources: Resource[] = [
    {
      name: "Grocery store widget",
      uri: TEMPLATE_URI,
      description: "Grocery store shopping cart widget markup",
      mimeType,
      _meta: toolDescriptorMeta(),
    },
  ];

  const resourceTemplates: ResourceTemplate[] = [
    {
      name: "Grocery store widget template",
      uriTemplate: TEMPLATE_URI,
      description: "Grocery store shopping cart widget markup",
      mimeType,
      _meta: toolDescriptorMeta(),
    },
  ];

  const server = new Server(
    {
      name: serverName,
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (_request: ReadResourceRequest) => ({
      contents: [
        {
          uri: TEMPLATE_URI,
          mimeType,
          text: widgetHtml,
          _meta: toolDescriptorMeta(),
        },
      ],
    })
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      if (request.params.name === "search-groceries") {
        const args = searchParser.parse(request.params.arguments ?? {});
        const items = searchGroceries(args.query);
        const payload: GroceryPayload = {
          items,
        };
        return {
          content: [
            {
              type: "text",
              text: `Found ${items.length} grocery items for "${args.query}"`,
            },
          ],
          structuredContent: payload,
          _meta: toolInvocationMeta("search-groceries"),
        };
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    }
  );

  return server;
}

