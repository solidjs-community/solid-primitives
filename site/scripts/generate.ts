import { execFileSync } from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getModulesData, type ModuleData } from "../../scripts/utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDir = path.join(__dirname, "..");
const rootDir = path.join(siteDir, "..");
const packagesDir = path.join(rootDir, "packages");
const routesDir = path.join(siteDir, "src", "routes");
const generatedDir = path.join(siteDir, "src", "generated");

const GITHUB_REPO = "https://github.com/solidjs-community/solid-primitives";

/**
 * When the repo is in changesets prerelease mode (see `.changeset/pre.json`), packages are
 * published under a dist-tag (e.g. "next") instead of "latest" — a plain `npm i` would silently
 * install the last stable release, not the current prerelease. Reading this at generate time
 * (rather than hardcoding "next") means the install snippets/version tag stop appearing
 * automatically once the repo exits prerelease mode.
 */
function getPrereleaseTag(): string | null {
  try {
    const pre = JSON.parse(fs.readFileSync(path.join(rootDir, ".changeset", "pre.json"), "utf8"));
    return typeof pre.tag === "string" ? pre.tag : null;
  } catch {
    return null;
  }
}

const PRERELEASE_TAG = getPrereleaseTag();

// Package names that a plain kebab-case -> Title Case split gets wrong — either because
// they're acronyms/brand names, or because the real name has no hyphen to split on
// (e.g. "mediastream") but still reads better as separate words.
const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  a11y: "a11y",
  i18n: "i18n",
  "jsx-tokenizer": "JSX Tokenizer",
  "db-store": "DB Store",
  url: "URL",
  sse: "SSE",
  graphql: "GraphQL",
  mediastream: "Media Stream",
  websocket: "WebSocket",
  raf: "RAF",
};

/** Human-readable display name for a package slug — used in the sidebar and page titles.
 *  The URL, npm install command, etc. all keep using the real kebab-case slug. */
function getDisplayName(name: string): string {
  return (
    DISPLAY_NAME_OVERRIDES[name] ??
    name
      .split("-")
      .map(word => word[0]!.toUpperCase() + word.slice(1))
      .join(" ")
  );
}

// Order categories the way the docs read best; anything unrecognized sorts alphabetically after.
const CATEGORY_ORDER = [
  "Animation",
  "Browser APIs",
  "Control Flow",
  "Display & Media",
  "Forms",
  "Inputs",
  "Network",
  "Reactivity",
  "Sensors",
  "UI Patterns",
  "Utilities",
];

/**
 * Escape unclosed void elements (`<br>`, `<hr>`) into self-closing form so MDX's
 * JSX parser doesn't choke on them. Only touches lines outside fenced code blocks
 * (fences nested inside blockquotes are tracked too, since GFM allows that).
 */
function fixUnclosedVoidTags(markdown: string): string {
  const lines = markdown.split("\n");
  let inFence = false;
  const voidTagRe = /<(br|hr)([^<>]*)>/gi;

  return lines
    .map(line => {
      const unquoted = line.replace(/^(\s*>\s?)+/, "");
      if (unquoted.trimStart().startsWith("```")) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(voidTagRe, (m, tag, attrs) => {
        if (attrs.trimEnd().endsWith("/")) return m; // already self-closed
        return `<${tag}${attrs} />`;
      });
    })
    .join("\n");
}

