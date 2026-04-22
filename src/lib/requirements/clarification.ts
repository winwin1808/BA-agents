export type ClarificationMode = "minimal" | "balanced" | "strict_ready";
export type ClarificationStatus = "ready" | "needs_clarification" | "blocked";
export type ClarificationApp = "lock" | "quote" | "solution" | "cross_suite";
export type ClarificationTaskType =
  | "prd"
  | "ux"
  | "workflow"
  | "help_doc"
  | "release"
  | "discovery"
  | "planning";

export type RetrievedContext = {
  uri?: string;
  title?: string;
  summary?: string;
};

export type RequirementClarificationInput = {
  raw_request: string;
  app?: ClarificationApp;
  task_type?: ClarificationTaskType;
  target_output?: string;
  conversation_context?: string;
  retrieved_context?: RetrievedContext[];
  clarification_mode?: ClarificationMode;
  proceed_with_assumptions?: boolean;
};

export type ClarificationQuestion = {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  dimension: string;
  question: string;
  why_it_matters: string;
  suggested_options: string[];
  default_assumption: string;
};

export type RequirementClarificationResult = {
  status: ClarificationStatus;
  confidence: number;
  understood_requirement: string;
  detected_app: ClarificationApp;
  detected_task_type: ClarificationTaskType;
  missing_dimensions: string[];
  questions: ClarificationQuestion[];
  assumptions_if_unanswered: string[];
  ready_summary?: string;
};

type Dimension =
  | "problem"
  | "user_or_actor"
  | "business_goal"
  | "scope"
  | "trigger"
  | "core_flow"
  | "business_rules"
  | "data_fields"
  | "permissions"
  | "edge_cases"
  | "error_states"
  | "success_criteria"
  | "acceptance_criteria"
  | "dependencies"
  | "out_of_scope"
  | "rollout_or_migration";

type QuestionTemplate = {
  question: string;
  why_it_matters: string;
  suggested_options: string[];
  default_assumption: string;
};

const DEFAULT_TASK_TYPE: ClarificationTaskType = "prd";
const DEFAULT_MODE: ClarificationMode = "balanced";

const CLARIFICATION_MODE_LIMITS: Record<ClarificationMode, number> = {
  minimal: 1,
  balanced: 3,
  strict_ready: 3,
};

const TASK_REQUIRED_DIMENSIONS: Record<ClarificationTaskType, Dimension[]> = {
  prd: [
    "problem",
    "user_or_actor",
    "scope",
    "core_flow",
    "business_rules",
    "acceptance_criteria",
  ],
  ux: [
    "user_or_actor",
    "scope",
    "trigger",
    "core_flow",
    "error_states",
    "acceptance_criteria",
  ],
  workflow: [
    "user_or_actor",
    "trigger",
    "core_flow",
    "business_rules",
    "edge_cases",
  ],
  help_doc: ["user_or_actor", "scope", "core_flow", "error_states"],
  release: ["scope", "business_goal", "dependencies", "rollout_or_migration"],
  discovery: ["problem", "user_or_actor", "business_goal", "success_criteria"],
  planning: ["problem", "business_goal", "scope", "dependencies"],
};

const ASSUMABLE_DIMENSIONS = new Set<Dimension>([
  "business_goal",
  "success_criteria",
  "out_of_scope",
  "rollout_or_migration",
  "dependencies",
]);

