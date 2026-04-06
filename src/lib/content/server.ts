import MiniSearch from "minisearch";

import manifestData from "@/generated/content-manifest.json";
import searchIndexData from "@/generated/content-search-index.json";
import { getChangelogApp, isKnownApp, searchOptions } from "@/lib/content/config";
import {
  metadataValueMatches,
  normalizeFacetValue,
} from "@/lib/content/metadata";
import type {
  AppName,
  BundleSuggestion,
  DocumentKind,
  DocumentRecord,
  DocumentReference,
  ResourceCatalogSummary,
  SearchResultRecord,
} from "@/lib/content/types";

const manifest = manifestData as DocumentRecord[];

let searchIndex: MiniSearch<DocumentRecord> | null = null;

const RELEASE_QUERY_HINTS = [
  "release",
  "released",
  "launch",
  "launched",
  "latest",
  "recent",
  "changelog",
  "shipped",
  "rename",
  "renamed",
  "version",
  "what changed",
  "merchant-facing",
  "public behavior",
];

const TASK_HINTS: Record<string, string[]> = {
  prd: ["prd", "rqm", "spec", "requirement", "acceptance criteria", "jira"],
  discovery: ["discovery", "research", "insight", "interview", "ticket", "hypothesis"],
  competitive: ["competitive", "competitor", "positioning", "alternative", "win-loss", "benchmark"],
  "help-doc": ["help doc", "guide", "knowledge base", "setup", "troubleshoot", "faq"],
  release: ["release", "changelog", "shipped", "launch", "what changed"],
  planning: ["planning", "priority", "prioritize", "roadmap", "strategy", "swot", "dhm", "devil"],
};

type ListDocumentFilters = {
  kind?: DocumentKind;
  app?: AppName;
  taskType?: string;
  featureArea?: string;
  audience?: string;
  stage?: string;
  sourceOfTruth?: string;
  reviewStatus?: string;
  confidence?: string;
  freshnessStatus?: string;
  limit?: number;
  query?: string;
};

type SearchDocumentsInput = ListDocumentFilters & {
  query: string;
};

type SearchCandidate = {
  document: DocumentRecord;
  baseScore: number;
};

function ensureSearchIndex(): MiniSearch<DocumentRecord> {
  if (!searchIndex) {
    searchIndex = MiniSearch.loadJSON(
      JSON.stringify(searchIndexData),
      searchOptions,
    ) as MiniSearch<DocumentRecord>;
  }

  return searchIndex;
}

function compareIsoDates(left: string | null, right: string | null) {
  if (left && right) {
    return right.localeCompare(left);
  }

  if (right) {
    return 1;
  }

  if (left) {
    return -1;
  }

  return 0;
}

function compareReliability(left: DocumentRecord, right: DocumentRecord) {
  const sourceWeight: Record<string, number> = {
    canonical: 3,
    supporting: 2,
    historical: 1,
  };
  const reviewWeight: Record<string, number> = {
    canonical: 4,
    reviewed: 3,
    draft: 2,
    deprecated: 1,
  };
  const confidenceWeight: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  const freshnessWeight: Record<string, number> = {
    fresh: 4,
    stable: 3,
    undated: 2,
    stale: 1,
  };

  return (
    (sourceWeight[right.sourceOfTruth] ?? 0) -
      (sourceWeight[left.sourceOfTruth] ?? 0) ||
    (reviewWeight[right.reviewStatus] ?? 0) -
      (reviewWeight[left.reviewStatus] ?? 0) ||
    (confidenceWeight[right.confidence] ?? 0) -
      (confidenceWeight[left.confidence] ?? 0) ||
    (freshnessWeight[right.freshnessStatus] ?? 0) -
      (freshnessWeight[left.freshnessStatus] ?? 0) ||
    compareIsoDates(left.updatedAt, right.updatedAt) ||
    left.title.localeCompare(right.title)
  );
}

function sortDocuments(documents: DocumentRecord[]) {
  return [...documents].sort(compareReliability);
}

