#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, cpSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

function usage() {
  console.log(`\nPrototype Engine\n\nUsage:\n  prototype-engine new <slug> --brief \"...\"\n  prototype-engine build <slug>\n  prototype-engine review <slug>\n  prototype-engine publish <slug>\n  prototype-engine extract-pattern <slug> <pattern-id>\n\nEnvironment:\n  PROTOTYPE_ENGINE_ROOT   Override engine root\n  CLAUDE_BIN              Claude Code executable (default: claude)\n`);
  process.exit(1);
}

function engineRoot() {
  return process.env.PROTOTYPE_ENGINE_ROOT ? resolve(process.env.PROTOTYPE_ENGINE_ROOT) : ROOT;
}

function parseBrief(args) {
  const i = args.indexOf("--brief");
  if (i === -1 || !args[i + 1]) throw new Error("Missing --brief");
  return args[i + 1];
}

// Shell is a real decision (docs/stack-policy.md §1), so it stays undecided
// until the build agent has counted the interactive sections.
function parseShell(args) {
  const i = args.indexOf("--shell");
  if (i === -1) return "undecided";
  const value = args[i + 1];
  if (!["react", "astro", "undecided"].includes(value)) {
    throw new Error(`--shell must be react, astro, or undecided (got: ${value})`);
  }
  return value;
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function prototypeDir(slug) {
  return join(engineRoot(), "prototypes", slug);
}

function newPrototype(slugInput, brief, shell = "undecided") {
  const slug = slugify(slugInput);
  if (!slug) throw new Error("Invalid slug");
  const dir = prototypeDir(slug);
  if (existsSync(dir)) throw new Error(`Prototype already exists: ${slug}`);

  mkdirSync(join(dir, "src"), { recursive: true });
  mkdirSync(join(dir, "public"), { recursive: true });
  mkdirSync(join(dir, "qa"), { recursive: true });

  const spec = `# ${slug}\n\n## Brief\n${brief}\n\n## Experience decision\n\n- Visual mode: undecided\n- Hero: undecided\n- Shell: ${shell} (count interactive sections first — docs/stack-policy.md §1)\n- Interactive sections: TBD\n- 3D: optional\n- Video: optional\n- Motion: cinematic but purposeful\n- Mobile fallback: required\n\n## Quality target\n\nPrototype mode: fast, polished, demo-ready.\n\nClient promotion requires the production gate in \\.claude/skills/web-production/SKILL.md.\n`;

  writeFileSync(join(dir, "EXPERIENCE.md"), spec);
  writeFileSync(join(dir, "prototype.yaml"), `name: ${slug}\nbrief: ${JSON.stringify(brief)}\nstatus: prototype\nvisual_mode: undecided\nhero: undecided\nstack:\n  shell: ${shell}\n  styling: tailwind-latest-major\n  motion: motion\n  three: optional\n  cms: optional\n  backend: optional\n`);
  writeFileSync(join(dir, "BUILD_PROMPT.md"), "# Build prompt\n\nRun `prototype-engine build " + slug + "` to generate/update this prompt.\n");
  // Only the Astro shell gets a pre-copied scaffold; React+Vite is scaffolded
  // by the build agent so it can pick current versions.
  const template = join(engineRoot(), "templates", "astro-marketing");
  if (shell === "astro" && existsSync(template)) {
    cpSync(template, join(dir, "site"), { recursive: true });
  }
  writeFileSync(join(dir, "qa/CHECKLIST.md"), "# Prototype QA\n\n- [ ] Desktop composition\n- [ ] Mobile composition\n- [ ] Motion timing\n- [ ] CTA clarity\n- [ ] No console errors\n- [ ] Reduced-motion fallback\n- [ ] Performance sanity check\n");
  console.log(`Created ${dir}`);
}

function stackPolicy() {
  const file = join(engineRoot(), "docs", "stack-policy.md");
  if (!existsSync(file)) throw new Error(`Missing stack policy: ${file}`);
  return readFileSync(file, "utf8");
}

function buildPrompt(slugInput) {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const spec = readFileSync(join(dir, "EXPERIENCE.md"), "utf8");
  const patterns = listPatterns(engineRoot());
  return `You are the Prototype Engine orchestrator.\n\nGoal: turn the prototype brief into a polished, visually distinctive web experience quickly.\n\nRules:\n- Follow the stack policy below exactly. It is authoritative; do not substitute remembered defaults.\n- Prefer reusable patterns over inventing infrastructure.\n- Keep prototype mode lightweight; do not over-engineer.\n- Verify the result in a browser before declaring done.\n\n--- BEGIN STACK POLICY ---\n${stackPolicy()}\n--- END STACK POLICY ---\n\nExperience spec:\n${spec}\n\nAvailable local patterns:\n${patterns}\n\nExecution:\n1. Choose one coherent visual direction.\n2. Count the interactive sections and record the shell choice in EXPERIENCE.md.\n3. Pick only the patterns needed.\n4. Build the page.\n5. Run the local app.\n6. Inspect desktop and mobile in a real browser.\n7. Fix the most visible problems.\n8. Leave a short note in qa/RESULT.md.\n9. Stop when it is polished enough to demo; do not gold-plate.\n`;
}

function listPatterns(root) {
  const dir = join(root, "patterns");
  if (!existsSync(dir)) return "(none)";
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `- ${e.name}`)
    .join("\n") || "(none)";
}

