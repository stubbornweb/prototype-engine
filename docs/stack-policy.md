# Stack policy

**This file is the single source of truth.** `src/cli.ts` injects it verbatim
into every generated `BUILD_PROMPT.md`. `CLAUDE.md`, `README.md`, and
`.claude/skills/prototype-engine/SKILL.md` point here instead of restating it.

If you change the policy, change it here and nowhere else.

---

## 1. Shell: decide by what needs JavaScript to work

Count the sections in the brief that need client JS **to work**: form state,
input that changes the page, media controls the visitor uses, 3D the visitor
moves, carousels, filters, multi-step flows.

Do not count decoration that CSS can do: fade or rise on scroll, scroll
progress lines, parallax, hover effects. Build these with CSS transitions and
scroll-driven animations (`animation-timeline: view()` / `scroll()`). Content
must be visible and complete in browsers that do not run the animation. A muted
background loop needs a few lines of plain script, not a component framework,
so do not count it either.

| Sections that need JS to work | Shell | Why |
| --- | --- | --- |
| Most of them | **React + Vite+** | Everything would be an island anyway; a second component model buys nothing and costs a decision per section |
| A handful, rest is content | **Astro** + React islands | Ships near-zero JS for the content majority |
| None | **Astro**, no islands | |

**React + Vite+** fits configurators, dashboards, booking flows and interactive
3D. In that class of work Astro's island boundaries become per-section overhead
— you write the `.astro` wrapper, the `.tsx` island, *and* the `client:`
directive decision, then debug the ones that silently didn't hydrate. Those
debug round-trips are the real context cost, not the file count.

**Astro** fits content-led pages: a landing or portfolio page that explains an
offer, long copy, many routes, blog or docs pages, or any brief where search
traffic matters. These usually count a handful or none.

State the choice and the section count in `EXPERIENCE.md` before writing code.
Do not switch shells mid-prototype; finish, then port under `web-production` if
the bundle actually warrants it.

## 2. Language and toolchain

- **Strict TypeScript, always.** Project code is `.ts` and `.tsx`. Never write
  `.js` or `.jsx`. Config files are `.ts` too. The scaffold turns on
  `strict: true`.
- **Tailwind, always** (§3).
- **Create `site/` only with `prototype-engine scaffold <slug> --shell
  astro|react`.** Never by hand. The command runs the official tool
  (`create-astro` or `create-vite`) through Vite+ (`npm create vite-plus@latest`),
  so versions are current. It then adds strict TypeScript, Tailwind 4 and the
  scripts below.
- **Run `npm run check` in `site/` before you call a prototype done.** Fix
  every error.

| Shell | `dev` / `build` | `check` | `fmt` |
| --- | --- | --- | --- |
| Astro | `astro dev` / `astro build` | `astro check`, `vp check`, and a Prettier check of `.astro` files | `vp fmt` and Prettier on `.astro` files |
| React + Vite+ | `vp dev` / `tsc -b && vp build` | `vp check` | `vp fmt` |

`vp check` (Vite+) checks formatting, lint rules and type errors in `.ts` and
`.tsx` files.

**Astro and Vite+.** Keep the `astro dev` and `astro build` scripts. On Astro,
`vp dev` returns 404 for every page, and `vp build` fails with "Cannot resolve
entry module index.html". This is an open Vite+ issue:
https://github.com/voidzero-dev/vite-plus/issues/1506.

**`.astro` files.** `vp lint`, `vp fmt` and `vp check` skip `.astro` files.
Two tools cover the gap:

- `astro check` finds type errors in `.astro` and `.tsx` files.
- Prettier with `prettier-plugin-astro` formats `.astro` files. It only touches
  `.astro` files, so it does not conflict with `vp fmt`.

No tool lints `.astro` files. This gap is open.

**React islands in Astro.** The scaffold has none. When a section needs one,
run `npx astro add react --yes` in `site/` and write the island in `.tsx`.

**Vue islands.** `vp fmt` formats `.vue` files. `vp lint`, `vp check` and
`astro check` do not find lint or type errors in them. If you add Vue, add
`vue-tsc --noEmit` to the `check` script.

## 3. Styling: Tailwind, always current major

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

## 4. Pin versions

Never write `"latest"` in a `package.json`. An engine that claims reproducible
output cannot have a scaffold that resolves differently every week. Pin a
caret range (`^4.1.0`) and record what was actually installed in
`prototype.yaml`.

## 5. Motion, 3D, video

- CSS first: transitions, and scroll-driven animations for scroll reveals and
  progress cues. **Motion** for UI animation inside islands that need JS anyway.
- **GSAP** only for genuinely timeline-heavy scroll choreography.
- **Three.js / R3F** only when the object must respond to user input, and
  lazy-loaded after the H1/CTA paint. A canvas
  2D field or a video loop beats a WebGL scene that only drifts.
- **Generated video** when the motion is passive and cinematic — cheaper and
  more reliable than realtime rendering for atmosphere.
- **Background loops are progressive MP4, not HLS.** HLS (`.m3u8`) is for
  long-form, user-started, or adaptive-bitrate video; for a short muted loop it
  adds a manifest round-trip, segment requests, a player library, and loop
  seams. Ship **AV1 MP4 first** (≈ ¼ the bytes) with an **H.264 MP4 fallback**,
  chosen in JS via `canPlayType` so nothing downloads under reduced motion or
  Save-Data. Reference: `prototypes/portfolio-studio/src/lib/useVideoSource.js`.
- For a loop whose last frame doesn't match its first, bake a **ping-pong**
  (forward + reversed, turnaround duplicates trimmed) into the file with
  ffmpeg — never reverse in the browser.
- The H.264 fallback must be **H.264**, audio stripped, with a poster extracted
  from frame 1 of the loop. HEVC/`hvc1` will not decode in most browsers and
  fails silently by showing the poster — check `videoWidth > 0` in the browser,
  not just that the file plays locally.

## 6. Backend

- **Payload CMS** for structured content on a JS/TS stack.
- **Laravel** when the project needs custom business logic, queues, auth, or
  richer backend services.
- A prototype gets neither unless the brief is specifically about the backend.

## 7. Delivery

- **Vercel** for prototype deployment.
- **Playwright** for browser/visual QA. A prototype is never done from source
  inspection — confirm `videoWidth`, console cleanliness, and mobile overflow
  in an actual browser.