function documentMatchesFilters(document: DocumentRecord, filters?: ListDocumentFilters) {
  if (!filters) {
    return true;
  }

  if (filters.kind && document.kind !== filters.kind) {
    return false;
  }

  if (filters.app && document.app !== filters.app) {
    return false;
  }

  if (!metadataValueMatches(document.taskTypes, filters.taskType)) {
    return false;
  }

  if (!metadataValueMatches(document.featureAreas, filters.featureArea)) {
    return false;
  }

  if (!metadataValueMatches(document.audiences, filters.audience)) {
    return false;
  }

  if (!metadataValueMatches(document.stages, filters.stage)) {
    return false;
  }

  if (
    normalizeFacetValue(filters.sourceOfTruth) &&
    document.sourceOfTruth !== normalizeFacetValue(filters.sourceOfTruth)
  ) {
    return false;
  }

  if (
    normalizeFacetValue(filters.reviewStatus) &&
    document.reviewStatus !== normalizeFacetValue(filters.reviewStatus)
  ) {
    return false;
  }

  if (
    normalizeFacetValue(filters.confidence) &&
    document.confidence !== normalizeFacetValue(filters.confidence)
  ) {
    return false;
  }

  if (
    normalizeFacetValue(filters.freshnessStatus) &&
    document.freshnessStatus !== normalizeFacetValue(filters.freshnessStatus)
  ) {
    return false;
  }

  return true;
}

function tokenizeQuery(query: string) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  );
}

function detectQueryApp(query: string): AppName | null {
  const lower = query.toLowerCase();

  if (lower.includes("lock") || lower.includes("passcode")) {
    return "lock";
  }

  if (
    lower.includes("quote") ||
    lower.includes("quick order") ||
    lower.includes("rfq")
  ) {
    return "quote";
  }

  if (
    lower.includes("solution") ||
    lower.includes("wholesale") ||
    lower.includes("price list") ||
    lower.includes("net terms")
  ) {
    return "solution";
  }

  return null;
}

function inferTaskTypesFromQuery(query: string) {
  const lower = query.toLowerCase();
  return Object.entries(TASK_HINTS)
    .filter(([, hints]) => hints.some((hint) => lower.includes(hint)))
    .map(([taskType]) => taskType);
}

function hasReleaseIntent(query: string) {
  const lower = query.toLowerCase();
  return RELEASE_QUERY_HINTS.some((hint) => lower.includes(hint));
}

function buildSearchCandidates(input: SearchDocumentsInput) {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
  const index = ensureSearchIndex();

  const primary = index.search(input.query, {
    combineWith: "AND",
  }) as unknown as Array<{ uri: string; score?: number }>;
  const fallback = primary.length >= limit
    ? []
    : (index.search(input.query, {
        combineWith: "OR",
      }) as unknown as Array<{ uri: string; score?: number }>);

  const candidates = new Map<string, SearchCandidate>();

  for (const result of [...primary, ...fallback]) {
    const document = getDocumentByUri(result.uri);
    if (!document || !documentMatchesFilters(document, input)) {
      continue;
    }

    const existing = candidates.get(document.uri);
    const baseScore = result.score ?? 0;
    if (!existing || baseScore > existing.baseScore) {
      candidates.set(document.uri, {
        document,
        baseScore,
      });
    }
  }

  return Array.from(candidates.values());
}

function buildReason(parts: string[]) {
  return Array.from(new Set(parts))
    .filter(Boolean)
    .slice(0, 3)
    .join("; ");
}

