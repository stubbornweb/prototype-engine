---
name: prototype-engine
description: Orchestrate fast, visually distinctive website prototypes. Use when the user asks to build, prototype, redesign, or ship a motion-heavy marketing site or interactive landing page quickly.
---

# Prototype Engine

## Mission
Create a demo-ready web experience quickly without sacrificing the visible quality of the result.

## Workflow
1. Read the prototype's `EXPERIENCE.md` and `prototype.yaml`.
2. Establish one coherent visual direction before coding.
3. Load only the specialist skills needed: web-design, web-patterns, web-motion, web-3d, web-video.
4. Prefer existing patterns over new infrastructure.
5. Build the smallest page that communicates the idea strongly.
6. Run the app and inspect the actual browser result.
7. Fix the largest visual problems before adding more features.
8. Run the prototype QA checklist.
9. Produce `qa/RESULT.md`.
10. The prototype is allowed to remain intentionally lightweight. Do not apply the full client-production bar unless asked to promote it.

## Routing rules

Technology choices are governed by `docs/stack-policy.md` in the engine root.
Read it before scaffolding; do not substitute remembered defaults.

The one decision to make explicitly, every time: count the sections that need
client JS. Mostly interactive → React + Vite. Content-led with a few islands →
Astro. Record the count and the choice in `EXPERIENCE.md` before writing code.

## Stop condition
The prototype is done when it has a strong visual hook, coherent composition, working interaction, mobile treatment, and no obvious browser errors.
