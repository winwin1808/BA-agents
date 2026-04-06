export const APPS = ["lock", "quote", "solution"] as const;
export const DOCUMENT_KINDS = [
  "company",
  "app-skill",
  "app-context",
  "competitive",
  "template",
  "changelog",
  "reference",
  "evidence",
  "playbook",
] as const;
export const SOURCE_OF_TRUTH_VALUES = [
  "canonical",
  "supporting",
  "historical",
] as const;
export const REVIEW_STATUSES = [
  "draft",
  "reviewed",
  "canonical",
  "deprecated",
] as const;
export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export const FRESHNESS_STATUSES = [
  "fresh",
  "stable",
  "stale",
  "undated",
] as const;

export type AppName = (typeof APPS)[number];
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export type SourceOfTruth = (typeof SOURCE_OF_TRUTH_VALUES)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type FreshnessStatus = (typeof FRESHNESS_STATUSES)[number];

export interface DocumentReference {
  uri: string;
  title: string;
  reason: string;
}

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
  taskTypes: string[];
  featureAreas: string[];
  audiences: string[];
  stages: string[];
  updatedAt: string | null;
  owner: string | null;
  sourceOfTruth: SourceOfTruth;
  reviewStatus: ReviewStatus;
  confidence: ConfidenceLevel;
  freshnessStatus: FreshnessStatus;
  metadataText: string;
}

export interface BundleSuggestion {
  bundleName: string;
  taskType: string;
  app: AppName | null;
  featureArea: string | null;
  rationale: string;
  required: DocumentReference[];
  optional: DocumentReference[];
  resources: DocumentReference[];
}

export interface SearchResultRecord {
  document: DocumentRecord;
  score: number;
  reason: string;
}

export interface ResourceCatalogSummary {
  total: number;
  byKind: Record<string, number>;
  byApp: Record<string, number>;
  byFreshness: Record<string, number>;
  documents: DocumentRecord[];
}
