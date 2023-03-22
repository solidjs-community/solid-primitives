import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { getModulesData, ModuleData } from "../../scripts/get-modules-data";
import { getPackageBundlesize, formatBytes } from "../../scripts/calculate-bundlesize";
import { isNonNullable } from "../../scripts/utils";
import { PackageData, GITHUB_REPO } from "../src/types";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitePath = path.join(__dirname, "..");
const generatedDirPath = path.join(sitePath, "src", "_generated");
const packagesDist = path.join(generatedDirPath, "packages");
const listDist = path.join(generatedDirPath, "packages.json");

const PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES = ["signal-builders", "platform", "immutable"] as const;

async function generateReadme(module: ModuleData) {
  let readme = await fsp.readFile(path.join(module.path, "README.md"), "utf8");

  readme = readme
    // remove heading-1
    .replace(/#\s+.+\n*/, "")
    // remove solid img banner
    .replace(
      /<p>(?=[^]*?<img(?=[^>]+?src="https:\/\/assets\.solidjs\.com\/banner[^"]+")[^>]*?>)[^]*?<\/p>/,
      "",
    )
    // remove turborepo, size, version, stage ect... img banners
    .replace(/^\[!\[(?:turborepo|size|version|stage|lerna)\].+$/gm, "")
    // replace changelog relative url to github repo changelog
    .replace(/(\[CHANGELOG\.md\])(\(\.\/CHANGELOG\.md\))/i, (_, p1, p2) => {
      if (!p2) return _;
      return `${p1}(${GITHUB_REPO}/blob/main/packages/${module.name}/CHANGELOG.md)`;
    })
    // remove Installation section
    .replace(/##\s+installation[\r?\n]+```[^`]+```/gi, "")
    // replace Demo links with Live Site, Codesandbox/Stackblitz, Dev Source Code
    .replace(/(?<!#)(##\s+demo\n)((.|\n)+?)(?=(\n##\s))/i, (_, p1, p2) => {
      if (p2) {
        p2 = p2.replace(/https?:\/\/[^\s]+/, (match: string) => {
          const url = new URL(match);
          const origin = url.origin;
          if (origin.match(/codesandbox/i)) {
            return `[CodeSandbox](${match})`;
          }
          if (origin.match(/stackblitz/i)) {
            return `[StackBlitz](${match})`;
          }
          return origin;
        });
        p2 = `[Live Site](https://solidjs-community.github.io/solid-primitives/${module.name}/)\n\n${p2}`;
        return `${p1}${p2}`;
      }
      return _;
    });

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    // support GitHub Flavored Markdown
    .use(remarkGfm)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        // https://github.com/rehypejs/rehype-highlight#example-sanitation
        code: [
          ...(defaultSchema.attributes?.code || []),
          [
            "className",
            // List of all allowed languages:
            ...["js", "jsx", "ts", "tsx", "css", "md", "html", "json", "diff", "bash"].map(
              lang => `language-${lang}`,
            ),
          ],
        ],
      },
    })
    // highlight code blocks
    .use(rehypeHighlight)
    // add id to headings
    .use(rehypeSlug)
    // add # to headings
    .use(rehypeAutolinkHeadings, {
      properties: { class: "header-anchor" },
      content: { type: "text", value: "#" },
    })
    .use(rehypeStringify)
    .process(readme);

  return String(file);
}

async function generatePrimitiveSizes(module: ModuleData) {
  if (PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES.includes(module.name as any)) {
    return [];
  }

  const sizes = await Promise.all(
    module.primitives.map(async primitive => {
      const result = await getPackageBundlesize(module.name, { exportName: primitive });
      if (!result) return null;
      return {
        name: primitive,
        min: formatBytes(result.min).string,
        gzip: formatBytes(result.gzip).string,
      };
    }),
  );

  return sizes.filter(isNonNullable);
}

async function generatePackageSize(module: ModuleData) {
  const result = await getPackageBundlesize(module.name);
  if (!result) return null;
  return {
    min: formatBytes(result.min).string,
    gzip: formatBytes(result.gzip).string,
  };
}

(async () => {
  if (!fs.existsSync(packagesDist)) {
    await fsp.mkdir(packagesDist);
  }

  const modules = await getModulesData(async module => {
    const [readme, primitives, packageSize] = await Promise.all([
      generateReadme(module),
      generatePrimitiveSizes(module),
      generatePackageSize(module),
    ] as const);

    const data: PackageData = { ...module, readme, primitives, packageSize };

    // write data to individual json file
    const outputFilename = path.join(packagesDist, `${module.name}.json`);
    await fsp.writeFile(outputFilename, JSON.stringify(data, null, 2));

    return module.name;
  });

  // gather all module names into one json file
  await fsp.writeFile(listDist, JSON.stringify(modules, null, 2));

  // eslint-disable-next-line no-console
  console.log(`\nGenerated data for ${modules.length} packages.\n`);
})();
