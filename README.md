# Prototype Engine

A fast, agent-ready website prototyping system for Claude Code.

The goal is simple: turn an idea into a distinctive web experience quickly, publish it, extract reusable patterns, and later promote the best prototypes into a production client site or personal portfolio.

## Current MVP

```text
new → scaffold → build → review → publish → extract-pattern
```

`build` generates a deterministic build brief and will invoke Claude Code automatically when the `claude` executable is available. Without Claude Code installed, the generated prompt can be copied into Claude Code on your workstation.

## Stack policy

Defined once in **[docs/stack-policy.md](docs/stack-policy.md)** and injected
verbatim into every generated build prompt.

In short: the shell is chosen by how many sections need JavaScript to work, not
counting CSS-able decoration (React + Vite+ for mostly interactive briefs, Astro
for content-led ones); code is strict TypeScript; styling is Tailwind's latest stable
major configured CSS-first; Motion for UI animation and GSAP only for heavy
timeline work; 3D only when the object responds to input; Vercel for deploys and
Playwright for visual QA.

## Install

Node 26 or newer is required. The engine is a Claude Code plugin from the studio marketplace. Run these in Claude Code:

```text
/plugin marketplace add stubbornweb/studio
/plugin install prototype-engine@studio
```

The plugin gives you the web skills and puts the `prototype-engine` command on the PATH of the Bash tool in Claude Code.

## Use

Run the commands inside a meta repo, `~/www/<slug>-meta/`. The folder name gives the slug. Output goes into the `3-prototype/` folder of that meta repo. To make a meta repo, run `setup-meta-repo <slug>`.

```bash
# A project (the meta repo has PROJECT.md). The brief is 1-idea/PROJECT-DESCRIPTION.md.
prototype-engine new

# A quick experiment (no PROJECT.md)
prototype-engine new --pitch "A dark cinematic website for a premium architecture studio."

prototype-engine scaffold --shell astro
prototype-engine build
prototype-engine review
prototype-engine publish
prototype-engine extract-pattern architecture-hero
```

A meta repo has one prototype. `new` fails if `3-prototype/` exists. To start a new direction, delete `3-prototype/` first. Git keeps the old one. For a project, `new` also sets `**Stage:** prototype` in `PROJECT.md`.

`new --shell astro|react` creates the brief files and then the site. `scaffold` creates `3-prototype/site/` with the official Astro or Vite tool, strict TypeScript and Tailwind. It fails if `site/` already exists.

Run `npm run check` and `npm test` in this repo to check the CLI. Run `npm run check` in `3-prototype/site/` to check a site.

## Design principle

The engine is intentionally not a giant prompt library. Patterns are treated as reusable implementation recipes with visual intent, motion behavior, responsive behavior, and performance notes.

## Prototype → portfolio → client

```text
idea
 ↓
prototype
 ↓
visual QA
 ↓
publish
 ↓
pattern extraction
 ↓
portfolio case study
 ↓
client promotion
 ↓
production refactor
```
