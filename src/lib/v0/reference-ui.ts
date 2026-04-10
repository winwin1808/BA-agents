import { createClient, type ChatDetail } from "v0-sdk";

import { getV0ApiKeys } from "@/lib/env";
import type { AppName } from "@/lib/content/types";

type GenerateReferenceUiInput = {
  confirmedTask: string;
  app?: AppName | null;
  featureName?: string | null;
  featureArea?: string | null;
  goal?: string | null;
  audience?: string | null;
  notes?: string | null;
};

type ReferenceUiFile = {
  name: string;
};

export type ReferenceUiResult =
  | {
      status: "unconfigured";
      prompt: string;
      chatId: null;
      chatUrl: null;
      demoUrl: null;
      versionId: null;
      fileCount: number;
      files: ReferenceUiFile[];
      notes: string[];
      error: string | null;
    }
  | {
      status: "ready";
      prompt: string;
      chatId: string;
      chatUrl: string;
      demoUrl: string | null;
      versionId: string | null;
      fileCount: number;
      files: ReferenceUiFile[];
      notes: string[];
      error: string | null;
    }
  | {
      status: "error";
      prompt: string;
      chatId: null;
      chatUrl: null;
      demoUrl: null;
      versionId: null;
      fileCount: number;
      files: ReferenceUiFile[];
      notes: string[];
      error: string;
    };

type ClientEntry = {
  client: ReturnType<typeof createClient>;
  index: number;
  attempt: number;
  total: number;
};

const cachedClients = new Map<string, ReturnType<typeof createClient>>();
let nextClientIndex = 0;

const APP_NAMES: Record<AppName, string> = {
  lock: "BSS B2B Lock, Login & Password",
  quote: "BSS B2B Request a Quote, Quick",
  solution: "BSS B2B Wholesale Solution",
};

const APP_UI_HINTS: Record<AppName, string> = {
  lock: "Prefer one compact merchant-admin setup page with a small storefront preview block.",
  quote: "Prefer one buyer-facing page or one compact admin page focused on quote and quick-order flows.",
  solution: "Prefer one merchant-admin configuration page with grouped settings and a tiny preview state.",
};

