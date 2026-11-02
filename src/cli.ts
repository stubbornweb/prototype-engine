#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function usage(): never {
  console.log(
    `\nPrototype Engine\n\nUsage:\n  prototype-engine new <slug> --brief "..." [--shell astro|react]\n  prototype-engine scaffold <slug> --shell astro|react\n  prototype-engine build <slug>\n  prototype-engine review <slug>\n  prototype-engine publish <slug>\n  prototype-engine extract-pattern <slug> <pattern-id>\n\nEnvironment:\n  PROTOTYPE_ENGINE_ROOT   Override engine root\n  CLAUDE_BIN              Claude Code executable (default: claude)\n`,
  );
  process.exit(1);
}

function engineRoot(): string {
  return process.env.PROTOTYPE_ENGINE_ROOT ? resolve(process.env.PROTOTYPE_ENGINE_ROOT) : ROOT;
}

function parseBrief(args: string[]): string {
  const i = args.indexOf("--brief");
  if (i === -1 || !args[i + 1]) throw new Error("Missing --brief");
  return args[i + 1];
}

// Shell is a real decision (docs/stack-policy.md §1), so it stays undecided
// until the build agent has counted the sections that need JS to work.
function parseShell(args: string[]): ShellChoice {
  const i = args.indexOf("--shell");
  if (i === -1) return "undecided";
  const value = args[i + 1];
  if (!isShellChoice(value)) {
    throw new Error(`--shell must be astro, react, or undecided (got: ${value})`);
  }
  return value;
}

