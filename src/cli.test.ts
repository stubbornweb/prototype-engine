import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vite-plus/test";

const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url));

const PROJECT_MD = "# Acme site\n\n**Format:** 1\n**Stage:** idea\n**Client:** acme\n";
const BRIEF = "# Brief\n\nA site that sells shoes.\n";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function makeRepo(name: string, files: Record<string, string> = {}): string {
  const parent = mkdtempSync(join(tmpdir(), "pe-test-"));
  temps.push(parent);
  const root = join(parent, name);
  mkdirSync(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

function run(cwd: string, ...args: string[]) {
  const result = spawnSync("node", [CLI, ...args], { cwd, encoding: "utf8" });
  return { status: result.status, stderr: result.stderr, stdout: result.stdout };
}

function listFiles(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path, base) : [path.slice(base.length + 1)];
  });
}

describe("slug and meta repo", () => {
  test("outside a meta repo the command fails and writes nothing", () => {
    const root = makeRepo("not-a-meta-folder");
    const result = run(root, "new", "--pitch", "x");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("setup-meta-repo");
    expect(listFiles(root)).toEqual([]);
  });

  test.each(["Bad_Slug-meta", "hub-meta", "clients-meta", "double--dash-meta", "-lead-meta"])(
    "the folder %s is a wrong slug",
    (name) => {
      const root = makeRepo(name);
      const result = run(root, "new", "--pitch", "x");
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("a-z");
      expect(result.stderr).toContain("40 characters");
      expect(listFiles(root)).toEqual([]);
    },
  );
});

describe("new, quick experiment", () => {
  test("writes 3-prototype/ from the pitch", () => {
    const root = makeRepo("demo-meta");
    const result = run(root, "new", "--pitch", "A one-line idea");
    expect(result.status).toBe(0);
    const yaml = readFileSync(join(root, "3-prototype/prototype.yaml"), "utf8");
    expect(yaml).toContain('pitch: "A one-line idea"');
    expect(yaml).not.toMatch(/^(status|name|brief):/m);
    const experience = readFileSync(join(root, "3-prototype/EXPERIENCE.md"), "utf8");
    expect(experience).toContain("# demo");
    expect(experience).toContain("A one-line idea");
    expect(existsSync(join(root, "3-prototype/qa/CHECKLIST.md"))).toBe(true);
  });

  test("without --pitch it fails and writes nothing", () => {
    const root = makeRepo("demo-meta");
    const result = run(root, "new");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--pitch");
    expect(listFiles(root)).toEqual([]);
  });

  test("works from a subfolder of the meta repo", () => {
    const root = makeRepo("demo-meta", { "notes/deep/.keep": "" });
    const result = run(join(root, "notes/deep"), "new", "--pitch", "From below");
    expect(result.status).toBe(0);
    expect(existsSync(join(root, "3-prototype/prototype.yaml"))).toBe(true);
    expect(existsSync(join(root, "notes/deep/3-prototype"))).toBe(false);
  });
});

describe("new, project", () => {
  test("reads the brief and sets the stage to prototype", () => {
    const root = makeRepo("acme-meta", {
      "PROJECT.md": PROJECT_MD,
      "1-idea/PROJECT-DESCRIPTION.md": BRIEF,
    });
    const result = run(root, "new");
    expect(result.status).toBe(0);
    const yaml = readFileSync(join(root, "3-prototype/prototype.yaml"), "utf8");
    expect(yaml).not.toMatch(/^(pitch|status|name|brief):/m);
    const experience = readFileSync(join(root, "3-prototype/EXPERIENCE.md"), "utf8");
    expect(experience).toContain("The brief is in 1-idea/PROJECT-DESCRIPTION.md.");
    expect(readFileSync(join(root, "PROJECT.md"), "utf8")).toBe(
      PROJECT_MD.replace("**Stage:** idea", "**Stage:** prototype"),
    );
  });

  test("without a brief it fails and changes nothing", () => {
    const root = makeRepo("acme-meta", { "PROJECT.md": PROJECT_MD });
    const result = run(root, "new");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("project-brief");
    expect(existsSync(join(root, "3-prototype"))).toBe(false);
    expect(readFileSync(join(root, "PROJECT.md"), "utf8")).toBe(PROJECT_MD);
  });

  test("with --pitch it fails and changes nothing", () => {
    const root = makeRepo("acme-meta", {
      "PROJECT.md": PROJECT_MD,
      "1-idea/PROJECT-DESCRIPTION.md": BRIEF,
    });
    const result = run(root, "new", "--pitch", "x");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("PROJECT-DESCRIPTION.md");
    expect(existsSync(join(root, "3-prototype"))).toBe(false);
    expect(readFileSync(join(root, "PROJECT.md"), "utf8")).toBe(PROJECT_MD);
  });

  test("without a Stage line it fails and writes nothing", () => {
    const noStage = "# Acme site\n\n**Format:** 1\n";
    const root = makeRepo("acme-meta", {
      "PROJECT.md": noStage,
      "1-idea/PROJECT-DESCRIPTION.md": BRIEF,
    });
    const result = run(root, "new");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Stage");
    expect(existsSync(join(root, "3-prototype"))).toBe(false);
    expect(readFileSync(join(root, "PROJECT.md"), "utf8")).toBe(noStage);
  });
});

describe("new, existing prototype", () => {
  test("fails and leaves 3-prototype/ unchanged", () => {
    const root = makeRepo("demo-meta", { "3-prototype/EXPERIENCE.md": "old\n" });
    const result = run(root, "new", "--pitch", "x");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("3-prototype/ already exists");
    expect(listFiles(join(root, "3-prototype"))).toEqual(["EXPERIENCE.md"]);
    expect(readFileSync(join(root, "3-prototype/EXPERIENCE.md"), "utf8")).toBe("old\n");
  });
});

describe("extract-pattern", () => {
  test("rejects a wrong pattern id and shows the rule", () => {
    const root = makeRepo("demo-meta", { "3-prototype/EXPERIENCE.md": "x\n" });
    const result = run(root, "extract-pattern", "Bad_Id");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("a-z");
    expect(result.stderr).toContain("40 characters");
  });
});
