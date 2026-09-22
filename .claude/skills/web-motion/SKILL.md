---
name: web-motion
description: Add purposeful motion and scroll choreography without turning a marketing page into an animation demo.
---

# Web Motion

Default:
- CSS for trivial transitions
- Motion for UI and layout transitions
- GSAP for scroll-scrubbed or multi-stage timeline choreography

Rules:
- every non-trivial animation has a customer job (`docs/customer-first.md` §3)
- establish a motion hierarchy: one attention-grabber per viewport
- avoid animating everything
- preserve readability while motion runs
- never hide the H1 or primary CTA behind an entrance animation — they paint immediately (LCP)
- no scrolljacking: scroll stays native and 1:1; scroll-*linked* is fine, pinned/hijacked sequences need a written reason
- respect `prefers-reduced-motion` for all motion, including Motion/GSAP entrances (`MotionConfig reducedMotion="user"`)
- ensure mobile motion remains intentional
