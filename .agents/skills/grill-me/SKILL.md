---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".

## Project compatibility

Follow this repository's `AGENTS.md`, `CLAUDE.md`, and the user's current request first. Adapt the workflow to tools that are actually available; never claim that an unavailable tool, agent, tracker, or check was used. Do not spawn subagents unless the user or repository instructions explicitly authorize delegation; when this skill expects parallel reviewers, do independent review passes sequentially. Do not add or run tests unless the user asks. Do not create commits or pull requests unless requested, and do not publish to an issue tracker or external service unless the user asks. Keep any prototype disposable and within scope. Ask only when information is essential or an external/destructive action needs authorization. Preserve project-specific privacy, security, and deployment constraints.
