import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getOpenAiKeyMetadata } from "@/lib/ai/openai-provider";
import { getAppMeta } from "@/lib/app-meta";
import {
  getAllDocuments,
  getChangelogDocuments,
  getDocumentByUri,
  getPublicResourceCatalog,
  getRelatedDocuments,
  getSearchRefinementSuggestion,
  listDocuments,
  searchDocuments,
  suggestContextBundle,
} from "@/lib/content/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getPublicEnv } from "@/lib/env";
import { generateReferenceUi } from "@/lib/v0/reference-ui";
import {
  generateWorkflowArtifact,
  getWorkflowErrorCode,
} from "@/lib/workflows/service";
import {
  WORKFLOW_PROMPT_LIMIT,
  workflowContextScopeSchema,
  workflowGraphSchema,
  workflowJiraPackSchema,
} from "@/lib/workflows/types";
import {
  APPS,
  CONFIDENCE_LEVELS,
  DOCUMENT_KINDS,
  FRESHNESS_STATUSES,
  REVIEW_STATUSES,
  SOURCE_OF_TRUTH_VALUES,
  type DocumentRecord,
} from "@/lib/content/types";

const appSchema = z.enum(APPS);
const kindSchema = z.enum(DOCUMENT_KINDS);
const sourceOfTruthSchema = z.enum(SOURCE_OF_TRUTH_VALUES);
const reviewStatusSchema = z.enum(REVIEW_STATUSES);
const confidenceSchema = z.enum(CONFIDENCE_LEVELS);
const freshnessStatusSchema = z.enum(FRESHNESS_STATUSES);

const metadataShape = {
  task_type: z.array(z.string()),
  feature_area: z.array(z.string()),
  audience: z.array(z.string()),
  stage: z.array(z.string()),
  updated_at: z.string().nullable(),
  owner: z.string().nullable(),
  source_of_truth: sourceOfTruthSchema,
  review_status: reviewStatusSchema,
  confidence: confidenceSchema,
  freshness_status: freshnessStatusSchema,
};

const documentReferenceShape = {
  uri: z.string(),
  title: z.string(),
  reason: z.string(),
};

