# Optional MCP integrations

## MotionSites

MotionSites currently publishes an MCP for Claude Code, Cursor, and Codex. The official setup command is:

```bash
claude mcp add motionsites --scope user --transport http https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp
```

This is an optional external reference source for visual/design patterns. Do not make the prototype engine depend on it: the local pattern registry must remain usable offline.

## Playwright

Use Playwright MCP when available for browser inspection, screenshots, and visual iteration. The engine should still keep a manual QA checklist so it does not hard-depend on one browser tool.