const DIMENSION_WEIGHTS: Record<Dimension, { impact: number; ambiguity: number }> = {
  problem: { impact: 5, ambiguity: 4 },
  user_or_actor: { impact: 4, ambiguity: 4 },
  business_goal: { impact: 3, ambiguity: 2 },
  scope: { impact: 5, ambiguity: 5 },
  trigger: { impact: 4, ambiguity: 4 },
  core_flow: { impact: 4, ambiguity: 4 },
  business_rules: { impact: 5, ambiguity: 5 },
  data_fields: { impact: 4, ambiguity: 4 },
  permissions: { impact: 4, ambiguity: 4 },
  edge_cases: { impact: 3, ambiguity: 4 },
  error_states: { impact: 3, ambiguity: 3 },
  success_criteria: { impact: 2, ambiguity: 2 },
  acceptance_criteria: { impact: 5, ambiguity: 5 },
  dependencies: { impact: 3, ambiguity: 3 },
  out_of_scope: { impact: 2, ambiguity: 2 },
  rollout_or_migration: { impact: 2, ambiguity: 2 },
};

const APP_KEYWORDS: Record<Exclude<ClarificationApp, "cross_suite">, string[]> = {
  lock: [
    "lock",
    "login",
    "password",
    "hide price",
    "passcode",
    "access control",
    "checkout lock",
    "payment method",
    "shipping method",
    "ẩn giá",
    "khóa",
  ],
  quote: [
    "quote",
    "rfq",
    "request a quote",
    "quick order",
    "quote form",
    "quote history",
    "csv",
    "bulk order",
    "báo giá",
    "đặt hàng nhanh",
  ],
  solution: [
    "solution",
    "wholesale",
    "registration",
    "segment",
    "segmentation",
    "price list",
    "custom pricing",
    "volume pricing",
    "quantity increment",
    "order limit",
    "net terms",
    "manual order",
    "đăng ký",
    "phân khúc",
    "bảng giá",
    "giá sỉ",
  ],
};

const TASK_KEYWORDS: Record<ClarificationTaskType, string[]> = {
  prd: [
    "prd",
    "spec",
    "requirement",
    "rqm",
    "acceptance criteria",
    "user story",
    "jira",
    "đặc tả",
    "yêu cầu",
    "tiêu chí nghiệm thu",
  ],
  ux: ["ux", "ui", "wireframe", "mockup", "screen", "giao diện", "màn hình"],
  workflow: ["workflow", "process", "approval flow", "diagram", "bpmn", "quy trình"],
  help_doc: ["help doc", "guide", "documentation", "hướng dẫn", "tài liệu"],
  release: ["release", "changelog", "launch", "rollout", "phát hành", "ra mắt"],
  discovery: ["discovery", "feedback", "interview", "research", "khảo sát"],
  planning: ["planning", "priority", "roadmap", "strategy", "ưu tiên"],
};

const DIMENSION_PATTERNS: Record<Dimension, RegExp[]> = {
  problem: [/problem|pain|issue|vấn đề|nỗi đau|khó khăn/i, /solve|giải quyết/i],
  user_or_actor: [/merchant|admin|customer|buyer|sales|cs|user|khách hàng|người mua/i],
  business_goal: [/goal|objective|kpi|metric|conversion|revenue|mục tiêu|doanh thu/i],
  scope: [/scope|screen|page|admin|storefront|checkout|phạm vi|màn|trang/i],
  trigger: [/when|trigger|before|after|on submit|on save|if|khi|nếu/i],
  core_flow: [/flow|step|journey|process|sequence|luồng|quy trình|bước/i],
  business_rules: [/rule|logic|condition|priority|fallback|conflict|approval|điều kiện|ưu tiên|quy tắc|xung đột/i],
  data_fields: [/field|data|api|database|metafield|source|import|export|csv|trường|dữ liệu|nguồn/i],
  permissions: [/permission|role|access|authorized|staff|owner|quyền|vai trò|truy cập/i],
  edge_cases: [/edge case|exception|duplicate|invalid|empty|missing|conflict|ngoại lệ|trùng|không hợp lệ|thiếu/i],
  error_states: [/error|fail|loading|empty state|success state|validation|lỗi|thất bại|validate/i],
  success_criteria: [/success|metric|kpi|target|measure|adoption|thành công|đo lường/i],
  acceptance_criteria: [/acceptance criteria|ac|given when then|testable|done|tiêu chí nghiệm thu/i],
  dependencies: [/dependency|depends|integration|shopify|theme|checkout extensibility|api|phụ thuộc|tích hợp/i],
  out_of_scope: [/out of scope|not include|exclude|không làm|ngoài phạm vi/i],
  rollout_or_migration: [/rollout|release|migration|migrate|backfill|launch|phát hành|di trú/i],
};

