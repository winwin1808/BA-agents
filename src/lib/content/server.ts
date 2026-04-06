import MiniSearch from "minisearch";

import manifestData from "@/generated/content-manifest.json";
import searchIndexData from "@/generated/content-search-index.json";
import {
  getAppFromPath,
  getChangelogApp,
  isKnownApp,
  searchOptions,
} from "@/lib/content/config";
import type { AppName, BundleSuggestion, DocumentKind, DocumentRecord } from "@/lib/content/types";

const manifest = manifestData as DocumentRecord[];

let searchIndex: MiniSearch<DocumentRecord> | null = null;

function ensureSearchIndex(): MiniSearch<DocumentRecord> {
  if (!searchIndex) {
    searchIndex = MiniSearch.loadJSON(
      JSON.stringify(searchIndexData),
      searchOptions,
    ) as MiniSearch<DocumentRecord>;
  }

  return searchIndex;
}

export function getAllDocuments(): DocumentRecord[] {
  return manifest;
}

export function getDocumentByUri(uri: string): DocumentRecord | null {
  return manifest.find((document) => document.uri === uri) ?? null;
}

export function listDocuments(filters?: {
  category?: DocumentKind;
  app?: AppName;
}): DocumentRecord[] {
  return manifest.filter((document) => {
    if (filters?.category && document.kind !== filters.category) {
      return false;
    }

    if (filters?.app && document.app !== filters.app) {
      return false;
    }

    return true;
  });
}

export function searchDocuments(input: {
  query: string;
  category?: DocumentKind;
  app?: AppName;
  limit?: number;
}): DocumentRecord[] {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
  const results = ensureSearchIndex().search(input.query, {
    filter: (result) => {
      if (input.category && result.kind !== input.category) {
        return false;
      }

      if (input.app && result.app !== input.app) {
        return false;
      }

      return true;
    },
    combineWith: "AND",
  });

  return results.slice(0, limit).map((result) => {
    const document = getDocumentByUri(result.uri);
    return document ?? (result as unknown as DocumentRecord);
  });
}

export function getChangelogDocuments(app?: AppName | "suite", query?: string, limit = 10) {
  let documents = manifest.filter((document) => document.kind === "changelog");

  if (app === "suite") {
    documents = documents.filter((document) => getChangelogApp(document.path) === null);
  } else if (app) {
    documents = documents.filter((document) => getChangelogApp(document.path) === app);
  }

  if (query) {
    const results = searchDocuments({
      query,
      category: "changelog",
      app: app && app !== "suite" ? app : undefined,
      limit,
    });

    if (app === "suite") {
      return results.filter((document) => getChangelogApp(document.path) === null).slice(0, limit);
    }

    return results.slice(0, limit);
  }

  return documents.slice(0, limit);
}

function resolveAppContextUris(app: AppName | null): string[] {
  if (!app) {
    return ["bss://company", "bss://segments"];
  }

  return [
    "bss://company",
    "bss://segments",
    `bss://app/${app}/skill`,
    `bss://app/${app}/context`,
    `bss://app/${app}/competitive`,
  ];
}

export function suggestContextBundle(taskTypeRaw: string, appRaw?: string | null): BundleSuggestion {
  const taskType = taskTypeRaw.trim().toLowerCase();
  const appCandidate = appRaw ?? null;
  const app: AppName | null = isKnownApp(appCandidate) ? appCandidate : null;

  const baseUris = resolveAppContextUris(app);
  const uriSet = new Set(baseUris);
  let rationale = "Core company and app context for the requested task.";

  if (taskType.includes("prd") || taskType.includes("rqm") || taskType.includes("jira")) {
    uriSet.add("bss://template/prd");
    uriSet.add("bss://reference/prd/socratic-questioning");
    rationale = "PRD work needs company context, app logic, delivery guidelines, and clarification prompts.";
  } else if (
    taskType.includes("discover") ||
    taskType.includes("research") ||
    taskType.includes("insight")
  ) {
    uriSet.add("bss://template/discovery");
    uriSet.add("bss://reference/product-analysis");
    rationale = "Discovery synthesis needs evidence structure, company framing, and product-analysis context.";
  } else if (
    taskType.includes("help") ||
    taskType.includes("doc") ||
    taskType.includes("guide") ||
    taskType.includes("troubleshoot")
  ) {
    uriSet.add("bss://reference/help-doc-skill");
    uriSet.add("bss://template/help-doc");
    rationale = "Merchant-facing documentation needs help-doc guidance, app context, and setup limitations.";
  } else if (
    taskType.includes("strategy") ||
    taskType.includes("dhm") ||
    taskType.includes("swot") ||
    taskType.includes("devil")
  ) {
    uriSet.add("bss://reference/product-analysis");
    uriSet.add("bss://template/product-analysis/devils-advocate");
    uriSet.add("bss://template/product-analysis/dhm");
    uriSet.add("bss://template/product-analysis/swot");
    rationale = "Strategic analysis needs company framing plus the product-analysis frameworks.";
  }

  const resources = Array.from(uriSet)
    .map((uri) => getDocumentByUri(uri))
    .filter((document): document is DocumentRecord => Boolean(document))
    .map((document) => ({
      uri: document.uri,
      title: document.title,
      reason:
        document.uri === "bss://company"
          ? "Suite-level context and strategy."
          : document.uri === "bss://segments"
            ? "ICP, pain points, objections, and messaging."
            : document.kind === "app-context"
              ? "App-specific workflows and scope."
              : document.kind === "app-skill"
                ? "Expected structure and response contract."
                : document.kind === "competitive"
                  ? "Positioning and alternative landscape."
                  : document.kind === "changelog"
                    ? "Use shipped feature names and current public behavior."
                    : "Shared framework or template for this task.",
    }));

  return {
    taskType,
    app,
    rationale,
    resources,
  };
}

export function getPublicResourceCatalog() {
  return manifest.map((document) => ({
    uri: document.uri,
    title: document.title,
    kind: document.kind,
    app: document.app,
    summary: document.summary,
    tags: document.tags,
  }));
}

export function getAppCatalog() {
  return {
    lock: manifest.filter((document) => getAppFromPath(document.path) === "lock"),
    quote: manifest.filter((document) => getAppFromPath(document.path) === "quote"),
    solution: manifest.filter((document) => getAppFromPath(document.path) === "solution"),
  };
}
