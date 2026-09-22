# Prototype Engine — Claude Code Guide

This repository is an AI-assisted rapid web experience factory.

## Primary objective
Build a visually distinctive, demo-ready website prototype quickly. Prefer a strong visual idea and a small number of excellent interactions over a large feature set.

## Operating modes

### Prototype mode
Optimize for speed, visual impact, and learning. Keep architecture lightweight.

### Client production mode
Only after the prototype proves useful or the user explicitly asks for production. Then apply `web-production` and refactor for maintainability, performance, accessibility, SEO, reliability, and deployment.

## Skill order

1. `prototype-engine` — orchestration
2. `web-design` — visual direction
3. `web-patterns` — reuse local patterns
4. `web-motion` — UI/scroll choreography
5. `web-3d` — real-time 3D when it earns the complexity
6. `web-video` — cinematic video when passive motion is better
7. `web-visual-qa` — inspect the rendered site
8. `web-production` — only for client/production work

## Default technical policy

See **[docs/stack-policy.md](docs/stack-policy.md)** — it is the single source
of truth for shell, styling, motion, 3D, video, backend, and delivery choices,
and `src/cli.mjs` injects it into every generated build prompt.

Do not restate the policy here. Two summaries drift; one does not.

Headlines:

- Shell is chosen by **interactivity density**, not by project category.
  React + Vite is the default; Astro is for content-led briefs.
- Styling is **Tailwind, always the latest stable major**, configured CSS-first.
  Never generate `tailwind.config.js`.
- Never pin `"latest"` in a `package.json`.

## Browser truth

Do not declare a visual prototype finished from source inspection alone. Run it and inspect the actual browser result when possible. Fix the biggest visible issues first.

## Pattern flywheel

When a prototype contains a reusable technique:

```text
prototype → extract-pattern → clean recipe → registry → reuse
```

Do not copy a reference site's identity. Extract the interaction/composition pattern and create an original implementation.
