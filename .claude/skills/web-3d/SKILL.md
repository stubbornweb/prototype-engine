---
name: web-3d
description: Build purposeful interactive 3D scenes using Three.js and React Three Fiber when the experience benefits from them.
---

# Web 3D

Use Three.js / React Three Fiber only when 3D materially improves the concept.

Prefer:
- reusable R3F components
- Drei utilities before custom helpers
- GLB assets instead of building complex meshes by hand
- lazy loading and static/mobile fallbacks
- restrained post-processing

Always consider GPU cost, touch interaction, loading behavior, and reduced-motion fallback.
