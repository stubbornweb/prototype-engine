---
name: web-patterns
description: Select and reuse patterns from the local pattern registry when building web experiences.
---

# Web Patterns

Search `${CLAUDE_PLUGIN_ROOT}/patterns/` before inventing a new interaction.

A reusable pattern defines:
- visual intent
- layout/composition
- motion
- inputs/variants
- responsive behavior
- performance constraints
- agent implementation recipe

When a prototype contains a repeatable technique worth keeping, run `prototype-engine extract-pattern <pattern-id>`. It writes the pattern into the local engine repo, `~/www/prototype-engine/patterns/<pattern-id>/`. Clean the pattern into an independent recipe there, then commit it on a branch and open a pull request in `stubbornweb/prototype-engine`.
