# Prototype Engine

A fast, agent-ready website prototyping system for Claude Code.

The goal is simple: turn an idea into a distinctive web experience quickly, publish it, extract reusable patterns, and later promote the best prototypes into a production client site or personal portfolio.

## Current MVP

```text
new → build → review → publish → extract-pattern
```

`build` generates a deterministic build brief and will invoke Claude Code automatically when the `claude` executable is available. Without Claude Code installed, the generated prompt can be copied into Claude Code on your workstation.

## Stack policy

Defined once in **[docs/stack-policy.md](docs/stack-policy.md)** and injected
verbatim into every generated build prompt.

In short: the shell is chosen by how many sections need client JS (React + Vite
by default, Astro for content-led briefs); styling is Tailwind's latest stable
major configured CSS-first; Motion for UI animation and GSAP only for heavy
timeline work; 3D only when the object responds to input; Vercel for deploys and
Playwright for visual QA.

## Install

```bash
npm install
npm run build
npm link
```

Then:

```bash
prototype-engine new architecture-studio --brief "A dark cinematic website for a premium architecture studio with an interactive hero."
prototype-engine build architecture-studio
prototype-engine review architecture-studio
prototype-engine publish architecture-studio
prototype-engine extract-pattern architecture-studio architecture-hero
```

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
