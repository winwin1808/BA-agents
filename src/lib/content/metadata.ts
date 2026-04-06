import type {
  AppName,
  ConfidenceLevel,
  DocumentKind,
  FreshnessStatus,
  ReviewStatus,
  SourceOfTruth,
} from "./types";

type MetadataInput = {
  relativePath: string;
  title: string;
  summary: string;
  content: string;
  kind: DocumentKind;
  app: AppName | null;
  frontmatter: Record<string, unknown>;
};

type BuiltMetadata = {
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
};

const APP_DEFAULT_FEATURE_AREAS: Record<AppName, string[]> = {
  lock: [
    "access-control",
    "visibility",
    "hide-price",
    "theme-hiding",
    "checkout",
    "payment-methods",
    "shipping-methods",
  ],
  quote: [
    "rfq",
    "quote-form",
    "quote-history",
    "quote-to-order",
    "quick-order",
    "csv",
    "ordering",
  ],
  solution: [
    "registration",
    "segmentation",
    "pricing",
    "price-list",
    "custom-pricing",
    "volume-pricing",
    "order-limit",
    "quantity-increments",
    "net-terms",
    "manual-orders",
    "shipping-rates",
    "import-export",
  ],
};

const FEATURE_KEYWORDS: Array<{ area: string; patterns: string[] }> = [
  { area: "access-control", patterns: ["request access", "access control", "require login", "login lock", "passcode", "secret link", "email registration"] },
  { area: "visibility", patterns: ["hide products", "hide collections", "visibility", "gated", "gate catalog"] },
  { area: "hide-price", patterns: ["hide price", "price lock", "hidden-price", "google search results"] },
  { area: "theme-hiding", patterns: ["theme hiding", "theme element", "css selector", "native section", "native block"] },
  { area: "checkout", patterns: ["checkout lock", "checkout validation", "checkout guardrail", "cart drawers", "cart drawer"] },
  { area: "payment-methods", patterns: ["payment method", "accelerated checkout"] },
  { area: "shipping-methods", patterns: ["shipping method", "shipping rules", "shipping rates"] },
  { area: "rfq", patterns: ["request a quote", "rfq", "quote request"] },
  { area: "quote-form", patterns: ["quote form", "display mode", "quote request display mode"] },
  { area: "quote-history", patterns: ["quote history", "my quote history"] },
  { area: "quote-to-order", patterns: ["quote-to-order", "accepted quote", "draft-order handoff", "convert to an order"] },
  { area: "quick-order", patterns: ["quick order", "bulk ordering", "bulk add-to-cart"] },
  { area: "csv", patterns: ["csv", "bulk csv", "import template"] },
  { area: "ordering", patterns: ["repeat ordering", "reorder", "order flow"] },
  { area: "registration", patterns: ["registration form", "approval flow", "customer approval"] },
  { area: "segmentation", patterns: ["customer segment", "customer tag", "tagging strategy", "companies & locations"] },
  { area: "pricing", patterns: ["pricing", "price table", "discount logic"] },
  { area: "price-list", patterns: ["price list"] },
  { area: "custom-pricing", patterns: ["custom pricing", "price override"] },
  { area: "volume-pricing", patterns: ["volume pricing", "quantity break", "amount break"] },
  { area: "order-limit", patterns: ["order limit", "minimum order", "max order"] },
  { area: "quantity-increments", patterns: ["quantity increment", "quantity increments", "multiples"] },
  { area: "net-terms", patterns: ["net terms", "net term", "due date"] },
  { area: "manual-orders", patterns: ["manual order", "manual orders", "draft orders"] },
  { area: "import-export", patterns: ["import", "export", "background processing", "error files", "csv upload"] },
  { area: "persona", patterns: ["persona", "buying committee"] },
  { area: "messaging", patterns: ["messaging hooks", "positioning", "objections"] },
  { area: "strategy", patterns: ["dhm", "swot", "devil's advocate", "strategy kernel", "positioning"] },
  { area: "spec-writing", patterns: ["acceptance criteria", "jira breakdown", "requirement titles", "prd review"] },
  { area: "delivery", patterns: ["rollout", "delivery sequencing", "launch readiness"] },
  { area: "insight-synthesis", patterns: ["discovery synthesis", "hypothesis", "pain points", "evidence"] },
  { area: "merchant-education", patterns: ["help doc", "merchant-facing", "setup guide", "knowledge base"] },
  { area: "release", patterns: ["changelog", "what changed", "release", "merchant-visible"] },
];

const APP_HINTS: Array<{ app: AppName; patterns: string[] }> = [
  { app: "lock", patterns: ["b2b lock", "lock app", "login & password", "hide price", "request access", "passcode"] },
  { app: "quote", patterns: ["b2b quote", "quote app", "quick order", "request a quote", "rfq", "quote history"] },
  { app: "solution", patterns: ["wholesale solution", "b2b solution", "price list", "volume pricing", "registration form", "net terms"] },
];

function normalizeToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s/]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniq(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (value ? normalizeToken(value) : null))
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function getFrontmatterValue(frontmatter: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in frontmatter) {
      return frontmatter[key];
    }
  }

  return null;
}

