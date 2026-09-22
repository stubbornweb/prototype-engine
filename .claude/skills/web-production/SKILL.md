---
name: web-production
description: Promote a prototype to client-ready production quality.
---

# Web Production

Do this only for a client delivery or explicit production request.

Quality gate:
- refactor prototype-only shortcuts
- remove dead dependencies/code
- verify responsive layouts
- verify keyboard/focus behavior
- verify reduced motion
- optimize images/video/fonts
- review LCP, INP, CLS
- verify metadata, sitemap, robots, canonical URL
- check console and network errors
- add proper data/content integration
- add tests appropriate to the feature
- configure production environment safely
- deploy and health-check
- leave handoff documentation

Do not rewrite working code merely for architectural elegance. Refactor when it improves maintainability, reliability, performance, or future changeability.