const QUESTION_BANK: Record<Dimension, QuestionTemplate> = {
  problem: {
    question: "Feature này đang giải quyết pain cụ thể nào, và pain đó xảy ra với nhóm user nào nhiều nhất?",
    why_it_matters: "Nếu problem chưa rõ, PRD dễ mô tả solution nhưng thiếu rationale và khó ưu tiên scope.",
    suggested_options: [
      "Merchant setup mất thời gian",
      "Buyer không hoàn tất được flow",
      "CS phải xử lý thủ công",
      "Logic hiện tại gây sai dữ liệu hoặc sai giá",
    ],
    default_assumption: "Pain chính là merchant cần giảm thao tác thủ công và giảm lỗi vận hành.",
  },
  user_or_actor: {
    question: "Actor chính của requirement này là ai, và ai là người bị ảnh hưởng trực tiếp bởi kết quả?",
    why_it_matters: "Actor quyết định UX, permission, wording và acceptance criteria.",
    suggested_options: ["Merchant admin", "B2B buyer/customer", "CS/Sales team", "Developer/API consumer"],
    default_assumption: "Actor chính là merchant admin.",
  },
  business_goal: {
    question: "Mục tiêu business chính cần đạt là gì?",
    why_it_matters: "Business goal giúp chốt priority, scope và success criteria.",
    suggested_options: ["Tăng conversion", "Giảm ticket CS", "Giảm thời gian setup", "Tăng compliance"],
    default_assumption: "Mục tiêu chính là giảm thao tác thủ công và tăng độ chính xác vận hành.",
  },
  scope: {
    question: "Phạm vi version đầu tiên nên nằm ở đâu: admin config, storefront/customer account, checkout, hay cả end-to-end flow?",
    why_it_matters: "Scope ảnh hưởng trực tiếp đến effort, dependency và test coverage.",
    suggested_options: ["Admin config only", "Storefront/customer account only", "Checkout behavior", "End-to-end admin plus buyer flow"],
    default_assumption: "Version đầu tiên gồm admin config và core buyer-facing behavior.",
  },
  trigger: {
    question: "Logic này nên được kích hoạt tại thời điểm nào trong flow?",
    why_it_matters: "Trigger quyết định nơi implement logic, dữ liệu cần có sẵn và lỗi cần xử lý.",
    suggested_options: ["Khi merchant lưu config", "Khi buyer mở storefront", "Khi buyer thêm vào cart", "Khi buyer vào checkout"],
    default_assumption: "Logic chạy khi user thực hiện hành động chính trong flow.",
  },
  core_flow: {
    question: "Core happy path nên gồm những bước nào từ lúc user bắt đầu đến khi hoàn tất?",
    why_it_matters: "Happy path là nền để viết user story, AC và workflow diagram.",
    suggested_options: ["Configure -> validate -> apply -> verify", "Buyer submit -> merchant review -> buyer nhận kết quả", "Import -> validate -> apply", "Rule chạy tự động theo dữ liệu hiện có"],
    default_assumption: "Core flow gồm configure, validate, apply và verify.",
  },
  business_rules: {
    question: "Rule quyết định quan trọng nhất của feature này là gì, đặc biệt khi có nhiều điều kiện cùng match?",
    why_it_matters: "Business rule là phần dễ gây sai logic nhất nếu không chốt trước khi dev triển khai.",
    suggested_options: ["Merchant-defined priority", "Most specific rule wins", "Latest updated rule wins", "Block and show conflict"],
    default_assumption: "Ưu tiên theo thứ tự merchant cấu hình.",
  },
  data_fields: {
    question: "Feature này cần đọc hoặc lưu những dữ liệu nào, và nguồn dữ liệu chính là gì?",
    why_it_matters: "Data source ảnh hưởng đến model, migration, import/export và khả năng test.",
    suggested_options: ["Customer tag", "Company/customer profile", "Product/variant metafield", "App-owned config table"],
    default_assumption: "Dữ liệu config do app quản lý, còn customer/product attributes lấy từ Shopify khi có thể.",
  },
  permissions: {
    question: "Ai được phép tạo, sửa, xem hoặc apply rule/config của feature này?",
    why_it_matters: "Permission sai có thể gây lỗi vận hành, lộ dữ liệu hoặc thay đổi config ngoài ý muốn.",
    suggested_options: ["Store owner only", "Merchant admin staff", "CS/Sales internal user", "Buyer/customer self-service"],
    default_assumption: "Chỉ merchant admin có quyền tạo và sửa config.",
  },
  edge_cases: {
    question: "Edge case nào bắt buộc phải xử lý ở version đầu tiên?",
    why_it_matters: "Edge case quyết định test case và tránh regression ở core flow.",
    suggested_options: ["Duplicate config", "No matching rule", "Multiple matching rules", "Invalid or missing data"],
    default_assumption: "Version đầu tiên xử lý no match, duplicate và invalid data ở mức hiển thị lỗi rõ ràng.",
  },
  error_states: {
    question: "Khi dữ liệu thiếu, invalid hoặc hệ thống không apply được logic, user nên thấy trạng thái gì?",
    why_it_matters: "Error state quyết định UX fallback và acceptance criteria cho tình huống thất bại.",
    suggested_options: ["Show inline validation", "Show banner error", "Fallback to default Shopify behavior", "Block action until fixed"],
    default_assumption: "Hiển thị inline validation cho admin và fallback an toàn cho buyer.",
  },
  success_criteria: {
    question: "Sau khi release, chỉ số hoặc tín hiệu nào chứng minh feature này thành công?",
    why_it_matters: "Success criteria giúp chốt priority, launch decision và post-release evaluation.",
    suggested_options: ["Giảm ticket CS", "Tăng conversion/order completion", "Giảm thời gian setup", "Tăng adoption của feature"],
    default_assumption: "Đo success bằng adoption của feature và giảm thao tác/ticket thủ công.",
  },
  acceptance_criteria: {
    question: "Điều kiện nghiệm thu tối thiểu nào phải pass để xem requirement này là done?",
    why_it_matters: "Không có acceptance criteria thì dev và QA khó biết khi nào hoàn tất.",
    suggested_options: ["Core happy path pass", "Validation/error states pass", "Permission cases pass", "Regression cases pass"],
    default_assumption: "AC tối thiểu gồm happy path, validation, permission và fallback behavior.",
  },
  dependencies: {
    question: "Requirement này có dependency nào bắt buộc với Shopify API, theme, checkout, app khác hoặc dữ liệu migration không?",
    why_it_matters: "Dependency ảnh hưởng đến sequencing, delivery risk và rollback.",
    suggested_options: ["Shopify API", "Theme app extension", "Checkout behavior", "Existing app data or migration"],
    default_assumption: "Không có dependency blocking ngoài app context hiện có.",
  },
  out_of_scope: {
    question: "Có phần nào cần chốt là out of scope cho version đầu tiên không?",
    why_it_matters: "Out-of-scope rõ giúp tránh scope creep và giảm rủi ro sprint.",
    suggested_options: ["Advanced analytics", "Bulk import/export", "Multi-language copy", "API/public integration"],
    default_assumption: "Version đầu tiên chỉ gồm core flow, chưa gồm analytics nâng cao hoặc public API.",
  },
  rollout_or_migration: {
    question: "Feature này cần rollout hoặc migration dữ liệu như thế nào?",
    why_it_matters: "Rollout/migration ảnh hưởng đến backward compatibility và rollback plan.",
    suggested_options: ["Enable for all new stores", "Feature flag by merchant", "Beta rollout", "Migration for existing config"],
    default_assumption: "Rollout bằng feature flag hoặc enable theo app version mới.",
  },
};