function rerankSearchCandidates(
  candidates: SearchCandidate[],
  input: SearchDocumentsInput,
): SearchResultRecord[] {
  const queryTokens = tokenizeQuery(input.query);
  const queryApp = detectQueryApp(input.query);
  const queryTaskTypes = inferTaskTypesFromQuery(input.query);
  const ambiguous =
    !input.app &&
    !input.kind &&
    !input.taskType &&
    !input.featureArea &&
    !queryApp;
  const releaseIntent = hasReleaseIntent(input.query);
  const maxBase = Math.max(
    1,
    ...candidates.map((candidate) => candidate.baseScore || 0),
  );

  const rescored = candidates.map(({ document, baseScore }) => {
    let rawScore = (baseScore / maxBase) * 0.55;
    const reasons: string[] = [];

    if (input.app && document.app === input.app) {
      rawScore += 0.18;
      reasons.push(`Matches app "${document.app}"`);
    } else if (queryApp && document.app === queryApp) {
      rawScore += 0.14;
      reasons.push(`Aligned with ${queryApp} intent in query`);
    }

    const normalizedTaskType = normalizeFacetValue(input.taskType);
    if (normalizedTaskType && document.taskTypes.includes(normalizedTaskType)) {
      rawScore += 0.12;
      reasons.push(`Aligned with ${normalizedTaskType} task metadata`);
    } else if (
      queryTaskTypes.length > 0 &&
      queryTaskTypes.some((taskType) => document.taskTypes.includes(taskType))
    ) {
      rawScore += 0.08;
      reasons.push(
        `Matches ${queryTaskTypes.find((taskType) => document.taskTypes.includes(taskType))} intent`,
      );
    }

    const normalizedFeatureArea = normalizeFacetValue(input.featureArea);
    if (
      normalizedFeatureArea &&
      document.featureAreas.includes(normalizedFeatureArea)
    ) {
      rawScore += 0.16;
      reasons.push(`Matches feature area "${normalizedFeatureArea}"`);
    } else {
      const tokenOverlap = document.featureAreas.filter((area) =>
        queryTokens.some((token) => area.includes(token) || token.includes(area)),
      );
      if (tokenOverlap.length > 0) {
        rawScore += Math.min(0.1, tokenOverlap.length * 0.04);
        reasons.push(`Matches feature areas ${tokenOverlap.slice(0, 2).join(", ")}`);
      }
    }

    if (document.kind === "app-context") {
      rawScore += ambiguous ? 0.16 : 0.08;
      reasons.push(
        ambiguous
          ? "Prioritized app context for an ambiguous query"
          : "Strong app-context match",
      );
    }

    if (document.kind === "changelog") {
      if (releaseIntent) {
        rawScore += 0.16;
        reasons.push("Includes merchant-facing shipped behavior");
      } else if (ambiguous) {
        rawScore -= 0.08;
      }
    }

    if (
      document.kind === "template" &&
      (normalizedTaskType === "prd" ||
        normalizedTaskType === "discovery" ||
        normalizedTaskType === "help-doc" ||
        queryTaskTypes.includes("prd") ||
        queryTaskTypes.includes("discovery") ||
        queryTaskTypes.includes("help-doc"))
    ) {
      rawScore += 0.07;
      reasons.push("Useful template for the requested task");
    }

    if (
      document.kind === "competitive" &&
      (normalizedTaskType === "competitive" ||
        queryTaskTypes.includes("competitive"))
    ) {
      rawScore += 0.12;
      reasons.push("Competitive context aligned with the request");
    }

    if (document.sourceOfTruth === "canonical") {
      rawScore += 0.06;
    } else if (document.sourceOfTruth === "supporting") {
      rawScore += 0.03;
    }

    if (document.reviewStatus === "canonical" || document.reviewStatus === "reviewed") {
      rawScore += 0.04;
    }

    if (document.confidence === "high") {
      rawScore += 0.05;
    } else if (document.confidence === "medium") {
      rawScore += 0.03;
    }

    if (document.freshnessStatus === "fresh") {
      rawScore += 0.05;
    } else if (document.freshnessStatus === "stable") {
      rawScore += 0.03;
    } else if (document.freshnessStatus === "stale") {
      rawScore -= 0.03;
    }

    return {
      document,
      rawScore,
      reason: buildReason(reasons),
    };
  });

  const sorted = rescored.sort((left, right) => {
    if (right.rawScore !== left.rawScore) {
      return right.rawScore - left.rawScore;
    }

    return compareReliability(left.document, right.document);
  });

  const topRawScore = Math.max(1, ...(sorted.map((item) => item.rawScore)));

  return sorted.map((item) => ({
    document: item.document,
    score: Number((item.rawScore / topRawScore).toFixed(2)),
    reason: item.reason || "Relevant lexical match",
  }));
}

