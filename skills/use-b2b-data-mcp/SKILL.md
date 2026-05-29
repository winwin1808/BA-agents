---
name: use-b2b-data-mcp
description: 'Use B2B Data MCP to verify quantitative product evidence for BSS B2B Suite, including usage, revenue, retention, funnel, cohort, subscription, uninstall, plan, module adoption, or operational metrics before using data-backed claims in analysis or PRDs.'
---

# Use B2B Data MCP

## Purpose

Use this as the quantitative evidence layer. Wiki MCP verifies product behavior; Data MCP verifies metrics and database-derived claims.

## Use Before Finalizing

- Usage, adoption, activation, retention, churn, uninstall, cohort, funnel, revenue, MRR, plan, subscription, or module performance claims
- Prioritization or strategy recommendations that depend on merchant behavior or business impact
- Data-backed PRD/RQM assumptions, success metrics, baselines, or opportunity sizing

## Workflow

1. Identify the app, metric, cohort, date range, and exclusion rules.
2. Inspect schema/source availability before writing SQL.
3. Preview queries before execution when the tool supports preview.
4. Execute only read-only queries with clear limits.
5. Report source tables, filters, date cutoffs, and known exclusions with the result.
6. If data is missing or incomplete, mark the claim as a gap rather than fact.

## Evidence Rules

- Query result with source/filter/date range = confirmed for that scope.
- Partial source, missing fields, or proxy metric = partial; explain the caveat.
- No available table/field/result = gap.
- Do not mix billing churn, app uninstall, and feature inactivity unless explicitly defined.
- Exclude dev/test stores only with a stated rule.