export function analyzeRequirementGaps(input: RequirementClarificationInput): RequirementClarificationResult {
  const rawRequest = input.raw_request.trim();
  const combinedText = [
    rawRequest,
    input.conversation_context,
    ...(input.retrieved_context ?? []).map((item) => [item.title, item.summary].filter(Boolean).join(" ")),
  ]
    .filter(Boolean)
    .join("\n");

  const app = input.app ?? detectApp(combinedText);
  const taskType = input.task_type ?? detectTaskType(combinedText) ?? DEFAULT_TASK_TYPE;
  const mode = input.clarification_mode ?? DEFAULT_MODE;
  const presentDimensions = detectPresentDimensions(combinedText);
  const missingDimensions = getMissingDimensions(taskType, presentDimensions, mode);
  const questions = buildQuestions(
    rankMissingDimensions(missingDimensions, app, taskType),
    {
      app,
      taskType,
      rawRequest,
      maxQuestions: CLARIFICATION_MODE_LIMITS[mode],
    },
  );
  const assumptions = buildAssumptions(missingDimensions, questions);
  const status = determineStatus({
    rawRequest,
    questions,
    missingDimensions,
    proceedWithAssumptions: Boolean(input.proceed_with_assumptions),
    mode,
  });

  return {
    status,
    confidence: calculateConfidence({
      taskType,
      presentDimensions,
      missingDimensions,
      rawRequest,
      app,
    }),
    understood_requirement: buildUnderstoodRequirement(rawRequest, app, taskType),
    detected_app: app,
    detected_task_type: taskType,
    missing_dimensions: missingDimensions,
    questions,
    assumptions_if_unanswered: assumptions,
    ready_summary:
      status === "ready"
        ? buildReadySummary(rawRequest, app, taskType, assumptions)
        : undefined,
  };
}

