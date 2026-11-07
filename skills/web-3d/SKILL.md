---
name: web-3d
description: Build purposeful interactive 3D scenes using Three.js and React Three Fiber when the experience benefits from them.
---

# Web 3D

Use Three.js / React Three Fiber only when 3D shows the customer something words and images cannot — a product they can turn, a configuration they can try. Ambient 3D that only drifts is peer-bait; use video or a still.

Prefer:
- reusable R3F components
- Drei utilities before custom helpers
- GLB assets instead of building complex meshes by hand
- lazy loading and static/mobile fallbacks
- restrained post-processing

Lazy-load the 3D bundle after the H1/CTA paint; the page must persuade without it. Always consider GPU cost on a mid-range phone, touch interaction, loading behavior, and reduced-motion fallback.
