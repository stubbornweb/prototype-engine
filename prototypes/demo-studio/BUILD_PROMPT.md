# Claude Code build prompt

```text
You are the Prototype Engine orchestrator.

Goal: turn the prototype brief into a polished, visually distinctive web experience quickly.

Rules:
- Use Astro as the default marketing-site shell.
- Add React islands only where interaction is needed.
- Use Motion for UI animation; GSAP for genuinely timeline-heavy interactions.
- Use Three.js/R3F only when 3D materially improves the concept.
- Use generated video only when passive cinematic motion is better than realtime rendering.
- Prefer reusable patterns over inventing infrastructure.
- Keep prototype mode lightweight; do not over-engineer.
- Verify the result in a browser before declaring done.

Experience spec:
# demo-studio

## Brief
A dark cinematic portfolio for a premium architecture studio with an interactive 3D hero and restrained motion.

## Experience decision

- Visual mode: undecided
- Hero: undecided
- 3D: optional
- Video: optional
- Motion: cinematic but purposeful
- Mobile fallback: required

## Quality target

Prototype mode: fast, polished, demo-ready.

Client promotion requires the production gate in \.claude/skills/web-production/SKILL.md.


Available local patterns:
- architecture-hero
- cinematic-hero

Execution:
1. Choose one coherent visual direction.
2. Pick only the patterns needed.
3. Build the page.
4. Run the local app.
5. Inspect desktop and mobile in a real browser.
6. Fix the most visible problems.
7. Leave a short note in qa/RESULT.md.
8. Stop when it is polished enough to demo; do not gold-plate.

```
