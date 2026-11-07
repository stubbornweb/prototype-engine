---
name: web-visual-qa
description: Inspect the actual rendered website in a browser and iterate on visible quality.
---

# Visual QA

Use Playwright when available.

Review at minimum — mobile first:
- mobile 390×844
- desktop 1440×900

Customer checks first (`${CLAUDE_PLUGIN_ROOT}/docs/customer-first.md`):
- five-second rule: screenshot the mobile fold, answer offer / who / outcome / next action from it alone
- mobile LCP with 4G + 4× CPU throttling; H1 and CTA not hidden by entrance animation
- keyboard pass: Tab through nav and CTAs, Space/Page Down scroll the page
- scroll is native — no hijacking, no trapped sections
- proof visible near the primary CTA

Inspect:
- hero hierarchy
- typography
- whitespace
- CTA visibility
- object/visual placement
- motion timing
- overflow/clipping
- loading state
- reduced motion
- console errors

Fix the three biggest problems first — a failed customer check outranks any visual flaw. Repeat the screenshot/inspect/fix loop until the result is demo-ready.
