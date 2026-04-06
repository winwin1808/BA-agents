# PRD Delivery Guidelines

Use this reference when the ask is about PRDs, RQMs, feature specs, PRD reviews, Jira breakdowns, user stories, sprint candidates, or backlog prioritization.

## 1. PRD Review Lenses

Review every PRD from these 3 perspectives before finalizing:

### 1.1 Dev Lens

- Technical feasibility and architecture fit
- Dependency and integration risks
- Performance and scalability concerns
- Delivery sequencing and rollback practicality

### 1.2 User Research / UX Lens

- Problem-user fit and evidence quality
- UX clarity across core journeys and edge cases
- Discoverability and adoption risks
- Accessibility and comprehension risks

### 1.3 Executive Lens

- Strategic fit and timing
- Business impact and KPI movement
- Resource trade-offs and opportunity cost
- Go / no-go risk profile

### 1.4 Consolidated Review Output

Every PRD review should end with:

- Top findings ordered by severity
- Conflict points across lenses
- Decision recommendation with required follow-ups

## 2. PRD Template (4-Part Style)

Use this structure for PRDs and implementation-ready RQMs.

### 2.1 Purpose

- Business problem and user pain
- Why this is needed now

### 2.2 Goals

- Primary outcome and KPI movement
- Baseline -> target -> timeframe

### 2.3 Delivery (Logic + Business)

#### Logic

- Scope: in-scope vs out-of-scope
- Functional requirements
- Non-functional requirements
- Data and reporting requirements
- Dependencies and rollout sequence

#### Business

- Expected impact and trade-offs
- Risks, mitigations, and owners
- Decision points and open questions

### 2.4 Acceptance Criteria

- Testable acceptance criteria
- Failure conditions and rollback triggers
- Launch readiness conditions

## 3. Required PRD Summary Sections

Every finalized PRD must include these two sections after the 4-part body:

### 3.1 PRD Review Summary

- Dev lens findings
- UX lens findings
- Executive lens findings
- Consolidated recommendation

### 3.2 Jira Breakdown

Break the PRD into Epic, Stories, and Tasks.

#### Epic

- Title in English with one prefix: `New:` | `Improve:` | `Bug:` | `Tech:` | `Doc:` | `Research:`
- Description in Vietnamese, including scope and business outcome

#### Stories

- Title in English with one prefix: `New:` | `Improve:` | `Bug:` | `Tech:` | `Doc:` | `Research:`
- Description in Vietnamese, including user value and acceptance summary

#### Tasks

- Title in English with one prefix: `New:` | `Improve:` | `Bug:` | `Tech:` | `Doc:` | `Research:`
- Description in Vietnamese, including implementation notes and dependencies

#### Team ownership

- Product Research can create all task types
- Development creates Task, Sub-task, and Bug

#### Language rule

- Requirement titles must be in English
- Requirement body content must be in Vietnamese
- Jira titles must be in English
- Jira descriptions must be in Vietnamese

## 4. Jira Naming Conventions

### 4.1 Sprint Name

- `Sprint {number}`

### 4.2 Epic Name

- `[Outcome] for [User/Scope]`

### 4.3 Story / Task Name

- `[Type] Verb + Object (+ Outcome)`

### 4.4 Sub-task Name

- `[Type] [Task ID] Verb + Object (+ Outcome)`
- Sub-tasks can be listed as short execution bullets when the goal is implementation breakdown

### 4.5 Type Definitions

| Type | When to use | Quick signal | Summary rule | Example |
| --- | --- | --- | --- | --- |
| `New` | Add a new capability, flow, or screen | This did not exist before | `New: Verb + outcome` | `New: Hide payment methods by conditions` |
| `Improve` | Improve an existing behavior, UX, or performance | The current behavior works but should work better | `Improve: Verb + better outcome` | `Improve: Speed up cart load for B2B portal` |
| `Bug` | Wrong logic, crash, regression, or incorrect data | It does not match expected behavior | `Bug: Fix + issue` | `Bug: Fix tier price not applied for company` |
| `Tech` | Refactor, technical debt, infra, cleanup | The goal is technical quality | `Tech: Verb + technical change` | `Tech: Refactor rule evaluation caching` |
| `Doc` | Write or update documentation | Documentation only | `Doc: Write/Update + document title` | `Doc: Update guide for payment hiding rules` |
| `Research` | Spike, POC, or unresolved question | A conclusion is still needed | `Research: Verify/Investigate + question` | `Research: Verify accelerated buttons when PayPal hidden` |
| `Discuss` | Stakeholder discussion or external alignment | Discussion is the work item | `Discuss: Channel + topic` | `Discuss: Email Shopify exempt request` |
| `Test` | Free-form testing task | Testing is the main activity | `Test: Test + scope` | `Test: Test full quote module flow` |

