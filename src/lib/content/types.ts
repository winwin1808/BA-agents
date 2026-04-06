export const APPS = ["lock", "quote", "solution"] as const;
export const DOCUMENT_KINDS = [
  "company",
  "app-skill",
  "app-context",
  "competitive",
  "template",
  "changelog",
  "reference",
] as const;

export type AppName = (typeof APPS)[number];
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export interface DocumentRecord {
  id: string;
  uri: string;
  title: string;
  kind: DocumentKind;
  app: AppName | null;
  path: string;
  summary: string;
  content: string;
  tags: string[];
}

export interface BundleSuggestion {
  taskType: string;
  app: AppName | null;
  rationale: string;
  resources: Array<{
    uri: string;
    title: string;
    reason: string;
  }>;
}