function build(slugInput) {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  const prompt = buildPrompt(slug);
  writeFileSync(join(dir, "BUILD_PROMPT.md"), `# Claude Code build prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n`);

  const claude = process.env.CLAUDE_BIN || "claude";
  const result = spawnSync(claude, ["--print", prompt], { cwd: dir, stdio: "inherit", shell: false });
  if (result.error?.code === "ENOENT") {
    console.log(`Claude Code is not installed here. Prompt written to ${join(dir, "BUILD_PROMPT.md")}`);
    console.log(`From your workstation run: claude --print "$(cat ${join(dir, "BUILD_PROMPT.md")})"`);
    return;
  }
  if (result.status !== 0) throw new Error(`Claude Code exited with status ${result.status}`);
}

function review(slugInput) {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const resultPath = join(dir, "qa/RESULT.md");
  const existing = existsSync(resultPath) ? readFileSync(resultPath, "utf8") : "";
  const content = `# Visual QA\n\nGenerated: ${new Date().toISOString()}\n\n## Checklist\n\n- [ ] Desktop screenshot reviewed\n- [ ] Mobile screenshot reviewed\n- [ ] Hero hierarchy is clear\n- [ ] Motion is purposeful\n- [ ] 3D/video does not overpower content\n- [ ] CTA is discoverable\n- [ ] No visible overflow\n- [ ] Reduced-motion fallback exists\n- [ ] Console is clean\n- [ ] Asset sizes are reasonable\n\n${existing}`;
  writeFileSync(resultPath, content);
  console.log(`QA checklist refreshed: ${resultPath}`);
}

function publish(slugInput) {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const vercel = spawnSync("vercel", ["--yes"], { cwd: dir, stdio: "inherit", shell: false });
  if (vercel.error?.code === "ENOENT") {
    console.log(`Vercel CLI not found. Install it and run ` + `vercel --yes` + ` in ${dir}`);
    return;
  }
  if (vercel.status !== 0) throw new Error(`Vercel exited with status ${vercel.status}`);
}

function extractPattern(slugInput, patternIdInput) {
  const slug = slugify(slugInput);
  const patternId = slugify(patternIdInput);
  const source = prototypeDir(slug);
  if (!existsSync(source)) throw new Error(`Unknown prototype: ${slug}`);
  const destination = join(engineRoot(), "patterns", patternId);
  if (existsSync(destination)) throw new Error(`Pattern already exists: ${patternId}`);
  mkdirSync(destination, { recursive: true });
  const sourceSpec = join(source, "EXPERIENCE.md");
  const body = existsSync(sourceSpec) ? readFileSync(sourceSpec, "utf8") : "";
  writeFileSync(join(destination, "PATTERN.md"), `# ${patternId}\n\nExtracted from prototype: ${slug}\n\n## Source notes\n${body}\n\n## TODO\n- [ ] Make the pattern independent\n- [ ] Define inputs/variants\n- [ ] Document mobile behavior\n- [ ] Document performance expectations\n- [ ] Add a live demo\n- [ ] Add an agent recipe\n`);
  console.log(`Pattern created: ${destination}`);
}

function main() {
  const [, , command, ...args] = process.argv;
  try {
    if (!command) usage();
    switch (command) {
      case "new":
        newPrototype(args[0] || "", parseBrief(args), parseShell(args));
        break;
      case "build":
        build(args[0] || "");
        break;
      case "review":
        review(args[0] || "");
        break;
      case "publish":
        publish(args[0] || "");
        break;
      case "extract-pattern":
        extractPattern(args[0] || "", args[1] || "");
        break;
      default:
        usage();
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