export function detectApp(text: string): ClarificationApp {
  const normalized = normalize(text);
  const scores = Object.entries(APP_KEYWORDS).map(([app, keywords]) => ({
    app: app as Exclude<ClarificationApp, "cross_suite">,
    score: keywords.filter((keyword) => normalized.includes(normalize(keyword))).length,
  }));
  scores.sort((left, right) => right.score - left.score);
  return scores[0] && scores[0].score > 0 ? scores[0].app : "cross_suite";
}

export function detectTaskType(text: string): ClarificationTaskType | undefined {
  const normalized = normalize(text);
  const scores = Object.entries(TASK_KEYWORDS).map(([taskType, keywords]) => ({
    taskType: taskType as ClarificationTaskType,
    score: keywords.filter((keyword) => normalized.includes(normalize(keyword))).length,
  }));
  scores.sort((left, right) => right.score - left.score);
  return scores[0] && scores[0].score > 0 ? scores[0].taskType : undefined;
}

function detectPresentDimensions(text: string) {
  const dimensions = new Set<Dimension>();
  for (const [dimension, patterns] of Object.entries(DIMENSION_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      dimensions.add(dimension as Dimension);
    }
  }
  return dimensions;
}

function getMissingDimensions(
  taskType: ClarificationTaskType,
  presentDimensions: Set<Dimension>,
  mode: ClarificationMode,
) {
  const requiredSet = new Set<Dimension>(TASK_REQUIRED_DIMENSIONS[taskType]);

  if (mode === "strict_ready") {
    for (const dimension of [
      "data_fields",
      "permissions",
      "edge_cases",
      "error_states",
      "success_criteria",
      "dependencies",
      "out_of_scope",
      "rollout_or_migration",
    ] satisfies Dimension[]) {
      requiredSet.add(dimension);
    }
  }

  return [...requiredSet].filter((dimension) => !presentDimensions.has(dimension));
}