const resourceShape = {
  ...metadataShape,
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

const documentShape = {
  ...resourceWithPathShape,
  id: z.string(),
  content: z.string(),
  metadata: z.object(metadataShape),
  related_documents: z.array(z.object(documentReferenceShape)),
};

const searchResultShape = {
  ...resourceWithPathShape,
  score: z.number(),
  reason: z.string(),
};

const referenceUiShape = {
  status: z.enum(["ready", "unconfigured", "error"]),
  prompt: z.string(),
  chat_id: z.string().nullable(),
  chat_url: z.string().nullable(),
  demo_url: z.string().nullable(),
  version_id: z.string().nullable(),
  file_count: z.number(),
  files: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  notes: z.array(z.string()),
  error: z.string().nullable(),
};

const workflowContextSnapshotEntryShape = {
  uri: z.string(),
  title: z.string(),
  summary: z.string(),
  excerpt: z.string(),
};

const workflowArtifactShape = {
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  context_scope: workflowContextScopeSchema,
  created_at: z.string(),
  updated_at: z.string(),
  model_name: z.string(),
  latency_ms: z.number(),
  artifact_url: z.string(),
  api_url: z.string(),
  bpmn_download_url: z.string(),
};

const workflowArtifactResultShape = {
  artifact: z.object(workflowArtifactShape),
  flow: workflowGraphSchema,
  jira_pack: workflowJiraPackSchema,
  context_snapshot: z.array(z.object(workflowContextSnapshotEntryShape)),
  bpmn_xml: z.string().nullable(),
};

function createToolText(title: string, payload: unknown) {
  return `${title}\n\n${JSON.stringify(payload, null, 2)}`;
}

function serializeMetadata(document: DocumentRecord) {
  return {
    task_type: document.taskTypes,
    feature_area: document.featureAreas,
    audience: document.audiences,
    stage: document.stages,
    updated_at: document.updatedAt,
    owner: document.owner,
    source_of_truth: document.sourceOfTruth,
    review_status: document.reviewStatus,
    confidence: document.confidence,
    freshness_status: document.freshnessStatus,
  };
}

function serializeResource(document: DocumentRecord) {
  return {
    uri: document.uri,
    title: document.title,
    kind: document.kind,
    app: document.app,
    summary: document.summary,
    tags: document.tags,
    ...serializeMetadata(document),
  };
}

export function createMcpServer() {
  const meta = getAppMeta();
  const env = getPublicEnv();
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
      description: "List indexed context documents by structured filters such as app, kind, task type, or feature area.",
      inputSchema: {
        query: z.string().min(2).optional(),
        kind: kindSchema.optional(),
        category: kindSchema.optional(),
        app: appSchema.optional(),
        task_type: z.string().min(2).optional(),
        feature_area: z.string().min(2).optional(),
        audience: z.string().min(2).optional(),
        stage: z.string().min(2).optional(),
        source_of_truth: sourceOfTruthSchema.optional(),
        review_status: reviewStatusSchema.optional(),
        confidence: confidenceSchema.optional(),
        freshness_status: freshnessStatusSchema.optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
      outputSchema: {
        total: z.number(),
        documents: z.array(z.object(resourceShape)),
      },
    },
    async ({
      query,
      kind,
      category,
      app,
      task_type,
      feature_area,
      audience,
      stage,
      source_of_truth,
      review_status,
      confidence,
      freshness_status,
      limit,
    }) => {
      const documents = listDocuments({
        query,
        kind: kind ?? category,
        app,
        taskType: task_type,
        featureArea: feature_area,
        audience,
        stage,
        sourceOfTruth: source_of_truth,
        reviewStatus: review_status,
        confidence,
        freshnessStatus: freshness_status,
        limit,
      }).map((document) => serializeResource(document));

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
      const structuredDocument = document
        ? {
            ...serializeResource(document),
            id: document.id,
            path: document.path,
            content: document.content,
            metadata: serializeMetadata(document),
            related_documents: getRelatedDocuments(uri),
          }
        : null;

      return {
        content: [
          {
            type: "text",
            text: createToolText("Document lookup", { document: structuredDocument }),
          },
        ],
        structuredContent: {
          document: structuredDocument,
        },
      };
    },
  );

  server.registerTool(
    "search_context",
    {
      description: "Search context with lexical ranking plus metadata bias for app, task type, feature area, and freshness.",
      inputSchema: {
        query: z.string().min(2),
        kind: kindSchema.optional(),
        category: kindSchema.optional(),
        app: appSchema.optional(),
        task_type: z.string().min(2).optional(),
        feature_area: z.string().min(2).optional(),
        audience: z.string().min(2).optional(),
        stage: z.string().min(2).optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
      outputSchema: {
        total: z.number(),
        refinement_suggestion: z.string().optional(),
        documents: z.array(z.object(searchResultShape)),
      },
    },
    async ({
      query,
      kind,
      category,
      app,
      task_type,
      feature_area,
      audience,
      stage,
      limit,
    }) => {
      const searchInput = {
        query,
        kind: kind ?? category,
        app,
        taskType: task_type,
        featureArea: feature_area,
        audience,
        stage,
        limit,
      };
      const documents = searchDocuments(searchInput).map((result) => ({
        ...serializeResource(result.document),
        path: result.document.path,
        score: result.score,
        reason: result.reason,
      }));
      const refinementSuggestion = getSearchRefinementSuggestion(searchInput);

      return {
        content: [
          {
            type: "text",
            text: createToolText(`Search results for "${query}"`, {
              total: documents.length,
              refinement_suggestion: refinementSuggestion,
              documents,
            }),
          },
        ],
        structuredContent: {
          total: documents.length,
          refinement_suggestion: refinementSuggestion,
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
        ...serializeResource(document),
        path: document.path,
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
        feature_area: z.string().min(2).optional(),
      },
      outputSchema: {
        bundle_name: z.string(),
        taskType: z.string(),
        app: appSchema.nullable(),
        feature_area: z.string().nullable(),
        rationale: z.string(),
        required: z.array(z.object(documentReferenceShape)),
        optional: z.array(z.object(documentReferenceShape)),
        resources: z.array(z.object(documentReferenceShape)),
      },
    },
    async ({ task_type, app, feature_area }) => {
      const bundle = suggestContextBundle(task_type, app, feature_area);
      const structuredContent = {
        bundle_name: bundle.bundleName,
        taskType: bundle.taskType,
        app: bundle.app,
        feature_area: bundle.featureArea,
        rationale: bundle.rationale,
        required: bundle.required,
        optional: bundle.optional,
        resources: bundle.resources,
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

  server.registerTool(
    "get_resource_catalog",
    {
      description: "Get a health-check summary of the indexed MCP resource inventory.",
      inputSchema: {},
      outputSchema: {
        total: z.number(),
        by_kind: z.record(z.string(), z.number()),
        by_app: z.record(z.string(), z.number()),
        by_freshness: z.record(z.string(), z.number()),
        documents: z.array(z.object(resourceShape)),
      },
    },
    async () => {
      const catalog = getPublicResourceCatalog();
      const structuredContent = {
        total: catalog.total,
        by_kind: catalog.byKind,
        by_app: catalog.byApp,
        by_freshness: catalog.byFreshness,
        documents: catalog.documents.map((document) => serializeResource(document)),
      };

      return {
        content: [
          {
            type: "text",
            text: createToolText("Resource catalog", structuredContent),
          },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "generate_workflow_artifact",
    {
      description: "Generate and persist a workflow artifact with a BPMN-ready graph, Jira pack, and shareable URLs.",
      inputSchema: {
        prompt: z.string().trim().min(20).max(WORKFLOW_PROMPT_LIMIT),
        context_scope: workflowContextScopeSchema,
        include_bpmn_xml: z.boolean().optional(),
      },
      outputSchema: workflowArtifactResultShape,
    },
    async ({ prompt, context_scope, include_bpmn_xml }) => {
      if (!isDatabaseConfigured()) {
        throw new Error(
          "Workflow generation is unavailable right now because the database is not configured.",
        );
      }

      const keyMetadata = await getOpenAiKeyMetadata();
      if (keyMetadata.status !== "active") {
        throw new Error(
          "Workflow generation is unavailable right now because the AI provider key is not active.",
        );
      }

      try {
        const artifact = await generateWorkflowArtifact({
          prompt,
          contextScope: context_scope,
        });

        const artifactUrl = `${env.baseUrl}/workflows/${artifact.slug}`;
        const apiUrl = `${env.baseUrl}/api/workflows/${artifact.slug}`;
        const bpmnDownloadUrl = `${apiUrl}?download=xml`;

        const structuredContent = {
          artifact: {
            id: artifact.id,
            slug: artifact.slug,
            title: artifact.title,
            summary: artifact.summary,
            context_scope: artifact.contextScope,
            created_at: artifact.createdAt.toISOString(),
            updated_at: artifact.updatedAt.toISOString(),
            model_name: artifact.modelName,
            latency_ms: artifact.latencyMs,
            artifact_url: artifactUrl,
            api_url: apiUrl,
            bpmn_download_url: bpmnDownloadUrl,
          },
          flow: artifact.flowGraphJson,
          jira_pack: artifact.jiraPackJson,
          context_snapshot: artifact.contextSnapshot,
          bpmn_xml: include_bpmn_xml ? artifact.bpmnXml : null,
        };

        return {
          content: [
            {
              type: "text",
              text: createToolText("Workflow artifact", structuredContent),
            },
          ],
          structuredContent,
        };
      } catch (error) {
        const code = getWorkflowErrorCode(error);
        if (code === "openai_unavailable") {
          throw new Error(
            "Workflow generation is unavailable right now because the AI provider key is not active.",
          );
        }

        throw error instanceof Error ? error : new Error("Workflow generation failed.");
      }
    },
  );

  server.registerTool(
    "generate_reference_ui",
    {
      description: "Generate a very basic reference UI with v0 from the full confirmed UX/UI task and return preview URLs plus file names.",
      inputSchema: {
        confirmed_task: z.string().min(20),
        feature_name: z.string().min(3).optional(),
        app: appSchema.optional(),
        feature_area: z.string().min(2).optional(),
        goal: z.string().min(2).optional(),
        audience: z.string().min(2).optional(),
        notes: z.string().min(2).optional(),
      },
      outputSchema: referenceUiShape,
    },
    async ({ confirmed_task, feature_name, app, feature_area, goal, audience, notes }) => {
      const result = await generateReferenceUi({
        confirmedTask: confirmed_task,
        app,
        featureName: feature_name,
        featureArea: feature_area,
        goal,
        audience,
        notes,
      });

      const structuredContent = {
        status: result.status,
        prompt: result.prompt,
        chat_id: result.chatId,
        chat_url: result.chatUrl,
        demo_url: result.demoUrl,
        version_id: result.versionId,
        file_count: result.fileCount,
        files: result.files,
        notes: result.notes,
        error: result.error,
      };

      return {
        content: [
          {
            type: "text",
            text: createToolText("Reference UI", structuredContent),
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
