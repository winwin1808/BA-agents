import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getAppMeta } from "@/lib/app-meta";
import {
  getAllDocuments,
  getChangelogDocuments,
  getDocumentByUri,
  getPublicResourceCatalog,
  listDocuments,
  searchDocuments,
  suggestContextBundle,
} from "@/lib/content/server";
import { APPS, DOCUMENT_KINDS } from "@/lib/content/types";

const appSchema = z.enum(APPS);
const kindSchema = z.enum(DOCUMENT_KINDS);

const documentShape = {
  id: z.string(),
  uri: z.string(),
  title: z.string(),
  kind: kindSchema,
  app: appSchema.nullable(),
  path: z.string(),
  summary: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
};

const resourceShape = {
  uri: z.string(),
  title: z.string(),
  kind: kindSchema,
  app: appSchema.nullable(),
  summary: z.string(),
  tags: z.array(z.string()),
};

const resourceWithPathShape = {
  ...resourceShape,
  path: z.string(),
};

function createToolText(title: string, payload: unknown) {
  return `${title}\n\n${JSON.stringify(payload, null, 2)}`;
}

export function createMcpServer() {
  const meta = getAppMeta();
  const server = new McpServer({
    name: meta.name,
    title: meta.title,
    version: meta.version,
  });

  for (const document of getAllDocuments()) {
    server.registerResource(
      document.id,
      document.uri,
      {
        title: document.title,
        description: document.summary,
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [
          {
            uri: document.uri,
            mimeType: "text/markdown",
            text: document.content,
          },
        ],
      }),
    );
  }

  server.registerTool(
    "list_documents",
    {
      description: "List indexed context documents by optional category and app.",
      inputSchema: {
        category: kindSchema.optional(),
        app: appSchema.optional(),
      },
      outputSchema: {
        total: z.number(),
        documents: z.array(z.object(resourceShape)),
      },
    },
    async ({ category, app }) => {
      const documents = listDocuments({ category, app }).map((document) => ({
        uri: document.uri,
        title: document.title,
        kind: document.kind,
        app: document.app,
        summary: document.summary,
        tags: document.tags,
      }));

      return {
        content: [
          {
            type: "text",
            text: createToolText("Document catalog", {
              total: documents.length,
              documents,
            }),
          },
        ],
        structuredContent: {
          total: documents.length,
          documents,
        },
      };
    },
  );

  server.registerTool(
    "get_document",
    {
      description: "Retrieve a single document by stable bss:// URI.",
      inputSchema: {
        uri: z.string().describe("Stable bss:// URI of the document"),
      },
      outputSchema: {
        document: z.object(documentShape).nullable(),
      },
    },
    async ({ uri }) => {
      const document = getDocumentByUri(uri);
      return {
        content: [
          {
            type: "text",
            text: createToolText("Document lookup", { document }),
          },
        ],
        structuredContent: {
          document,
        },
      };
    },
  );

  server.registerTool(
    "search_context",
    {
      description: "Search indexed context content across titles, summaries, tags, and body text.",
      inputSchema: {
        query: z.string().min(2),
        category: kindSchema.optional(),
        app: appSchema.optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
      outputSchema: {
        total: z.number(),
        documents: z.array(z.object(resourceWithPathShape)),
      },
    },
    async ({ query, category, app, limit }) => {
      const documents = searchDocuments({ query, category, app, limit }).map((document) => ({
        uri: document.uri,
        title: document.title,
        kind: document.kind,
        app: document.app,
        path: document.path,
        summary: document.summary,
        tags: document.tags,
      }));

      return {
        content: [
          {
            type: "text",
            text: createToolText(`Search results for "${query}"`, {
              total: documents.length,
              documents,
            }),
          },
        ],
        structuredContent: {
          total: documents.length,
          documents,
        },
      };
    },
  );

  server.registerTool(
    "get_changelog",
    {
      description: "Find merchant-facing changelog entries by app and optional search query.",
      inputSchema: {
        app: z.enum([...APPS, "suite"] as const).optional(),
        query: z.string().optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
      outputSchema: {
        total: z.number(),
        documents: z.array(z.object(resourceWithPathShape)),
      },
    },
    async ({ app, query, limit }) => {
      const documents = getChangelogDocuments(app, query, limit).map((document) => ({
        uri: document.uri,
        title: document.title,
        kind: document.kind,
        app: document.app,
        path: document.path,
        summary: document.summary,
        tags: document.tags,
      }));

      return {
        content: [
          {
            type: "text",
            text: createToolText("Changelog results", {
              total: documents.length,
              documents,
            }),
          },
        ],
        structuredContent: {
          total: documents.length,
          documents,
        },
      };
    },
  );

  server.registerTool(
    "suggest_context_bundle",
    {
      description: "Recommend a minimal context bundle for a BA/PM task.",
      inputSchema: {
        task_type: z.string().min(2),
        app: appSchema.optional(),
      },
      outputSchema: {
        taskType: z.string(),
        app: appSchema.nullable(),
        rationale: z.string(),
        resources: z.array(
          z.object({
            uri: z.string(),
            title: z.string(),
            reason: z.string(),
          }),
        ),
      },
    },
    async ({ task_type, app }) => {
      const bundle = suggestContextBundle(task_type, app);
      const structuredContent = {
        taskType: bundle.taskType,
        app: bundle.app,
        rationale: bundle.rationale,
        resources: bundle.resources.map((resource) => ({
          uri: resource.uri,
          title: resource.title,
          reason: resource.reason,
        })),
      };

      return {
        content: [
          {
            type: "text",
            text: createToolText("Suggested context bundle", structuredContent),
          },
        ],
        structuredContent,
      };
    },
  );

  server.registerPrompt(
    "draft_prd",
    {
      description: "Draft a PRD or RQM using the BSS BA-agents context model.",
      argsSchema: {
        feature: z.string(),
        app: appSchema.optional(),
        goal: z.string().optional(),
      },
    },
    async ({ feature, app, goal }) => {
      const bundle = suggestContextBundle("prd", app);

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Draft a PRD for "${feature}".`,
                goal ? `Primary goal: ${goal}.` : null,
                "Use the PRD delivery guidelines and app context from these resources:",
                ...bundle.resources.map((resource) => `- ${resource.uri} (${resource.title})`),
                "Requirement titles must be in English. Requirement body content must be in Vietnamese.",
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "synthesize_discovery",
    {
      description: "Synthesize discovery inputs into evidence, inference, and opportunity framing.",
      argsSchema: {
        focus: z.string(),
        app: appSchema.optional(),
        time_window: z.string().optional(),
      },
    },
    async ({ focus, app, time_window }) => {
      const bundle = suggestContextBundle("discovery synthesis", app);

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Synthesize discovery for "${focus}".`,
                time_window ? `Time window: ${time_window}.` : null,
                "Use the Discovery Synthesis Template and relevant app/company context:",
                ...bundle.resources.map((resource) => `- ${resource.uri} (${resource.title})`),
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "write_help_doc",
    {
      description: "Write a merchant-facing pillar-page help document.",
      argsSchema: {
        feature: z.string(),
        app: appSchema.optional(),
        desired_outcome: z.string().optional(),
      },
    },
    async ({ feature, app, desired_outcome }) => {
      const bundle = suggestContextBundle("help doc", app);

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Write a help doc for "${feature}".`,
                desired_outcome ? `Desired outcome: ${desired_outcome}.` : null,
                "Use the help-doc template, changelog naming, and relevant app context from:",
                ...bundle.resources.map((resource) => `- ${resource.uri} (${resource.title})`),
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "analyze_strategy",
    {
      description: "Analyze a product or portfolio initiative with the strategic frameworks in this repo.",
      argsSchema: {
        initiative: z.string(),
        app: appSchema.optional(),
        framework: z.enum(["devils-advocate", "dhm", "swot", "mixed"]).optional(),
      },
    },
    async ({ initiative, app, framework }) => {
      const bundle = suggestContextBundle(framework ?? "strategy", app);

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Analyze the initiative "${initiative}".`,
                framework ? `Preferred framework: ${framework}.` : null,
                "Use company, segment, app, and product-analysis resources:",
                ...bundle.resources.map((resource) => `- ${resource.uri} (${resource.title})`),
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        ],
      };
    },
  );

  server.registerResource(
    "resource-catalog",
    "bss://catalog",
    {
      title: "Resource Catalog",
      description: "Public catalog of indexed MCP resources.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "bss://catalog",
          mimeType: "application/json",
          text: JSON.stringify(getPublicResourceCatalog(), null, 2),
        },
      ],
    }),
  );

  return server;
}
