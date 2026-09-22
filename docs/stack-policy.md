# Stack policy

**This file is the single source of truth.** `src/cli.mjs` injects it verbatim
into every generated `BUILD_PROMPT.md`. `CLAUDE.md`, `README.md`, and
`.claude/skills/prototype-engine/SKILL.md` point here instead of restating it.

If you change the policy, change it here and nowhere else.

---

## 1. Shell: decide by interactivity density, not by category

Count the sections in the brief that need client JS — scroll reveals, hover
choreography, form state, video players, 3D, carousels.

| Interactive sections | Shell | Why |
| --- | --- | --- |
| Most of them | **React + Vite** (default) | Everything would be an island anyway; a second component model buys nothing and costs a decision per section |
| A handful, rest is prose | **Astro** + React islands | Ships near-zero JS for the static majority |
| Genuinely static | **Astro**, no islands | |

**Default to React + Vite.** This engine exists to produce motion-heavy
marketing pages, and in that class of work nearly every section animates. When
that is true, Astro's island boundaries become per-section overhead — you write
the `.astro` wrapper, the `.jsx` island, *and* the `client:` directive decision,
then debug the ones that silently didn't hydrate. Those debug round-trips are
the real context cost, not the file count.

Reach for Astro when the brief is content-led: long copy, many routes, blog or
docs pages, or SEO is an explicit requirement.

State the choice and the section count in `EXPERIENCE.md` before writing code.
Do not switch shells mid-prototype; finish, then port under `web-production` if
the bundle actually warrants it.

## 2. Styling: Tailwind, always current major

- **Always the latest stable Tailwind major.** At time of writing that is v4.
  Before scaffolding, confirm the current version and API via Context7
  (`/tailwindlabs/tailwindcss.com`) rather than from memory — this policy will
  go stale and the docs will not.
- **CSS-first configuration. Never generate `tailwind.config.js`.** v4 replaced
  it. A generated config file is a sign the agent is working from v3 memory.
- `@import "tailwindcss";` — never `@tailwind base/components/utilities`.
- Design tokens go in `@theme { }`: `--color-*`, `--font-*`, `--breakpoint-*`,
  `--ease-*`. This is how a prototype gets a coherent palette in one place.
- Custom utilities use `@utility name { }`, not `@layer utilities`.
- Custom variants use `@custom-variant`.
- Safelisting is `@source inline("...")`; scope control is `@source`,
  `@source not`, and `source(none)`.
- With Vite, use the first-party `@tailwindcss/vite` plugin, not PostCSS.

## 3. Pin versions

Never write `"latest"` in a `package.json`. An engine that claims reproducible
output cannot have a scaffold that resolves differently every week. Pin a
caret range (`^4.1.0`) and record what was actually installed in
`prototype.yaml`.

## 4. Motion, 3D, video

- CSS transitions first. **Motion** for ordinary UI animation.
- **GSAP** only for genuinely timeline-heavy scroll choreography.
- **Three.js / R3F** only when the object must respond to user input. A canvas
  2D field or a video loop beats a WebGL scene that only drifts.
- **Generated video** when the motion is passive and cinematic — cheaper and
  more reliable than realtime rendering for atmosphere.
- Hero video must be **H.264 MP4**, audio stripped, with a poster extracted
  from frame 1 of the loop. HEVC/`hvc1` will not decode in most browsers and
  fails silently by showing the poster — check `videoWidth > 0` in the browser,
  not just that the file plays locally.

## 5. Backend

- **Payload CMS** for structured content on a JS/TS stack.
- **Laravel** when the project needs custom business logic, queues, auth, or
  richer backend services.
- A prototype gets neither unless the brief is specifically about the backend.

## 6. Delivery

- **Vercel** for prototype deployment.
- **Playwright** for browser/visual QA. A prototype is never done from source
  inspection — confirm `videoWidth`, console cleanliness, and mobile overflow
  in an actual browser.
