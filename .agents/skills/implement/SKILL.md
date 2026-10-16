---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.

## Project compatibility

Follow this repository's `AGENTS.md`, `CLAUDE.md`, and the user's current request first. Adapt the workflow to tools that are actually available; never claim that an unavailable tool, agent, tracker, or check was used. Do not spawn subagents unless the user or repository instructions explicitly authorize delegation; when this skill expects parallel reviewers, do independent review passes sequentially. Do not add or run tests unless the user asks. Do not create commits or pull requests unless requested, and do not publish to an issue tracker or external service unless the user asks. Keep any prototype disposable and within scope. Ask only when information is essential or an external/destructive action needs authorization. Preserve project-specific privacy, security, and deployment constraints.