function getClient(apiKey: string) {
  const cachedClient = cachedClients.get(apiKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = createClient({ apiKey });
  cachedClients.set(apiKey, client);
  return client;
}

function getClientRotation(): ClientEntry[] {
  const apiKeys = getV0ApiKeys();
  if (apiKeys.length === 0) {
    return [];
  }

  const startIndex = nextClientIndex % apiKeys.length;

  return Array.from({ length: apiKeys.length }, (_, offset) => {
    const index = (startIndex + offset) % apiKeys.length;
    return {
      client: getClient(apiKeys[index]!),
      index,
      attempt: offset + 1,
      total: apiKeys.length,
    };
  });
}

function advanceClientRotation(index: number, total: number) {
  if (total <= 0) {
    nextClientIndex = 0;
    return;
  }

  nextClientIndex = (index + 1) % total;
}

function buildPrompt(input: GenerateReferenceUiInput) {
  const lines = [
    "Create a very basic reference UI for an internal BA/PM discussion.",
    input.app ? `App: ${APP_NAMES[input.app]}` : null,
    input.featureName ? `Feature: ${input.featureName}` : null,
    input.featureArea ? `Feature area: ${input.featureArea}` : null,
    input.goal ? `Primary goal: ${input.goal}` : null,
    `Audience: ${input.audience ?? "merchant admin"}`,
    input.notes ? `Notes: ${input.notes}` : null,
    "Confirmed UX/UI task:",
    input.confirmedTask,
    "Constraints:",
    "- Single page only.",
    "- Keep the UI intentionally basic to reduce token usage.",
    "- Use React + Tailwind only.",
    "- The generated TSX must compile without manual fixes.",
    "- No backend, auth, database, charts, animations, or advanced state.",
    "- Use simple inline mock data.",
    "- At most 3 main sections.",
    "- Keep copy short and functional.",
    "- Focus on layout and information hierarchy, not polish.",
    "- All visible copy must be JSX-safe.",
    "- Every text label, option, badge, table cell, mock-data value, and object string must be emitted as valid JSX text or a quoted JavaScript string.",
    "- Never output bare words or slash-separated phrases inside JavaScript objects, arrays, props, or expressions unless they are quoted strings.",
    "- Avoid prose copied verbatim into code-like structures. If you need sample content, keep it short and wrap every value in quotes.",
    "- Never place raw '<' or '>' characters directly inside JSX text nodes, labels, table cells, or <option> text.",
    "- Rewrite comparison copy into words. Example: use 'Gold Tier (Annual over $500k)' instead of 'Gold Tier (Annual > $500k)'.",
    "- Rewrite '>=' as 'at least', '<=' as 'up to' or 'at most', '>' as 'over', and '<' as 'under' when those symbols appear in UI copy.",
    "- If a special character is unavoidable, escape it correctly for TSX.",
    input.app ? APP_UI_HINTS[input.app] : null,
  ];

  return lines.filter(Boolean).join("\n");
}

function buildSystemPrompt() {
  return [
    "You generate minimal UI references.",
    "Keep outputs small, static, and easy to scan.",
    "Avoid fancy visuals, dark mode, icon libraries, charts, multi-step flows, and complex interactions.",
    "Use a single responsive page with the minimum structure needed to communicate the concept.",
    "Write code that parses on the first run.",
    "Return only valid React + Tailwind TSX.",
    "When writing mock data, every string value must be quoted.",
    "Never leave bare identifiers as visible content, sample values, or object properties.",
    "Do not use raw '<' or '>' characters inside JSX text content; rewrite the copy or escape it for TSX.",
  ].join(" ");
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown v0 error.";
}

function shouldTryNextClient(error: unknown) {
  const message = formatError(error).toLowerCase();

  return [
    "401",
    "403",
    "429",
    "500",
    "502",
    "503",
    "504",
    "unauthorized",
    "forbidden",
    "rate limit",
    "rate-limit",
    "too many requests",
    "quota",
    "credit",
    "invalid api key",
    "temporarily unavailable",
    "timeout",
    "timed out",
    "fetch failed",
    "network",
  ].some((needle) => message.includes(needle));
}

export async function generateReferenceUi(
  input: GenerateReferenceUiInput,
): Promise<ReferenceUiResult> {
  const prompt = buildPrompt(input);
  const clients = getClientRotation();

  if (clients.length === 0) {
    return {
      status: "unconfigured",
      prompt,
      chatId: null,
      chatUrl: null,
      demoUrl: null,
      versionId: null,
      fileCount: 0,
      files: [],
      notes: ["Set V0_API_KEYS or V0_API_KEY to enable v0 reference UI generation."],
      error: null,
    };
  }

  let lastError: unknown = null;
  let rotatedAfterFailure = false;

  for (const entry of clients) {
    try {
      const chat = (await entry.client.chats.create({
        message: prompt,
        system: buildSystemPrompt(),
        chatPrivacy: "private",
        responseMode: "sync",
        modelConfiguration: {
          imageGenerations: false,
          thinking: false,
        },
        metadata: {
          source: "ba-agents-mcp",
          mode: "reference-ui",
          app: input.app ?? "suite",
          featureName: input.featureName ?? null,
          featureArea: input.featureArea ?? null,
        },
      })) as ChatDetail;

      advanceClientRotation(entry.index, entry.total);

      const files = (chat.latestVersion?.files ?? []).map((file) => ({
        name: file.name,
      }));
      const notes = [
        "Output is intentionally constrained to a basic reference UI.",
      ];

      if (clients.length > 1) {
        notes.push("v0 key rotation is enabled for this server.");
      }

      if (rotatedAfterFailure) {
        notes.push("This request succeeded after rotating past an unavailable v0 key.");
      }

      notes.push(
        "Use the demo URL for preview and the chat URL for follow-up refinement in v0.",
      );

      return {
        status: "ready",
        prompt,
        chatId: chat.id,
        chatUrl: chat.webUrl,
        demoUrl: chat.latestVersion?.demoUrl ?? null,
        versionId: chat.latestVersion?.id ?? null,
        fileCount: files.length,
        files: files.slice(0, 8),
        notes,
        error: null,
      };
    } catch (error) {
      lastError = error;

      if (entry.attempt < clients.length && shouldTryNextClient(error)) {
        rotatedAfterFailure = true;
        continue;
      }

      break;
    }
  }

  return {
    status: "error",
    prompt,
    chatId: null,
    chatUrl: null,
    demoUrl: null,
    versionId: null,
    fileCount: 0,
    files: [],
    notes: ["The v0 request failed before a reference UI could be generated."],
    error: formatError(lastError),
  };
}