function cleanReadme(readme: string, name: string): string {
  return readme
    // remove heading-1
    .replace(/^#\s+.+\n*/m, "")
    // remove the solid banner image block
    .replace(
      /<p>(?=[^]*?<img(?=[^>]+?src="https:\/\/assets\.solidjs\.com\/banner[^"]+")[^>]*?>)[^]*?<\/p>\n*/,
      "",
    )
    // remove badge lines (size/version/stage/lerna/tested-with-vitest etc.)
    .replace(/^\[!\[.+\]\(.+\)\]\(.+\)\n*/gm, "")
    // point relative CHANGELOG links at GitHub
    .replace(
      /(\[CHANGELOG\.md\])(\(\.\/CHANGELOG\.md\))/i,
      (_, p1) => `${p1}(${GITHUB_REPO}/blob/main/packages/${name}/CHANGELOG.md)`,
    )
    // drop the Installation section — we render a consistent one ourselves
    .replace(/##\s+installation[\r\n]+```[^`]*```\n*/gi, "")
    .trim();
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

/** The package's own last commit date in the monorepo — not the generated file's (nonexistent) git history. */
function getPackageLastUpdated(name: string): string | null {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%aI", "--", `packages/${name}`],
      { cwd: rootDir, encoding: "utf8" },
    ).trim();
    return iso ? dateFormatter.format(new Date(iso)) : null;
  } catch {
    return null;
  }
}

function buildMetaTable(module: ModuleData, lastUpdated: string | null): string {
  const stage = module.primitive!.stage;
  const version = PRERELEASE_TAG ? `${module.version} (${PRERELEASE_TAG})` : module.version;
  const cells = [
    `<span class="stage-badge stage-${stage}">${stage}</span>`,
    module.primitive!.category,
    version,
    lastUpdated ?? "Unknown",
  ];

  // Real GFM table syntax (not a raw HTML <table>) so it picks up the theme's
  // actual table component — bordered card, header background, cell padding.
  return [
    "| Stage | Category | Version | Last Updated |",
    "| --- | --- | --- | --- |",
    `| ${cells.join(" | ")} |`,
  ].join("\n");
}

function buildPageBody(module: ModuleData, readme: string, lastUpdated: string | null): string {
  // While the repo is in prerelease mode, packages publish under a dist-tag (not "latest") —
  // a bare `npm i` would silently install the last stable release instead of the current one.
  const install = PRERELEASE_TAG
    ? `npm i @solid-primitives/${module.name}@${PRERELEASE_TAG}`
    : `npm i @solid-primitives/${module.name}`;

  return `# ${getDisplayName(module.name)}

${module.description}

${buildMetaTable(module, lastUpdated)}

\`\`\`bash
${install}
\`\`\`

${readme}
`;
}

function frontmatter(title: string): string {
  // The built-in "last updated" is based on git history of this generated file, which is
  // gitignored and regenerated — so it's meaningless. We render our own in the meta table instead.
  return `---\ntitle: ${title}\nlastUpdated: false\n---\n\n`;
}

type SidebarItem = { title: string; link: string };
type SidebarGroup = { title: string; collapsed: boolean; items: SidebarItem[] };

function categorySort(a: string, b: string): number {
  const ai = CATEGORY_ORDER.indexOf(a);
  const bi = CATEGORY_ORDER.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

async function main() {
  await fsp.mkdir(routesDir, { recursive: true });
  await fsp.mkdir(generatedDir, { recursive: true });

  const modules = (await getModulesData())
    .filter(m => m.primitive != null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const byCategory = new Map<string, ModuleData[]>();

  for (const module of modules) {
    const readmePath = path.join(packagesDir, module.name, "README.md");
    const rawReadme = await fsp.readFile(readmePath, "utf8");
    const cleaned = fixUnclosedVoidTags(cleanReadme(rawReadme, module.name));
    const lastUpdated = getPackageLastUpdated(module.name);
    const page = frontmatter(getDisplayName(module.name)) + buildPageBody(module, cleaned, lastUpdated);

    await fsp.writeFile(path.join(routesDir, `${module.name}.mdx`), page);

    const category = module.primitive!.category;
    const list = byCategory.get(category) ?? [];
    list.push(module);
    byCategory.set(category, list);
  }

  const categories = [...byCategory.keys()].sort(categorySort);

  // A package is one importable unit, but usually exports several distinct primitives
  // (e.g. `clipboard` is 1 package but exports 4). Track both counts separately —
  // the home page needs "N packages" and "N primitives" and they're not the same number.
  const totalPackages = modules.length;
  const totalPrimitives = modules.reduce((sum, m) => sum + m.primitive!.list.length, 0);
  const categoryPrimitiveCounts = Object.fromEntries(
    categories.map(category => [
      category,
      byCategory.get(category)!.reduce((sum, m) => sum + m.primitive!.list.length, 0),
    ]),
  );

  await fsp.writeFile(
    path.join(generatedDir, "counts.ts"),
    `// Generated by site/scripts/generate.ts — do not edit by hand.\n` +
      `export const totalPackages = ${totalPackages};\n` +
      `export const totalPrimitives = ${totalPrimitives};\n` +
      `export const categoryPrimitiveCounts = ${JSON.stringify(categoryPrimitiveCounts, null, 2)} as const;\n`,
  );

  const sidebar: SidebarGroup[] = categories.map(category => ({
    title: category,
    collapsed: false,
    items: byCategory
      .get(category)!
      .map(module => ({ title: getDisplayName(module.name), link: `/${module.name}` })),
  }));

  await fsp.writeFile(
    path.join(generatedDir, "sidebar.ts"),
    `// Generated by site/scripts/generate.ts — do not edit by hand.\nexport const sidebar = ${JSON.stringify(sidebar, null, 2)} as const;\n`,
  );

  const primitivesOverviewBody = categories
    .map(category => {
      const items = byCategory
        .get(category)!
        .map(module => `- [\`${module.name}\`](/${module.name}) — ${module.description}`)
        .join("\n");
      return `## ${category}\n\n${items}\n`;
    })
    .join("\n");

  await fsp.writeFile(
    path.join(routesDir, "primitives.mdx"),
    `---\ntitle: All Primitives\n---\n\n# All Primitives\n\n${modules.length} primitives across ${categories.length} categories.\n\n${primitivesOverviewBody}`,
  );

  // oxlint-disable-next-line no-console
  console.log(`\nGenerated ${modules.length} package pages across ${categories.length} categories.\n`);
}

main();
