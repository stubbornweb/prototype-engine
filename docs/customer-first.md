# Customer-first design

**Injected verbatim into every `BUILD_PROMPT.md`, next to the stack policy.**
Skills point here; they do not restate it.

Design for the person whose decision pays for the website — not for other
designers, galleries, or our own portfolio. The site must still look current,
crafted, and distinctive in 2026. Distinctive is a tool for trust and memory,
not the goal. **Beauty that clarifies stays. Beauty that performs for peers goes.**

---

## 1. Start from the problem, not the look

Before any visual direction, write the **customer contract** in `EXPERIENCE.md`:

| Field | Answer in one line |
| --- | --- |
| Visitor | Who lands here, on what device, from where (ad, search, referral) |
| Their question | What they're trying to find out in the first 10 seconds |
| Offer | What the business sells, in plain words |
| Outcome | What changes for the visitor after buying |
| Proof | Why they should believe it (numbers, names, faces, guarantees) |
| Primary action | The one thing we want them to do — and the fallback action |
| Business metric | What the client counts: leads, bookings, sign-ups, revenue/visitor |

If a field is unknown, ask or write an explicit assumption. Visual direction is
chosen **after** this, and must serve it.

## 2. Five-second rule

Above the fold, on a 390px phone, a stranger must be able to answer:

1. What does this offer?
2. Who is it for?
3. What outcome does it create?
4. What should I do next?

The **H1 names the offer or the outcome** — not a mood ("Built to Last",
"Beyond Limits"). Mood can live in a pre-headline or the visuals. The primary
CTA is visible without scrolling and uses a verb + the thing ("Book a 30-min
call", "Get a quote"), not "Explore". If the test fails, fix the message and
hierarchy — do not add another effect.

## 3. Effect budget: every effect must earn its cost

For each video, canvas, 3D scene, scroll sequence, or non-trivial animation,
record in `EXPERIENCE.md` one line: *what it does for the customer*. Valid jobs:

- makes the offer easier to understand
- demonstrates something words cannot (product in 3D, before/after, a flow)
- increases trust (real people, real product, real numbers)
- directs attention to the next useful action

"Looks great in the portfolio" / "feels premium" alone is not a job. Cut it.

Motion hierarchy: at most **one** attention-grabbing element per viewport.
When everything moves, nothing is important.

## 4. Performance budget (mobile first)

Mobile is ~⅔ of traffic. Conversion falls steeply with every second of load.

| Budget | Prototype target |
| --- | --- |
| LCP (mobile, throttled 4G, mid-range CPU) | ≤ 2.5s ceiling, aim 1–2s |
| CLS | < 0.1 |
| Critical JS (gzip) | ≤ ~200 KB; heavy libs (three, hls.js, GSAP plugins) lazy-loaded |
| Hero media | poster ≤ 150 KB; video ≤ ~1 MB and never blocks the H1/CTA |
| Fonts | ≤ 2 families, ≤ 4 files, `font-display: swap` |
| Third-party scripts | none in the critical path |

Rules that follow:

- **The LCP element (usually the H1) paints immediately.** No `opacity: 0`
  entrance on the headline or primary CTA. Animate secondary elements instead.
- Video/3D/canvas are progressive enhancement: the page is complete and
  persuasive with the poster alone. Skip them under `prefers-reduced-motion`
  and `Save-Data`.
- No full-viewport `backdrop-filter` layers over video; they cost GPU on phones.

## 5. Preserve native behaviour

- **No scrolljacking.** Vertical scroll stays vertical and 1:1 with the
  gesture. Scroll-*linked* effects (parallax, progress rails, reveals) are fine;
  scroll-*hijacked* pinning sequences need a written justification in
  `EXPERIENCE.md` and a keyboard/reduced-motion path.
- No custom cursor, horizontal-scroll pages, or preloader screens unless they
  help the task.
- Navigation uses words, is reachable on mobile, and works by keyboard
  (Tab, Space, Page Down, arrows). Visible focus. No focus traps.
- Respect `prefers-reduced-motion` for *all* motion, including Motion/GSAP
  entrances — not just CSS `scroll-behavior`.
- Content is scannable: headings that say something, short blocks, numbers and
  links easy to spot. People scan; they do not watch.

## 6. Conversion structure

- Proof sits **next to** the ask (testimonial, number, logo, guarantee before
  the CTA), not in a separate gallery far below.
- Repeat the primary CTA contextually after each persuasive section.
- Plain, specific copy beats adjectives: "Reply within 24h" > "premium service".
- Never fabricate proof. Placeholder metrics are clearly marked as placeholders
  and must be replaced or removed before any client sees the page.

## 7. What "done" means

A prototype is done when it passes the five-second rule on mobile, stays inside
the performance budget, keeps native scroll and keyboard intact — **and** still
looks distinctive. A beautiful page that fails the first three is not done. A
fast, clear page that looks like a 2019 template is not done either.