function requireShell(args: string[]): Shell {
  const shell = parseShell(args);
  if (shell === "undecided") throw new Error("Missing --shell astro|react");
  return shell;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function prototypeDir(slug: string): string {
  return join(engineRoot(), "prototypes", slug);
}

type Shell = "astro" | "react";
type ShellChoice = Shell | "undecided";

// One step of a shell recipe. Paths are relative to the site/ folder.
// "run" steps use cwd site/, except the first one, which creates it from the
// prototype folder.
type Step =
  | { kind: "run"; command: string; args: string[]; cwd: "project" | "site" }
  | { kind: "json"; file: string; edit: (data: Record<string, unknown>) => void }
  | { kind: "write"; file: string; content: string }
  | { kind: "replace"; file: string; find: string; with: string }
  | { kind: "move"; from: string; to: string }
  | { kind: "remove"; path: string };

interface ShellRecipe {
  steps: Step[];
}

// `npm create vite-plus@latest` runs the Vite+ scaffolder, which runs the
// official tool (create-astro, create-vite). Everything after the first "--"
// goes to that tool. The folder name goes after the second "--".
const createSite = (tool: string, toolArgs: string[]): Step => ({
  kind: "run",
  command: "npm",
  cwd: "project",
  args: [
    "create",
    "vite-plus@latest",
    "--",
    tool,
    "--no-interactive",
    "--no-git",
    "--no-hooks",
    "--no-agent",
    "--no-editor",
    "--package-manager",
    "npm",
    "--",
    "site",
    ...toolArgs,
  ],
});

const inSite = (command: string, ...args: string[]): Step => ({
  kind: "run",
  command,
  args,
  cwd: "site",
});

// The scaffolder pins devEngines.packageManager to the npm version it
// downloaded. Any other npm then refuses to run, even "npm pkg delete", so the
// engine layer edits the file directly.
const dropDevEngines: Step = {
  kind: "json",
  file: "package.json",
  edit: (data) => {
    delete data["devEngines"];
  },
};

const PRETTIER_ASTRO = 'prettier --plugin prettier-plugin-astro "src/**/*.astro"';

const SHELLS = {
  astro: {
    steps: [
      createSite("astro", ["--template", "minimal", "--install", "--no-git", "--yes"]),
      dropDevEngines,
      inSite("npx", "astro", "add", "tailwind", "--yes"),
      inSite(
        "npm",
        "install",
        "--save-dev",
        "@astrojs/check",
        "typescript",
        "prettier",
        "prettier-plugin-astro",
      ),
      inSite(
        "npm",
        "pkg",
        "set",
        `scripts.check=astro check && vp check && ${PRETTIER_ASTRO} --check`,
        `scripts.fmt=vp fmt && ${PRETTIER_ASTRO} --write`,
      ),
      {
        kind: "replace",
        file: "src/pages/index.astro",
        find: "---\n---\n",
        with: '---\nimport "../styles/global.css";\n---\n',
      },
      {
        kind: "replace",
        file: "src/pages/index.astro",
        find: "<h1>Astro</h1>",
        with: '<h1 class="text-4xl">Astro</h1>',
      },
      { kind: "move", from: "astro.config.mjs", to: "astro.config.ts" },
      { kind: "replace", file: "astro.config.ts", find: "// @ts-check\n", with: "" },
      inSite("npm", "run", "fmt"),
    ],
  },
  react: {
    steps: [
      createSite("vite", ["--template", "react-ts"]),
      dropDevEngines,
      inSite("npm", "install", "tailwindcss", "@tailwindcss/vite"),
      {
        kind: "replace",
        file: "tsconfig.app.json",
        find: '"compilerOptions": {',
        with: '"compilerOptions": {\n    "strict": true,',
      },
      {
        kind: "replace",
        file: "tsconfig.node.json",
        find: '"compilerOptions": {',
        with: '"compilerOptions": {\n    "strict": true,',
      },
      {
        kind: "replace",
        file: "vite.config.ts",
        find: 'import react from "@vitejs/plugin-react";',
        with: 'import tailwindcss from "@tailwindcss/vite";\nimport react from "@vitejs/plugin-react";',
      },
      {
        kind: "replace",
        file: "vite.config.ts",
        find: "[react()]",
        with: "[react(), tailwindcss()]",
      },
      { kind: "write", file: "src/index.css", content: '@import "tailwindcss";\n' },
      {
        kind: "write",
        file: "src/App.tsx",
        content:
          'export default function App() {\n  return <h1 className="text-4xl">Hello</h1>;\n}\n',
      },
      { kind: "remove", path: "src/App.css" },
      { kind: "remove", path: "src/assets" },
      inSite("npm", "pkg", "set", "scripts.check=vp check", "scripts.fmt=vp fmt"),
      inSite("npm", "run", "fmt"),
    ],
  },
} satisfies Record<Shell, ShellRecipe>;

function isShell(value: string | undefined): value is Shell {
  return value !== undefined && Object.hasOwn(SHELLS, value);
}

function isShellChoice(value: string | undefined): value is ShellChoice {
  return value === "undecided" || isShell(value);
}

function runStep(step: Step, projectDir: string, siteDir: string): void {
  switch (step.kind) {
    case "run": {
      console.log(`$ ${step.command} ${step.args.join(" ")}`);
      const result = spawnSync(step.command, step.args, {
        cwd: step.cwd === "project" ? projectDir : siteDir,
        stdio: "inherit",
      });
      if (result.error) throw result.error;
      if (result.status !== 0) {
        throw new Error(`${step.command} ${step.args[0]} exited with status ${result.status}`);
      }
      return;
    }
    case "json": {
      const file = join(siteDir, step.file);
      const data: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new Error(`${step.file} is not a JSON object`);
      }
      const record = data as Record<string, unknown>;
      step.edit(record);
      writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
      return;
    }
    case "write":
      writeFileSync(join(siteDir, step.file), step.content);
      return;
    case "replace": {
      const file = join(siteDir, step.file);
      const text = readFileSync(file, "utf8");
      if (!text.includes(step.find)) {
        throw new Error(
          `The scaffold changed: ${step.file} no longer contains ${JSON.stringify(step.find)}`,
        );
      }
      writeFileSync(
        file,
        text.replace(step.find, () => step.with),
      );
      return;
    }
    case "move":
      renameSync(join(siteDir, step.from), join(siteDir, step.to));
      return;
    case "remove":
      rmSync(join(siteDir, step.path), { recursive: true });
      return;
  }
}

function scaffold(slugInput: string, shell: Shell): void {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const siteDir = join(dir, "site");
  if (existsSync(siteDir)) {
    throw new Error(`site/ already exists in ${dir}. Scaffold only creates a new site/.`);
  }
  try {
    for (const step of SHELLS[shell].steps) runStep(step, dir, siteDir);
  } catch (error) {
    rmSync(siteDir, { recursive: true, force: true });
    throw error;
  }
  const yamlPath = join(dir, "prototype.yaml");
  if (existsSync(yamlPath)) {
    const yaml = readFileSync(yamlPath, "utf8");
    writeFileSync(yamlPath, yaml.replace(/^( {2}shell: ).*$/m, `$1${shell}`));
  }
  console.log(
    `Scaffolded ${shell} site in ${siteDir}. Run "npm run check" there before you finish.`,
  );
}

