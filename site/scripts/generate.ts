/**
 * Generate script for the SolidBase site.
 *
 * Outputs:
 *   - src/_generated/packages.json       — full list of PackageListItem (for the home table)
 *   - src/_generated/sidebar.json        — SolidBase sidebar config (grouped by category)
 *   - src/_generated/readme/<name>.html  — pre-rendered README HTML per package
 *   - src/routes/packages/<name>.mdx     — thin MDX wrapper per package
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { getModulesData, getPackageBundlesize, type ModuleData } from "../../scripts/utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.join(__dirname, "..", "..");
const packagesPath = path.join(rootPath, "packages");
const generatedDirPath = path.join(__dirname, "..", "src", "_generated");
const readmeDirPath = path.join(generatedDirPath, "readme");
const packageRoutesDirPath = path.join(__dirname, "..", "src", "routes", "packages");

// Ensure output dirs exist
for (const dir of [generatedDirPath, readmeDirPath, packageRoutesDirPath]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Markdown → HTML processor
// ---------------------------------------------------------------------------

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [
        ...(defaultSchema.attributes?.code ?? []),
        [
          "className",
          ...["js", "jsx", "ts", "tsx", "css", "md", "html", "json", "diff", "bash", "sh"].map(
            l => `language-${l}`,
          ),
        ],
      ],
    },
  })
  .use(rehypeHighlight)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    properties: { class: "header-anchor" },
    content: { type: "text", value: "#" },
  })
  .use(rehypeStringify);

// ---------------------------------------------------------------------------
// README cleanup
// ---------------------------------------------------------------------------

function cleanReadme(readme: string, moduleName: string): string {
  return (
    readme
      // remove heading-1
      .replace(/#\s+.+\n*/, "")
      // remove solid img banner
      .replace(
        /<p>(?=[^]*?<img(?=[^>]+?src="https:\/\/assets\.solidjs\.com\/banner[^"]+")[^>]*?>)[^]*?<\/p>/,
        "",
      )
      // remove size, version, stage, lerna img badge lines
      .replace(/^\[!\[(?:size|version|stage|lerna)\].+$/gm, "")
      // replace changelog relative url to github
      .replace(/(\[CHANGELOG\.md\])(\(\.\/CHANGELOG\.md\))/gi, (_, p1) => {
        return `${p1}(https://github.com/solidjs-community/solid-primitives/blob/main/packages/${moduleName}/CHANGELOG.md)`;
      })
      // remove Installation section (heading + code block)
      .replace(/##\s+installation[\r\n]+```[^`]+```/gi, "")
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Returns Unix timestamp in ms for the last commit touching the given directory, or 0. */
function getPackageLastUpdated(pkgDir: string): number {
  const result = spawnSync("git", ["log", "-1", "--pretty=%at", "--", pkgDir], {
    encoding: "utf8",
    cwd: rootPath,
  });
  const raw = result.stdout?.trim();
  return raw ? Number(raw) * 1000 : 0;
}

export type PackageListItem = ModuleData & {
  category: string;
  stage: number;
  lastUpdated: number;
  gzip?: number;
};

export type SidebarSection = {
  title: string;
  collapsed: boolean;
  items: { title: string; link: string }[];
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const modules = await getModulesData();

  // Pre-calculate all bundle sizes in parallel
  const primitiveModules = modules.filter(m => m.primitive != null);
  console.log(`\nCalculating bundle sizes for ${primitiveModules.length} packages...`);
  const bundleSizeResults = await Promise.allSettled(
    primitiveModules.map(m =>
      getPackageBundlesize(m.name, {
        peerDependencies: [
          ...m.peer_deps,
          ...m.workspace_deps.map(d => `@solid-primitives/${d}`),
        ],
      }).then(result => ({ name: m.name, gzip: result?.gzip })),
    ),
  );
  const gzipByName: Record<string, number | undefined> = {};
  for (const result of bundleSizeResults) {
    if (result.status === "fulfilled") {
      gzipByName[result.value.name] = result.value.gzip;
    }
  }

  const packages: PackageListItem[] = [];
  const categoryMap: Record<string, { title: string; link: string }[]> = {};

  for (const module of modules) {
    if (module.primitive == null) continue;

    const { name, primitive } = module;
    const category = primitive.category;
    const stage = primitive.stage;
    const lastUpdated = getPackageLastUpdated(path.join(packagesPath, name));
    const gzip = gzipByName[name];

    // Build PackageListItem
    const item: PackageListItem = { ...module, category, stage, lastUpdated, gzip };
    packages.push(item);

    // Build sidebar entries grouped by category
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category]!.push({ title: name, link: `/${name}` });

    // Process README → HTML
    const readmePath = path.join(packagesPath, name, "README.md");
    if (!fs.existsSync(readmePath)) continue;

    const rawReadme = await fsp.readFile(readmePath, "utf8");
    const cleanedMarkdown = cleanReadme(rawReadme, name);
    const html = String(await markdownProcessor.process(cleanedMarkdown));

    // Write per-package HTML file
    await fsp.writeFile(path.join(readmeDirPath, `${name}.html`), html);

    // Write thin MDX route file — each page imports its own HTML statically
    const mdxContent = `---
title: "@solid-primitives/${name}"
description: ${JSON.stringify(module.description || `SolidJS ${name} primitives`)}
packageLastUpdated: ${lastUpdated}
---

import PackageMeta from "~/components/PackageMeta";
import readmeHtml from "~/_generated/readme/${name}.html?raw";

# @solid-primitives/${name}

<PackageMeta
  name="${name}"
  stage={${stage}}
  category="${category}"
  version="${module.version}"
  primitives={${JSON.stringify(primitive.list)}}
  lastUpdated={${lastUpdated}}
/>

<div class="readme-content" innerHTML={readmeHtml} />
`;

    await fsp.writeFile(path.join(packageRoutesDirPath, `${name}.mdx`), mdxContent);
  }

  // Sort packages alphabetically within each category
  for (const items of Object.values(categoryMap)) {
    items.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Build sidebar array (sorted categories)
  const sidebar: SidebarSection[] = Object.entries(categoryMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, items]) => ({ title, items, collapsed: false }));

  // Write outputs
  await fsp.writeFile(
    path.join(generatedDirPath, "packages.json"),
    JSON.stringify(packages, null, 2),
  );

  await fsp.writeFile(
    path.join(generatedDirPath, "sidebar.json"),
    JSON.stringify(sidebar, null, 2),
  );

  console.log(`\nGenerated data for ${packages.length} packages.\n`);
})();