## 5. Prioritization and Estimation Model

Use the SV-SE matrix for sprint planning and backlog ordering.

### 5.1 Purpose

This model creates a shared language across Product and Engineering by scoring value and effort separately.

- For Dev: quantify difficulty, complexity, and time more objectively
- For PO / PM: choose sprint items with better ROI

### 5.2 Variables

#### SV = Severity / Business Value

Owned by PO / PA. Score from 1 to 5.

| SV | Level | Meaning | Example |
| --- | --- | --- | --- |
| `5` | Critical | Direct revenue, production, or legal impact | Checkout fails and orders cannot be created |
| `4` | High | Large impact on conversion or core flow | B2B checkout is hard to use and causes drop-off |
| `3` | Medium | Meaningful UX or operational improvement | Add a setting that reduces CS manual work |
| `2` | Low | Small, non-urgent improvement | UI polish or minor visual adjustment |
| `1` | Nice-to-have | Useful but not required for healthy operation | Small refactor or non-essential UI upgrade |

#### SE = Size / Effort / Complexity

Owned by Dev Lead. Score from 1 to 5.

| SE | Level | Meaning | Rough estimate |
| --- | --- | --- | --- |
| `5` | Very High | Complex core logic with high risk | More than 5 days. Must be split before sprint |
| `4` | High | Third-party integration or many edge cases | About 3-5 days |
| `3` | Medium | Moderate logic with clear testability | About 1-3 days |
| `2` | Low | Small change with limited system risk | Less than 1 day |
| `1` | Very Low | Very small change such as copy or basic CSS | Less than 0.5 day |

### 5.3 Priority Matrix

Rows are SV. Columns are SE.

| SV / SE | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| `5` | `8` | `5` | `3` | `2` | `1` |
| `4` | `8` | `5` | `3` | `2` | `1` |
| `3` | `5` | `3` | `2` | `1` | `1` |
| `2` | `3` | `2` | `1` | `1` | `0.5` |
| `1` | `1` | `1` | `0.5` | `0.5` | `0.5` |

### 5.4 Prioritization Rules

- High priority score + low effort = do first
- High effort + low value = challenge or deprioritize
- Use scores `8`, `5`, and `3` first during sprint planning
- Only pull `1` and `0.5` when capacity remains

### 5.5 Process Rules

1. PO / PM does not override SE
2. Dev Lead does not override SV
3. Any item with `SE = 5` must be split into smaller work before entering sprint

## 6. User Story Writing Guidelines

### 6.1 Story Structure

| Part | What to write | Quality bar |
| --- | --- | --- |
| Header | Identifying information | Clear outcome title, owner, dependencies if any |
| Purpose | Why this should exist and priority score | Clear pain and impact. Include all required priority fields and score |
| Goals | Outcome of the story and scope | At least one measurable outcome or proxy |
| Delivery | How it should work | In / out of scope is clear and dev can understand the implementation direction |
| Acceptance Criteria | Testable completion conditions | At least 2 measurable or checkable ACs |

### 6.2 Definition of Ready by Type

| Type | Ready condition |
| --- | --- |
| `New` | Problem, scope, and core AC are clear with no major ambiguity |
| `Improve` | Current issue is measurable and the target improvement is clear |
| `Bug` | Repro steps exist and expected vs actual is explicit |
| `Tech` | Technical goal and affected scope are explicit |
| `Doc` | Audience and required content are defined |
| `Research` | The question and expected output are clear |
| `Discuss` | The discussion objective and stakeholders are clear |

### 6.3 Definition of Done by Type

| Type | Done condition |
| --- | --- |
| `New` | AC passes, staging is OK, related docs or guide are updated |
| `Improve` | AC passes, staging is OK, related docs or guide are updated |
| `Bug` | Fix is verified and there is no regression |
| `Tech` | Technical quality is improved without changing expected behavior |
| `Doc` | Document is reviewed, published, and linked to the task |
| `Research` | Clear conclusion and next step exist |
| `Discuss` | The discussion is completed and the issue is resolved or next action is assigned |

### 6.4 Gating Rule

- If any required section is missing, the item must not move to `In Progress`
- Move it back to Documentation, Doc Review, or Blocked until complete

## 7. Output Expectations for AI

When using this reference:

1. Keep this guideline file in English
2. For requirement outputs, keep requirement titles in English and requirement body content in Vietnamese
3. Keep Jira titles in English and Jira descriptions in Vietnamese
4. Include SV, SE, and priority score when the user asks for sprint planning or prioritization
5. Do not finalize a PRD without the 3-lens review summary
6. Load `./SOCRATIC_QUESTIONING_FRAMEWORK.md` when the feature rationale, evidence, scope, or success criteria is weak