function rankMissingDimensions(
  missingDimensions: Dimension[],
  app: ClarificationApp,
  taskType: ClarificationTaskType,
) {
  return [...missingDimensions].sort(
    (left, right) => scoreDimension(right, app, taskType) - scoreDimension(left, app, taskType),
  );
}

function scoreDimension(
  dimension: Dimension,
  app: ClarificationApp,
  taskType: ClarificationTaskType,
) {
  const weights = DIMENSION_WEIGHTS[dimension];
  let score = weights.impact + weights.ambiguity;

  if (dimension === "business_rules" && app !== "cross_suite") {
    score += 2;
  }
  if (dimension === "scope" && ["prd", "ux", "workflow"].includes(taskType)) {
    score += 1;
  }
  if (dimension === "acceptance_criteria" && taskType === "prd") {
    score += 1;
  }

  return score;
}

function buildQuestions(
  missingDimensions: Dimension[],
  context: {
    app: ClarificationApp;
    taskType: ClarificationTaskType;
    rawRequest: string;
    maxQuestions: number;
  },
) {
  return missingDimensions.slice(0, context.maxQuestions).map((dimension) => {
    const base = QUESTION_BANK[dimension];
    const override = getContextualQuestionOverride(dimension, context);
    const template = override ?? base;

    return {
      id: `${dimension}_clarification`,
      priority: getPriority(dimension),
      dimension,
      question: template.question,
      why_it_matters: template.why_it_matters,
      suggested_options: template.suggested_options,
      default_assumption: template.default_assumption,
    };
  });
}

function getContextualQuestionOverride(
  dimension: Dimension,
  context: { app: ClarificationApp; rawRequest: string },
): QuestionTemplate | undefined {
  if (dimension !== "business_rules") {
    return undefined;
  }

  const text = normalize(context.rawRequest);
  if (
    context.app === "solution" &&
    (text.includes("price list") ||
      text.includes("bảng giá") ||
      text.includes("segment") ||
      text.includes("phân khúc") ||
      text.includes("pricing"))
  ) {
    return {
      question: "Nếu một customer thuộc nhiều segment và match nhiều price list, hệ thống nên ưu tiên price list theo rule nào?",
      why_it_matters: "Rule này ảnh hưởng trực tiếp đến pricing logic, conflict handling và test case.",
      suggested_options: [
        "Merchant-defined priority",
        "Most specific segment wins",
        "Highest discount wins",
        "Block and show conflict",
      ],
      default_assumption: "Ưu tiên theo thứ tự merchant cấu hình.",
    };
  }

  if (context.app === "lock") {
    return {
      question: "Nếu nhiều Lock rule cùng match một customer hoặc page, hệ thống nên ưu tiên rule nào?",
      why_it_matters: "Priority rule quyết định nội dung bị khóa, fallback và khả năng tránh conflict.",
      suggested_options: [
        "Merchant-defined priority",
        "Most restrictive rule wins",
        "Most specific rule wins",
        "Latest updated rule wins",
      ],
      default_assumption: "Most restrictive rule wins.",
    };
  }

  if (context.app === "quote") {
    return {
      question: "Khi RFQ/quick order có dữ liệu không hợp lệ hoặc thiếu item, app nên block submit hay cho submit một phần?",
      why_it_matters: "Rule này ảnh hưởng đến conversion, data quality và workload của merchant khi xử lý quote.",
      suggested_options: [
        "Block submit until all items are valid",
        "Allow partial submit",
        "Save draft and show validation",
        "Submit but flag invalid lines",
      ],
      default_assumption: "Block submit until all required items are valid.",
    };
  }

  return undefined;
}