function readStringList(frontmatter: Record<string, unknown>, keys: string[]) {
  const value = getFrontmatterValue(frontmatter, keys);

  if (typeof value === "string") {
    return uniq(value.split(/[|,]/g));
  }

  if (Array.isArray(value)) {
    return uniq(value.filter((item): item is string => typeof item === "string"));
  }

  return [];
}

function readStringValue(frontmatter: Record<string, unknown>, keys: string[]) {
  const value = getFrontmatterValue(frontmatter, keys);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toIsoDate(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function extractLatestDate(content: string, title: string) {
  const matches = `${title}\n${content}`.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4}\b/g,
  );

  if (!matches || matches.length === 0) {
    return null;
  }

  const parsed = matches
    .map((match) => toIsoDate(match))
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.localeCompare(left));

  return parsed[0] ?? null;
}

function inferTaskTypes(input: MetadataInput) {
  const explicit = readStringList(input.frontmatter, [
    "task_type",
    "task_types",
    "taskType",
    "taskTypes",
  ]);
  if (explicit.length > 0) {
    return explicit;
  }

  const { relativePath, kind } = input;

  if (kind === "company") {
    return ["planning", "discovery"];
  }

  if (kind === "app-context") {
    return ["prd", "discovery", "help-doc", "planning"];
  }

  if (kind === "app-skill") {
    return ["prd", "planning"];
  }

  if (kind === "competitive") {
    return ["competitive", "planning"];
  }

  if (kind === "changelog") {
    return ["release", "help-doc"];
  }

  if (relativePath === "context/references/CUSTOMER_SEGMENTS.md") {
    return ["discovery", "planning"];
  }

  if (relativePath.includes("/references/discovery/")) {
    return ["discovery"];
  }

  if (relativePath.includes("/references/prd/")) {
    return ["prd", "planning"];
  }

  if (relativePath.startsWith("context/help-docs/")) {
    return ["help-doc"];
  }

  if (relativePath.startsWith("context/product-analysis/")) {
    return ["planning", "competitive", "discovery"];
  }

  return ["planning"];
}

function inferFeatureAreas(input: MetadataInput) {
  const explicit = readStringList(input.frontmatter, [
    "feature_area",
    "feature_areas",
    "featureArea",
    "featureAreas",
  ]);
  if (explicit.length > 0) {
    return explicit;
  }

  const features = new Set<string>();
  const haystack = `${input.relativePath}\n${input.title}\n${input.summary}\n${input.content}`.toLowerCase();

  for (const entry of FEATURE_KEYWORDS) {
    if (entry.patterns.some((pattern) => haystack.includes(pattern))) {
      features.add(entry.area);
    }
  }

  if (input.app) {
    for (const hint of APP_HINTS) {
      if (hint.app === input.app && hint.patterns.some((pattern) => haystack.includes(pattern))) {
        for (const area of APP_DEFAULT_FEATURE_AREAS[input.app]) {
          if (features.size >= 8) {
            break;
          }
          features.add(area);
        }
      }
    }
  }

  if (features.size === 0 && input.app) {
    for (const area of APP_DEFAULT_FEATURE_AREAS[input.app].slice(0, 6)) {
      features.add(area);
    }
  }

  if (input.relativePath === "context/COMPANY.md") {
    for (const area of ["segmentation", "pricing", "rfq", "quick-order", "net-terms", "import-export"]) {
      features.add(area);
    }
  }

  if (input.relativePath === "context/references/CUSTOMER_SEGMENTS.md") {
    for (const area of ["persona", "messaging", "segmentation"]) {
      features.add(area);
    }
  }

  if (input.relativePath.includes("/references/prd/")) {
    for (const area of ["spec-writing", "delivery"]) {
      features.add(area);
    }
  }

  if (input.relativePath.includes("/references/discovery/")) {
    features.add("insight-synthesis");
  }

  if (input.relativePath.startsWith("context/help-docs/")) {
    for (const area of ["merchant-education", "release"]) {
      features.add(area);
    }
  }

  if (input.relativePath.startsWith("context/product-analysis/")) {
    features.add("strategy");
  }

  if (input.kind === "changelog") {
    features.add("release");
  }

  return Array.from(features);
}

function inferAudiences(input: MetadataInput) {
  const explicit = readStringList(input.frontmatter, ["audience", "audiences"]);
  if (explicit.length > 0) {
    return explicit;
  }

  if (input.kind === "changelog") {
    return ["merchant", "cs", "pm"];
  }

  if (input.relativePath.startsWith("context/help-docs/")) {
    return ["merchant", "cs", "pm"];
  }

  if (input.kind === "competitive") {
    return ["pm", "sales", "leadership"];
  }

  if (input.relativePath.includes("/references/prd/")) {
    return ["ba", "pm", "engineering"];
  }

  return ["ba", "pm"];
}

