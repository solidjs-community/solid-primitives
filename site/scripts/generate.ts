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
  const cells = [
    `<span class="stage-badge stage-${stage}">${stage}</span>`,
    module.primitive!.category,
    lastUpdated ?? "Unknown",
  ];

  // Real GFM table syntax (not a raw HTML <table>) so it picks up the theme's
  // actual table component — bordered card, header background, cell padding.
  return [
    "| Stage | Category | Last Updated |",
    "| --- | --- | --- |",
    `| ${cells.join(" | ")} |`,
  ].join("\n");
}

function buildPageBody(module: ModuleData, readme: string, lastUpdated: string | null): string {
  const install = `npm i @solid-primitives/${module.name}`;

  return `# ${module.name}

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
    const page = frontmatter(module.name) + buildPageBody(module, cleaned, lastUpdated);

    await fsp.writeFile(path.join(routesDir, `${module.name}.mdx`), page);

    const category = module.primitive!.category;
    const list = byCategory.get(category) ?? [];
    list.push(module);
    byCategory.set(category, list);
  }

  const categories = [...byCategory.keys()].sort(categorySort);

  const sidebar: SidebarGroup[] = categories.map(category => ({
    title: category,
    collapsed: false,
    items: byCategory
      .get(category)!
      .map(module => ({ title: module.name, link: `/${module.name}` })),
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
