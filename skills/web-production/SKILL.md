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
- review LCP, INP, CLS against `${CLAUDE_PLUGIN_ROOT}/docs/customer-first.md` §4 (mobile, 75th percentile)
- remove any placeholder/fabricated proof; every number and testimonial is real and approved
- wire analytics for the client's business metric (leads, bookings, sign-ups, revenue/visitor), not just pageviews
- recommend one A/B test for the headline or CTA placement
- verify metadata, sitemap, robots, canonical URL
- check console and network errors
- add proper data/content integration
- add tests appropriate to the feature
- configure production environment safely
- deploy and health-check
- leave handoff documentation

Do not rewrite working code merely for architectural elegance. Refactor when it improves maintainability, reliability, performance, or future changeability.