function buildAssumptions(
  missingDimensions: Dimension[],
  questions: ClarificationQuestion[],
) {
  const questionDimensions = new Set(questions.map((question) => question.dimension));
  const assumptions: string[] = [];

  for (const question of questions) {
    assumptions.push(question.default_assumption);
  }

  for (const dimension of missingDimensions) {
    if (questionDimensions.has(dimension)) continue;
    if (ASSUMABLE_DIMENSIONS.has(dimension)) {
      assumptions.push(QUESTION_BANK[dimension].default_assumption);
    }
  }

  return [...new Set(assumptions)];
}

function determineStatus({
  rawRequest,
  questions,
  missingDimensions,
  proceedWithAssumptions,
  mode,
}: {
  rawRequest: string;
  questions: ClarificationQuestion[];
  missingDimensions: Dimension[];
  proceedWithAssumptions: boolean;
  mode: ClarificationMode;
}): ClarificationStatus {
  if (!rawRequest.trim()) {
    return "blocked";
  }
  if (proceedWithAssumptions) {
    return "ready";
  }

  const hasBlockingMissing = missingDimensions.some((dimension) => {
    if (mode !== "strict_ready" && ASSUMABLE_DIMENSIONS.has(dimension)) {
      return false;
    }
    return isCriticalDimension(dimension);
  });

  if (questions.length > 0 && hasBlockingMissing) {
    return "needs_clarification";
  }
  if (questions.length > 0) {
    return "needs_clarification";
  }
  return "ready";
}

function calculateConfidence({
  taskType,
  presentDimensions,
  missingDimensions,
  rawRequest,
  app,
}: {
  taskType: ClarificationTaskType;
  presentDimensions: Set<Dimension>;
  missingDimensions: Dimension[];
  rawRequest: string;
  app: ClarificationApp;
}) {
  const required = TASK_REQUIRED_DIMENSIONS[taskType];
  const presentRequired = required.filter((dimension) => presentDimensions.has(dimension)).length;
  const base = required.length === 0 ? 0.5 : presentRequired / required.length;
  const lengthBonus = rawRequest.length > 180 ? 0.08 : rawRequest.length > 80 ? 0.04 : 0;
  const appBonus = app !== "cross_suite" ? 0.04 : 0;
  const missingPenalty = Math.min(missingDimensions.length * 0.015, 0.12);
  return Number(Math.max(0.05, Math.min(0.95, base + lengthBonus + appBonus - missingPenalty)).toFixed(2));
}

function buildUnderstoodRequirement(
  rawRequest: string,
  app: ClarificationApp,
  taskType: ClarificationTaskType,
) {
  if (!rawRequest) {
    return "No requirement was provided.";
  }

  const appLabel = app === "cross_suite" ? "B2B Suite" : app;
  return `User wants ${taskType} clarification for ${appLabel}: ${rawRequest}`;
}

function buildReadySummary(
  rawRequest: string,
  app: ClarificationApp,
  taskType: ClarificationTaskType,
  assumptions: string[],
) {
  const appLabel = app === "cross_suite" ? "B2B Suite" : app;
  const assumptionText =
    assumptions.length > 0 ? ` Proceeding with assumptions: ${assumptions.join("; ")}` : "";
  return `Ready to draft ${taskType} for ${appLabel} based on: ${rawRequest}.${assumptionText}`;
}

function getPriority(dimension: Dimension): ClarificationQuestion["priority"] {
  const score = DIMENSION_WEIGHTS[dimension].impact + DIMENSION_WEIGHTS[dimension].ambiguity;
  if (score >= 10) return "critical";
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}

function isCriticalDimension(dimension: Dimension) {
  return [
    "problem",
    "user_or_actor",
    "scope",
    "trigger",
    "core_flow",
    "business_rules",
    "data_fields",
    "permissions",
    "acceptance_criteria",
  ].includes(dimension);
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}