function newPrototype(slugInput: string, brief: string, shell: ShellChoice): void {
  const slug = slugify(slugInput);
  if (!slug) throw new Error("Invalid slug");
  const dir = prototypeDir(slug);
  if (existsSync(dir)) throw new Error(`Prototype already exists: ${slug}`);

  mkdirSync(join(dir, "qa"), { recursive: true });

  const spec = `# ${slug}\n\n## Brief\n${brief}\n\n## Customer contract (docs/customer-first.md §1 — fill before visuals)\n\n- Visitor: TBD\n- Their question: TBD\n- Offer: TBD\n- Outcome: TBD\n- Proof: TBD\n- Primary action: TBD\n- Business metric: TBD\n\n## Experience decision\n\n- Visual mode: undecided\n- Hero: undecided\n- Shell: ${shell} (count sections that need JS to work first — docs/stack-policy.md §1)\n- Sections that need JS to work: TBD\n- 3D: optional\n- Video: optional\n- Motion: purposeful — one attention-grabber per viewport\n- Effect budget: list each effect + the customer job it does\n- Mobile fallback: required\n\n## Quality target\n\nPrototype mode: fast, polished, demo-ready — and passes the five-second rule and performance budget in docs/customer-first.md.\n\nClient promotion requires the production gate in \\.claude/skills/web-production/SKILL.md.\n`;

  writeFileSync(join(dir, "EXPERIENCE.md"), spec);
  writeFileSync(
    join(dir, "prototype.yaml"),
    `name: ${slug}\nbrief: ${JSON.stringify(brief)}\nstatus: prototype\nvisual_mode: undecided\nhero: undecided\nstack:\n  shell: ${shell}\n  styling: tailwind-latest-major\n  motion: motion\n  three: optional\n  cms: optional\n  backend: optional\n`,
  );
  writeFileSync(
    join(dir, "BUILD_PROMPT.md"),
    "# Build prompt\n\nRun `prototype-engine build " + slug + "` to generate/update this prompt.\n",
  );
  writeFileSync(
    join(dir, "qa/CHECKLIST.md"),
    "# Prototype QA\n\n- [ ] Five-second rule passes on 390px (offer, who, outcome, next action)\n- [ ] H1 names the offer/outcome; primary CTA visible without scrolling\n- [ ] Proof sits next to the ask\n- [ ] Every effect has a customer job in EXPERIENCE.md\n- [ ] Mobile LCP within budget; H1/CTA not hidden behind entrance animation\n- [ ] Native scroll + keyboard navigation intact\n- [ ] Reduced-motion covers all motion, not just CSS\n- [ ] Desktop composition still distinctive\n- [ ] Mobile composition\n- [ ] No console errors\n",
  );
  console.log(`Created ${dir}`);
  if (shell !== "undecided") scaffold(slug, shell);
}

function readDoc(name: string): string {
  const file = join(engineRoot(), "docs", name);
  if (!existsSync(file)) throw new Error(`Missing engine doc: ${file}`);
  return readFileSync(file, "utf8");
}

const stackPolicy = () => readDoc("stack-policy.md");
const customerFirst = () => readDoc("customer-first.md");

function buildPrompt(slugInput: string): string {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const spec = readFileSync(join(dir, "EXPERIENCE.md"), "utf8");
  const patterns = listPatterns(engineRoot());
  return `You are the Prototype Engine orchestrator.\n\nGoal: turn the prototype brief into a polished, distinctive web experience that helps the client's customers understand, trust, and act — quickly.\n\nRules:\n- Design for the customer, not for other designers. Follow the customer-first principles below; they outrank visual ambition.\n- Follow the stack policy below exactly. It is authoritative; do not substitute remembered defaults.\n- Prefer reusable patterns over inventing infrastructure.\n- Keep prototype mode lightweight; do not over-engineer.\n- Verify the result in a browser before declaring done.\n\n--- BEGIN STACK POLICY ---\n${stackPolicy()}\n--- END STACK POLICY ---\n\n--- BEGIN CUSTOMER-FIRST PRINCIPLES ---\n${customerFirst()}\n--- END CUSTOMER-FIRST PRINCIPLES ---\n\nExperience spec:\n${spec}\n\nAvailable local patterns:\n${patterns}\n\nExecution:\n1. Fill the customer contract in EXPERIENCE.md (state assumptions if the brief is silent).\n2. Choose one coherent visual direction that serves it.\n3. Count the sections that need JavaScript to work (not CSS-able decoration) and record the count and shell choice in EXPERIENCE.md.\n4. If site/ does not exist, run \`prototype-engine scaffold ${slug} --shell <your choice>\`. Never create site/ by hand.\n5. Pick only the patterns needed; record each effect's customer job.\n6. Build the page in site/, in strict TypeScript with Tailwind.\n7. Run the local app.\n8. Inspect mobile first, then desktop, in a real browser; run the five-second rule and check mobile LCP.\n9. Fix the biggest clarity/speed problems, then the most visible visual ones.\n10. Run \`npm run check\` in site/ and fix every error.\n11. Leave a short note in qa/RESULT.md.\n12. Stop when it is polished enough to demo; do not gold-plate.\n`;
}

