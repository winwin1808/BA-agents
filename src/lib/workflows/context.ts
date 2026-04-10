import { getChangelogDocuments, getDocumentByUri } from "@/lib/content/server";
import type { AppName } from "@/lib/content/types";
import type {
  WorkflowAppScope,
  WorkflowContextScope,
  WorkflowContextSnapshotEntry,
} from "@/lib/workflows/types";

const EXCERPT_LIMIT = 600;

function excerptContent(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= EXCERPT_LIMIT) {
    return normalized;
  }

  return `${normalized.slice(0, EXCERPT_LIMIT - 1).trimEnd()}…`;
}

function toSnapshotEntry(uri: string): WorkflowContextSnapshotEntry | null {
  const document = getDocumentByUri(uri);
  if (!document) {
    return null;
  }

  return {
    uri: document.uri,
    title: document.title,
    summary: document.summary,
    excerpt: excerptContent(document.content),
  };
}

function appScopeToApp(scope: WorkflowContextScope): AppName | null {
  switch (scope) {
    case "lock":
    case "quote":
    case "solution":
      return scope;
    case "cross_suite":
      return null;
  }
}

export function buildWorkflowContextSnapshot(
  scope: WorkflowAppScope,
): WorkflowContextSnapshotEntry[] {
  const app = scope === "cross_suite" ? null : scope;
  const baseUris = scope === "cross_suite"
    ? ["bss://company", "bss://segments", "bss://template/prd"]
    : [`bss://app/${scope}/context`, "bss://template/prd"];

  const entries = baseUris
    .map((uri) => toSnapshotEntry(uri))
    .filter((entry): entry is WorkflowContextSnapshotEntry => Boolean(entry));

  const changelogEntries = getChangelogDocuments(app ?? "suite", undefined, 1)
    .map((document) => ({
      uri: document.uri,
      title: document.title,
      summary: document.summary,
      excerpt: excerptContent(document.content),
    }));

  return [...entries, ...changelogEntries].slice(0, 4);
}

export function buildWorkflowContextPrompt(
  scope: WorkflowContextScope,
  snapshot: WorkflowContextSnapshotEntry[],
) {
  const app = appScopeToApp(scope);
  const scopeLabel = app ? app : "cross-suite";
  const documents = snapshot
    .map(
      (entry) =>
        [
          `Document: ${entry.title} (${entry.uri})`,
          `Summary: ${entry.summary}`,
          `Key excerpt: ${entry.excerpt}`,
        ].join("\n"),
    )
    .join("\n\n");

  return [
    `Context scope: ${scopeLabel}.`,
    "Use repo context only to align feature wording and app terminology.",
    "Keep the user workflow brief as the main source of truth for task-specific logic.",
    documents,
  ].join("\n\n");
}
