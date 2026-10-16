---
name: principle-outcome-oriented-execution
description: "Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code."
disable-model-invocation: true
---

# Outcome-Oriented Execution

Optimize for the intended, verifiable end state rather than preserving smooth intermediate states.

**Why:** Keeping every intermediate step fully stable often creates temporary compatibility code that becomes long-lived debt. Converge on the target architecture and prove correctness at explicit verification boundaries.

**Core rule:**
- Prioritize end-state integrity over transitional stability
- Intermediate breakage is acceptable when it is planned, scoped, and reversible

**Guardrails:**
- Use this for planned rewrites and migrations with explicit phase boundaries
- Declare where temporary breakage is acceptable
- Keep high-signal checks for actively touched areas while migrating
- Require full static and runtime verification at plan completion

## Project compatibility

Apply these instructions within the repository's `AGENTS.md` and `CLAUDE.md`. Those files and the user's current request take precedence. Adapt the workflow to tools that are actually available; do not claim a tool, model, reviewer, or check was used when it was not. Do not spawn subagents unless the user or repository instructions explicitly request delegation. If this skill calls for parallel reviewers or workers, perform independent passes sequentially when delegation is not authorized. Do not add or run tests unless the user asks. Keep changes within the requested scope, do not create commits or pull requests unless requested, and retain any project-specific security, privacy, deployment, and approval constraints. Continue through reversible work without waiting for approval; pause only when information is essential or before a destructive or external action that needs authorization.
