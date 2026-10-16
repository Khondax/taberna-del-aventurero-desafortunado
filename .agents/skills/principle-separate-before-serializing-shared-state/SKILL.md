---
name: principle-separate-before-serializing-shared-state
description: "Apply when concurrent actors might write to the same file, branch, key, or state object. Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant."
disable-model-invocation: true
---

# Separate Before Serializing Shared State

When concurrent actors might share mutable state, first ask whether they need the same mutable object. If not, eliminate the sharing. When sharing is real, enforce serialization structurally: lockfiles, sequential phases, exclusive ownership. Instructions and conventions are not concurrency control.

**Why:** Concurrent writes to shared state create race conditions that are intermittent, hard to reproduce, and expensive to debug.

**Pattern:**
1. **Identify shared mutable state** (files both read and write, branches both push to, APIs both define and consume).
2. **Default: eliminate the shared write target.** Ask: do these actors need one canonical object, or are they publishing independent facts? Give each actor its own owned file, key, branch, or state directory, and merge only at the read/reporting boundary. Two workers writing their own `lastX` field into one `state.json` is still shared mutation. `indexer-state.json` + `metrics-state.json` is not.
3. **Only when one shared write target is a real invariant, serialize access structurally** (lockfiles, sequential phases, single-writer actor, or atomic compare-and-swap). Treat "we need a lock" as a design smell to check, not as the default answer.

## Project compatibility

Apply these instructions within the repository's `AGENTS.md` and `CLAUDE.md`. Those files and the user's current request take precedence. Adapt the workflow to tools that are actually available; do not claim a tool, model, reviewer, or check was used when it was not. Do not spawn subagents unless the user or repository instructions explicitly request delegation. If this skill calls for parallel reviewers or workers, perform independent passes sequentially when delegation is not authorized. Do not add or run tests unless the user asks. Keep changes within the requested scope, do not create commits or pull requests unless requested, and retain any project-specific security, privacy, deployment, and approval constraints. Continue through reversible work without waiting for approval; pause only when information is essential or before a destructive or external action that needs authorization.