function inferStages(input: MetadataInput) {
  const explicit = readStringList(input.frontmatter, ["stage", "stages"]);
  if (explicit.length > 0) {
    return explicit;
  }

  if (input.kind === "changelog" || input.relativePath.startsWith("context/help-docs/")) {
    return ["launch", "post-launch"];
  }

  if (input.relativePath.includes("/references/discovery/")) {
    return ["discovery"];
  }

  if (
    input.kind === "competitive" ||
    input.relativePath === "context/COMPANY.md" ||
    input.relativePath === "context/references/CUSTOMER_SEGMENTS.md" ||
    input.relativePath.startsWith("context/product-analysis/")
  ) {
    return ["discovery", "definition"];
  }

  return ["definition", "delivery"];
}

function inferOwner(input: MetadataInput) {
  const explicit = readStringValue(input.frontmatter, ["owner"]);
  if (explicit) {
    return normalizeToken(explicit);
  }

  if (input.relativePath.startsWith("context/changelog/")) {
    return "product-marketing";
  }

  if (input.relativePath.startsWith("context/help-docs/")) {
    return "customer-success";
  }

  return "product";
}

function inferSourceOfTruth(input: MetadataInput) {
  const explicit = readStringValue(input.frontmatter, [
    "source_of_truth",
    "sourceOfTruth",
  ]);
  if (explicit) {
    return normalizeToken(explicit) as SourceOfTruth;
  }

  if (
    input.kind === "company" ||
    input.kind === "app-context" ||
    input.relativePath === "context/references/CUSTOMER_SEGMENTS.md" ||
    input.relativePath.includes("/references/prd/") ||
    input.relativePath.includes("/references/discovery/") ||
    input.relativePath === "context/help-docs/references/PILLAR_PAGE_TEMPLATE.md"
  ) {
    return "canonical";
  }

  if (
    input.kind === "changelog" &&
    !input.relativePath.endsWith("changelog-template.md") &&
    !input.relativePath.endsWith("changelog-package-2026-03-18.md")
  ) {
    return "canonical";
  }

  return "supporting";
}

function inferReviewStatus(input: MetadataInput, sourceOfTruth: SourceOfTruth) {
  const explicit = readStringValue(input.frontmatter, [
    "review_status",
    "reviewStatus",
  ]);
  if (explicit) {
    return normalizeToken(explicit) as ReviewStatus;
  }

  if (sourceOfTruth === "canonical") {
    return "canonical";
  }

  return "reviewed";
}

function inferConfidence(input: MetadataInput, sourceOfTruth: SourceOfTruth) {
  const explicit = readStringValue(input.frontmatter, ["confidence"]);
  if (explicit) {
    return normalizeToken(explicit) as ConfidenceLevel;
  }

  if (input.kind === "competitive") {
    return "medium";
  }

  return sourceOfTruth === "canonical" ? "high" : "medium";
}

function inferUpdatedAt(input: MetadataInput) {
  const explicit = readStringValue(input.frontmatter, ["updated_at", "updatedAt"]);
  if (explicit) {
    return toIsoDate(explicit);
  }

  if (input.kind === "changelog") {
    return extractLatestDate(input.content, input.title);
  }

  return null;
}

function inferFreshnessStatus(
  updatedAt: string | null,
  reviewStatus: ReviewStatus,
  sourceOfTruth: SourceOfTruth,
  confidence: ConfidenceLevel,
) {
  if (reviewStatus === "deprecated" || sourceOfTruth === "historical") {
    return "stale";
  }

  if (!updatedAt) {
    if (reviewStatus === "canonical" || confidence === "high") {
      return "stable";
    }
    return "undated";
  }

  const ageMs = Date.now() - Date.parse(updatedAt);
  const ageDays = Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24)));

  if (ageDays <= 180) {
    return "fresh";
  }

  if (ageDays <= 540) {
    return "stable";
  }

  return "stale";
}

export function normalizeFacetValue(value: string | null | undefined) {
  return value ? normalizeToken(value) : null;
}

export function metadataValueMatches(values: string[], filterValue: string | null | undefined) {
  const normalizedFilter = normalizeFacetValue(filterValue);
  if (!normalizedFilter) {
    return true;
  }

  return values.some((value) => value === normalizedFilter);
}

export function buildDocumentMetadata(input: MetadataInput): BuiltMetadata {
  const taskTypes = inferTaskTypes(input);
  const featureAreas = inferFeatureAreas(input);
  const audiences = inferAudiences(input);
  const stages = inferStages(input);
  const updatedAt = inferUpdatedAt(input);
  const owner = inferOwner(input);
  const sourceOfTruth = inferSourceOfTruth(input);
  const reviewStatus = inferReviewStatus(input, sourceOfTruth);
  const confidence = inferConfidence(input, sourceOfTruth);
  const freshnessStatus = inferFreshnessStatus(
    updatedAt,
    reviewStatus,
    sourceOfTruth,
    confidence,
  );

  return {
    taskTypes,
    featureAreas,
    audiences,
    stages,
    updatedAt,
    owner,
    sourceOfTruth,
    reviewStatus,
    confidence,
    freshnessStatus,
    metadataText: [
      ...taskTypes,
      ...featureAreas,
      ...audiences,
      ...stages,
      owner,
      sourceOfTruth,
      reviewStatus,
      confidence,
      freshnessStatus,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
