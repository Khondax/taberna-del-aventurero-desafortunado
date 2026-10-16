---
name: principle-encode-lessons-in-structure
description: "Apply when you catch yourself writing the same instruction a second time, or notice a recurring correction. Encode the rule as a lint, metadata flag, runtime check, or script instead of more text."
disable-model-invocation: true
---

# Encode Lessons in Structure

If the lesson needs judgment and cannot be encoded, make the instruction more prominent and add an example of the failure mode.

**Corollary:** If the fix is structural, only use the structural fix. The instruction is the symptom.

## Project compatibility

Apply these instructions within the repository's `AGENTS.md` and `CLAUDE.md`. Those files and the user's current request take precedence. Adapt the workflow to tools that are actually available; do not claim a tool, model, reviewer, or check was used when it was not. Do not spawn subagents unless the user or repository instructions explicitly request delegation. If this skill calls for parallel reviewers or workers, perform independent passes sequentially when delegation is not authorized. Do not add or run tests unless the user asks. Keep changes within the requested scope, do not create commits or pull requests unless requested, and retain any project-specific security, privacy, deployment, and approval constraints. Continue through reversible work without waiting for approval; pause only when information is essential or before a destructive or external action that needs authorization.