function buildRefinementSuggestion(
  input: SearchDocumentsInput,
  results: SearchResultRecord[],
) {
  if (results.length === 0) {
    const suggestions = ["app", "task_type", "feature_area"]
      .filter((field) => {
        if (field === "app") {
          return !input.app;
        }
        if (field === "task_type") {
          return !input.taskType;
        }
        return !input.featureArea;
      })
      .join(", ");

    return suggestions.length > 0
      ? `No strong match found. Try refining with ${suggestions}.`
      : "No strong match found. Try a narrower query phrase.";
  }

  if (results.length < 2) {
    return undefined;
  }

  const [first, second] = results;
  const scoreGap = first.score - second.score;
  const apps = new Set(results.map((result) => result.document.app ?? "suite"));
  const kinds = new Set(results.map((result) => result.document.kind));

  if (scoreGap <= 0.08 && (apps.size > 1 || kinds.has("changelog"))) {
    return 'Refine with app, task_type, or feature_area, for example app: "lock" task_type: "prd".';
  }

  return undefined;
}

function toDocumentReference(document: DocumentRecord, reason: string): DocumentReference {
  return {
    uri: document.uri,
    title: document.title,
    reason,
  };
}

function addUniqueReference(
  collection: DocumentReference[],
  seen: Set<string>,
  document: DocumentRecord | null,
  reason: string,
) {
  if (!document || seen.has(document.uri)) {
    return;
  }

  seen.add(document.uri);
  collection.push(toDocumentReference(document, reason));
}

function changelogDocumentForApp(app: AppName | null) {
  if (!app) {
    return null;
  }

  return (
    manifest.find(
      (document) => document.kind === "changelog" && getChangelogApp(document.path) === app,
    ) ?? null
  );
}

function buildBundleName(taskType: string, app: AppName | null, featureArea: string | null) {
  const parts = [
    app ?? "suite",
    featureArea ?? null,
    taskType || "starter",
    "starter",
  ].filter(Boolean);

  return parts.join("-");
}