function isErrnoException(error: Error | undefined): error is NodeJS.ErrnoException {
  return error !== undefined && "code" in error;
}

function listPatterns(root: string): string {
  const dir = join(root, "patterns");
  if (!existsSync(dir)) return "(none)";
  return (
    readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `- ${e.name}`)
      .join("\n") || "(none)"
  );
}

function build(slugInput: string): void {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  const prompt = buildPrompt(slug);
  writeFileSync(
    join(dir, "BUILD_PROMPT.md"),
    `# Claude Code build prompt\n\n\`\`\`text\n${prompt}\n\`\`\`\n`,
  );

  const claude = process.env.CLAUDE_BIN || "claude";
  const result = spawnSync(claude, ["--print", prompt], {
    cwd: dir,
    stdio: "inherit",
    shell: false,
  });
  if (isErrnoException(result.error) && result.error.code === "ENOENT") {
    console.log(
      `Claude Code is not installed here. Prompt written to ${join(dir, "BUILD_PROMPT.md")}`,
    );
    console.log(
      `From your workstation run: claude --print "$(cat ${join(dir, "BUILD_PROMPT.md")})"`,
    );
    return;
  }
  if (result.status !== 0) throw new Error(`Claude Code exited with status ${result.status}`);
}

function review(slugInput: string): void {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const resultPath = join(dir, "qa/RESULT.md");
  const existing = existsSync(resultPath) ? readFileSync(resultPath, "utf8") : "";
  const content = `# Visual QA\n\nGenerated: ${new Date().toISOString()}\n\n## Checklist\n\n- [ ] Desktop screenshot reviewed\n- [ ] Mobile screenshot reviewed\n- [ ] Five-second rule passes on mobile\n- [ ] Hero hierarchy is clear\n- [ ] Mobile LCP within budget\n- [ ] Native scroll + keyboard intact\n- [ ] Motion is purposeful\n- [ ] 3D/video does not overpower content\n- [ ] CTA is discoverable\n- [ ] No visible overflow\n- [ ] Reduced-motion fallback exists\n- [ ] Console is clean\n- [ ] Asset sizes are reasonable\n\n${existing}`;
  writeFileSync(resultPath, content);
  console.log(`QA checklist refreshed: ${resultPath}`);
}

function publish(slugInput: string): void {
  const slug = slugify(slugInput);
  const dir = prototypeDir(slug);
  if (!existsSync(dir)) throw new Error(`Unknown prototype: ${slug}`);
  const vercel = spawnSync("vercel", ["--yes"], { cwd: dir, stdio: "inherit", shell: false });
  if (isErrnoException(vercel.error) && vercel.error.code === "ENOENT") {
    console.log(`Vercel CLI not found. Install it and run ` + `vercel --yes` + ` in ${dir}`);
    return;
  }
  if (vercel.status !== 0) throw new Error(`Vercel exited with status ${vercel.status}`);
}

function extractPattern(slugInput: string, patternIdInput: string): void {
  const slug = slugify(slugInput);
  const patternId = slugify(patternIdInput);
  const source = prototypeDir(slug);
  if (!existsSync(source)) throw new Error(`Unknown prototype: ${slug}`);
  const destination = join(engineRoot(), "patterns", patternId);
  if (existsSync(destination)) throw new Error(`Pattern already exists: ${patternId}`);
  mkdirSync(destination, { recursive: true });
  const sourceSpec = join(source, "EXPERIENCE.md");
  const body = existsSync(sourceSpec) ? readFileSync(sourceSpec, "utf8") : "";
  writeFileSync(
    join(destination, "PATTERN.md"),
    `# ${patternId}\n\nExtracted from prototype: ${slug}\n\n## Source notes\n${body}\n\n## TODO\n- [ ] Make the pattern independent\n- [ ] Define inputs/variants\n- [ ] Document mobile behavior\n- [ ] Document performance expectations\n- [ ] Add a live demo\n- [ ] Add an agent recipe\n`,
  );
  console.log(`Pattern created: ${destination}`);
}

function main(): void {
  const [, , command, ...args] = process.argv;
  try {
    if (!command) usage();
    switch (command) {
      case "new":
        newPrototype(args[0] ?? "", parseBrief(args), parseShell(args));
        break;
      case "scaffold":
        scaffold(args[0] ?? "", requireShell(args));
        break;
      case "build":
        build(args[0] ?? "");
        break;
      case "review":
        review(args[0] ?? "");
        break;
      case "publish":
        publish(args[0] ?? "");
        break;
      case "extract-pattern":
        extractPattern(args[0] ?? "", args[1] ?? "");
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
