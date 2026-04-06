import path from "node:path";

import { APPS, type AppName, type DocumentKind } from "@/lib/content/types";

const TITLE_FALLBACKS: Record<string, string> = {
  "context/references/CUSTOMER_SEGMENTS.md": "Customer Segments",
  "context/references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md":
    "Discovery Synthesis Template",
  "context/references/prd/PRD_DELIVERY_GUIDELINES.md":
    "PRD Delivery Guidelines",
  "context/references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md":
    "Socratic Questioning Framework",
  "context/help-docs/references/PILLAR_PAGE_TEMPLATE.md":
    "Pillar Page Template",
  "context/product-analysis/references/DEVILS_ADVOCATE_METHOD.md":
    "Devil's Advocate Method",
  "context/product-analysis/references/DHM_FRAMEWORK.md": "DHM Framework",
  "context/product-analysis/references/SWOT_FRAMEWORK.md": "SWOT Framework",
};

export function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

export function getAppFromPath(relativePath: string): AppName | null {
  if (relativePath.startsWith("context/lock/")) {
    return "lock";
  }

  if (relativePath.startsWith("context/quote/")) {
    return "quote";
  }

  if (relativePath.startsWith("context/solution/")) {
    return "solution";
  }

  return null;
}

export function getDocumentKind(relativePath: string): DocumentKind {
  if (relativePath === "context/COMPANY.md") {
    return "company";
  }

  if (
    relativePath === "context/lock/SKILL.md" ||
    relativePath === "context/quote/SKILL.md" ||
    relativePath === "context/solution/SKILL.md"
  ) {
    return "app-skill";
  }

  if (relativePath.endsWith("/references/APP_CONTEXT.md")) {
    return "app-context";
  }

  if (relativePath.endsWith("/references/COMPETITIVE_CONTEXT.md")) {
    return "competitive";
  }

  if (
    relativePath.includes("/references/prd/") ||
    relativePath.includes("/references/discovery/") ||
    relativePath.includes("/help-docs/references/") ||
    relativePath.includes("/product-analysis/references/")
  ) {
    return "template";
  }

  if (relativePath.startsWith("context/changelog/")) {
    return "changelog";
  }

  return "reference";
}

export function buildDocumentId(relativePath: string): string {
  return relativePath
    .replace(/^context\//, "")
    .replace(/\.md$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function getDocumentUri(relativePath: string): string {
  if (relativePath === "context/COMPANY.md") {
    return "bss://company";
  }

  if (relativePath === "context/references/CUSTOMER_SEGMENTS.md") {
    return "bss://segments";
  }

  if (relativePath === "context/references/discovery/DISCOVERY_SYNTHESIS_TEMPLATE.md") {
    return "bss://template/discovery";
  }

  if (relativePath === "context/references/prd/PRD_DELIVERY_GUIDELINES.md") {
    return "bss://template/prd";
  }

  if (relativePath === "context/references/prd/SOCRATIC_QUESTIONING_FRAMEWORK.md") {
    return "bss://reference/prd/socratic-questioning";
  }

  if (relativePath === "context/help-docs/SKILL.md") {
    return "bss://reference/help-doc-skill";
  }

  if (relativePath === "context/help-docs/references/PILLAR_PAGE_TEMPLATE.md") {
    return "bss://template/help-doc";
  }

  if (relativePath === "context/product-analysis/SKILL.md") {
    return "bss://reference/product-analysis";
  }

  if (relativePath === "context/product-analysis/references/DEVILS_ADVOCATE_METHOD.md") {
    return "bss://template/product-analysis/devils-advocate";
  }

  if (relativePath === "context/product-analysis/references/DHM_FRAMEWORK.md") {
    return "bss://template/product-analysis/dhm";
  }

  if (relativePath === "context/product-analysis/references/SWOT_FRAMEWORK.md") {
    return "bss://template/product-analysis/swot";
  }

  const app = getAppFromPath(relativePath);
  if (app && relativePath === `context/${app}/SKILL.md`) {
    return `bss://app/${app}/skill`;
  }

  if (app && relativePath === `context/${app}/references/APP_CONTEXT.md`) {
    return `bss://app/${app}/context`;
  }

  if (app && relativePath === `context/${app}/references/COMPETITIVE_CONTEXT.md`) {
    return `bss://app/${app}/competitive`;
  }

  if (relativePath.startsWith("context/changelog/")) {
    const slug = path.basename(relativePath, ".md");
    return `bss://changelog/${slug}`;
  }

  return `bss://reference/${buildDocumentId(relativePath)}`;
}

export function inferTitle(relativePath: string, markdown: string): string {
  const lines = markdown.split("\n").map((line) => line.trim());
  const heading = lines.find((line) => line.startsWith("# "));
  if (heading) {
    return heading.replace(/^#\s+/, "").trim();
  }

  return (
    TITLE_FALLBACKS[relativePath] ??
    path
      .basename(relativePath, ".md")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferSummary(markdown: string): string {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.startsWith("#"))
    .map((part) => stripMarkdown(part))
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs[0].slice(0, 220);
  }

  return stripMarkdown(markdown).slice(0, 220);
}

export function inferTags(relativePath: string, title: string, summary: string): string[] {
  const app = getAppFromPath(relativePath);
  const tags = new Set<string>();

  tags.add(getDocumentKind(relativePath));
  if (app) {
    tags.add(app);
  }

  if (relativePath.startsWith("context/changelog/")) {
    tags.add("changelog");
  }

  for (const part of relativePath.split("/")) {
    if (!part.endsWith(".md") && !part.startsWith(".")) {
      tags.add(part.toLowerCase());
    }
  }

  for (const term of `${title} ${summary}`.toLowerCase().match(/[a-z0-9-]+/g) ?? []) {
    if (term.length > 3) {
      tags.add(term);
    }
  }

  return Array.from(tags);
}

export function getChangelogApp(relativePath: string): AppName | null {
  const lower = relativePath.toLowerCase();
  if (lower.includes("lock")) {
    return "lock";
  }

  if (lower.includes("quote") || lower.includes("quick")) {
    return "quote";
  }

  if (lower.includes("solution")) {
    return "solution";
  }

  return null;
}

export function isKnownApp(value: string | null | undefined): value is AppName {
  return Boolean(value && APPS.includes(value as AppName));
}

export const searchFields = ["title", "summary", "content", "tags"] as const;

export const searchOptions = {
  fields: [...searchFields] as string[],
  storeFields: [
    "id",
    "uri",
    "title",
    "kind",
    "app",
    "path",
    "summary",
    "content",
    "tags",
  ] as string[],
  searchOptions: {
    boost: {
      title: 4,
      summary: 2,
      tags: 3,
      content: 1,
    },
    fuzzy: 0.2,
    prefix: true,
  },
} as const;