function pickBundleDocuments(
  taskType: string,
  app: AppName | null,
  featureArea: string | null,
): Pick<BundleSuggestion, "rationale" | "required" | "optional"> {
  const required: DocumentReference[] = [];
  const optional: DocumentReference[] = [];
  const seen = new Set<string>();

  addUniqueReference(
    required,
    seen,
    getDocumentByUri("bss://company"),
    "Suite-level context and operating priorities.",
  );

  if (!app || taskType === "discovery" || taskType === "planning") {
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://segments"),
      "Customer segments, pains, and messaging hooks.",
    );
  }

  if (app) {
    addUniqueReference(
      required,
      seen,
      getDocumentByUri(`bss://app/${app}/context`),
      featureArea
        ? `Core ${app} logic for ${featureArea}.`
        : `Core ${app} workflows and domain logic.`,
    );
  }

  if (taskType === "prd") {
    addUniqueReference(
      required,
      seen,
      getDocumentByUri("bss://template/prd"),
      "Canonical PRD structure and review lenses.",
    );
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://reference/prd/socratic-questioning"),
      "Clarify weak problem framing and scope before drafting.",
    );
    if (app) {
      addUniqueReference(
        optional,
        seen,
        getDocumentByUri(`bss://app/${app}/skill`),
        "App-specific response contract and output expectations.",
      );
    }
  } else if (taskType === "discovery") {
    addUniqueReference(
      required,
      seen,
      getDocumentByUri("bss://template/discovery"),
      "Canonical structure for evidence, themes, and hypotheses.",
    );
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://reference/product-analysis"),
      "Analysis guidance for opportunities and trade-offs.",
    );
  } else if (taskType === "competitive") {
    if (app) {
      addUniqueReference(
        required,
        seen,
        getDocumentByUri(`bss://app/${app}/competitive`),
        "Internal competitive context for the selected app.",
      );
      addUniqueReference(
        optional,
        seen,
        getDocumentByUri(`bss://app/${app}/context`),
        "Baseline product scope to compare against alternatives.",
      );
    }
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://segments"),
      "Merchant segment cues for positioning choices.",
    );
  } else if (taskType === "help-doc") {
    addUniqueReference(
      required,
      seen,
      getDocumentByUri("bss://template/help-doc"),
      "Merchant-facing help doc structure and section order.",
    );
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://reference/help-doc-skill"),
      "Writing rules and troubleshooting guidance.",
    );
    addUniqueReference(
      optional,
      seen,
      changelogDocumentForApp(app),
      "Current public naming and shipped behavior.",
    );
  } else if (taskType === "release") {
    addUniqueReference(
      required,
      seen,
      changelogDocumentForApp(app),
      "Merchant-facing shipped behavior and release language.",
    );
    if (app) {
      addUniqueReference(
        optional,
        seen,
        getDocumentByUri(`bss://app/${app}/context`),
        "Underlying app scope and implementation context.",
      );
    }
  } else if (taskType === "planning") {
    addUniqueReference(
      required,
      seen,
      getDocumentByUri("bss://reference/product-analysis"),
      "Frameworks for strategy, prioritization, and decision support.",
    );
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://template/product-analysis/dhm"),
      "Demand, differentiation, and market-fit framing.",
    );
    addUniqueReference(
      optional,
      seen,
      getDocumentByUri("bss://template/product-analysis/swot"),
      "Structured option comparison and trade-offs.",
    );
  }

  const rationaleByTaskType: Record<string, string> = {
    prd: "Bundle combines domain context, PRD template, and clarification guidance for spec drafting.",
    discovery: "Bundle combines evidence structure, app context, and analysis guidance for discovery synthesis.",
    competitive: "Bundle combines internal competitive context with product scope and segment framing.",
    "help-doc": "Bundle combines merchant-facing writing guidance, app context, and public release naming.",
    release: "Bundle combines shipped behavior with app scope for launch-ready summaries.",
    planning: "Bundle combines company context and strategy frameworks for roadmap decisions.",
  };

  return {
    rationale:
      rationaleByTaskType[taskType] ??
      "Bundle combines the minimum context needed to start the requested task quickly.",
    required: required.slice(0, 4),
    optional: optional.slice(0, 2),
  };
}

export function getAllDocuments(): DocumentRecord[] {
  return manifest;
}

export function getDocumentByUri(uri: string): DocumentRecord | null {
  return manifest.find((document) => document.uri === uri) ?? null;
}

export function getRelatedDocuments(uri: string, limit = 4) {
  const current = getDocumentByUri(uri);
  if (!current) {
    return [];
  }

  return manifest
    .filter((document) => document.uri !== uri)
    .map((document) => {
      let score = 0;
      const reasons: string[] = [];

      if (current.app && document.app === current.app) {
        score += 3;
        reasons.push(`Same ${current.app} app`);
      }

      const sharedTaskTypes = current.taskTypes.filter((taskType) =>
        document.taskTypes.includes(taskType),
      );
      if (sharedTaskTypes.length > 0) {
        score += Math.min(2, sharedTaskTypes.length);
        reasons.push(`${sharedTaskTypes[0]} task overlap`);
      }

      const sharedFeatureAreas = current.featureAreas.filter((featureArea) =>
        document.featureAreas.includes(featureArea),
      );
      if (sharedFeatureAreas.length > 0) {
        score += Math.min(2, sharedFeatureAreas.length);
        reasons.push(`${sharedFeatureAreas[0]} feature overlap`);
      }

      if (current.kind === "app-context" && document.kind === "app-skill") {
        score += 1.5;
        reasons.push("App skill companion document");
      }

      if (current.kind === "app-context" && document.kind === "competitive") {
        score += 1.2;
        reasons.push("Competitive context for the same app");
      }

      if (
        current.kind === "app-context" &&
        document.kind === "changelog" &&
        document.app === current.app
      ) {
        score += 1.2;
        reasons.push("Merchant-facing shipped behavior");
      }

      return {
        document,
        score,
        reason: buildReason(reasons),
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return compareReliability(left.document, right.document);
    })
    .slice(0, limit)
    .map((item) => toDocumentReference(item.document, item.reason));
}

export function listDocuments(filters?: ListDocumentFilters): DocumentRecord[] {
  const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 50);

  if (filters?.query) {
    return searchDocuments({
      query: filters.query,
      kind: filters.kind,
      app: filters.app,
      taskType: filters.taskType,
      featureArea: filters.featureArea,
      audience: filters.audience,
      stage: filters.stage,
      sourceOfTruth: filters.sourceOfTruth,
      reviewStatus: filters.reviewStatus,
      confidence: filters.confidence,
      freshnessStatus: filters.freshnessStatus,
      limit,
    }).map((result) => result.document);
  }

  return sortDocuments(
    manifest.filter((document) => documentMatchesFilters(document, filters)),
  ).slice(0, limit);
}

export function searchDocuments(input: SearchDocumentsInput): SearchResultRecord[] {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
  const candidates = buildSearchCandidates(input);

  const results = rerankSearchCandidates(candidates, input).slice(0, limit);

  return results;
}

export function getSearchRefinementSuggestion(input: SearchDocumentsInput) {
  return buildRefinementSuggestion(input, searchDocuments(input));
}

export function getChangelogDocuments(
  app?: AppName | "suite",
  query?: string,
  limit = 10,
) {
  const normalizedLimit = Math.min(Math.max(limit, 1), 20);

  if (query) {
    return searchDocuments({
      query,
      kind: "changelog",
      app: app && app !== "suite" ? app : undefined,
      limit: normalizedLimit,
    })
      .map((result) => result.document)
      .filter((document) =>
        app === "suite" ? getChangelogApp(document.path) === null : true,
      )
      .slice(0, normalizedLimit);
  }

  return sortDocuments(
    manifest.filter((document) => {
      if (document.kind !== "changelog") {
        return false;
      }

      if (app === "suite") {
        return getChangelogApp(document.path) === null;
      }

      if (app) {
        return getChangelogApp(document.path) === app;
      }

      return true;
    }),
  ).slice(0, normalizedLimit);
}

export function suggestContextBundle(
  taskTypeRaw: string,
  appRaw?: string | null,
  featureAreaRaw?: string | null,
): BundleSuggestion {
  const taskType = normalizeFacetValue(taskTypeRaw) ?? "planning";
  const appCandidate = appRaw ?? null;
  const app: AppName | null = isKnownApp(appCandidate) ? appCandidate : null;
  const featureArea = normalizeFacetValue(featureAreaRaw);

  const bundle = pickBundleDocuments(taskType, app, featureArea);
  const resources = [...bundle.required, ...bundle.optional].slice(0, 6);

  return {
    bundleName: buildBundleName(taskType, app, featureArea),
    taskType,
    app,
    featureArea,
    rationale: bundle.rationale,
    required: bundle.required,
    optional: bundle.optional,
    resources,
  };
}

export function getPublicResourceCatalog(): ResourceCatalogSummary {
  const byKind: Record<string, number> = {};
  const byApp: Record<string, number> = {};
  const byFreshness: Record<string, number> = {};

  for (const document of manifest) {
    byKind[document.kind] = (byKind[document.kind] ?? 0) + 1;
    byApp[document.app ?? "suite"] = (byApp[document.app ?? "suite"] ?? 0) + 1;
    byFreshness[document.freshnessStatus] =
      (byFreshness[document.freshnessStatus] ?? 0) + 1;
  }

  return {
    total: manifest.length,
    byKind,
    byApp,
    byFreshness,
    documents: sortDocuments(manifest),
  };
}
