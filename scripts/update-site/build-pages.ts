import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
// import { promises as fs } from "node:fs";
import { r } from "../utils";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { getNPMShield, getSizeShield } from "./build-html-table";
import { PackageJSONData } from ".";

const items: { path: string; pageStr: string }[] = [];

export const buildPage = async ({ pkg, name }: { pkg: PackageJSONData; name: string }) => {
  const dir = r(`../packages/${name}/README.md`);
  if (!existsSync(dir)) return;
  let readme = readFileSync(dir, "utf-8");

  const codeSandboxName = "codesandbox";
  const stackBlitzName = "stackblitz";
  const githubPagesURL = `https://solidjs-community.github.io/solid-primitives/${name}/`;

  readme = readme
    // remove heading-1
    .replace(/#\s+.+\n/m, "")
    // remove solid img banner
    .replace(/<p[^>]*>(?:\n|\s)+<img[^>]+\/?>(?:\n|\s)+<\/p>/, "")
    // remove stage, version, size ect img banners
    .replace(/^\[!\[\w+].+$/gm, "")
    // replace Installation with package install component
    .replace(/(##\s+installation\n+)(```[^`]+```)/i, (_, p1, p2) => {
      if (p2) {
        return `${p1}<CopyPackages packageName="${pkg.name}"/>`;
      }
      return _;
    })
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
        p2 = `[Live Site](${githubPagesURL})\n\n${p2}`;
        return `${p1}${p2}`;
      }
      return _;
    })
    // TODO: solve/post issue, mdx should solve this
    .replace(/<br>/g, "<br/>");

  const output = await compile(readme, {
    jsx: true,
    jsxImportSource: "solid-js",
    providerImportSource: "solid-mdx",
    // jsx: true,
    // jsxImportSource: "solid-jsx",
    // jsx: true,

    // jsxRuntime: "solid-jsx",

    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeHighlight,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: { class: "header-anchor" },
          content: { type: "text", value: "#" }
        }
      ]
    ]
    // outputFormat: "function-body"
  });
  let outputString = output.toString();
  outputString = outputString
    .replace("export default MDXContent;", "")
    .replace(/,\s+\{[^\}]+\}\s+=\s+_components;?/, ";")
    // TODO: solve/post issue, mdx should have a config to don't hydrate only on their components
    // Don't Hydrate markdown content, but keep injected components Hydratable
    .replace(/(return\s*<>)([^]*)(<\/>)/, (_, p1, content: string, p3) => {
      if (!content) return _;
      let hasComponent = false;
      content = content.replace(/<CopyPackages[^>]*>/, component => {
        hasComponent = true;
        return `</NoHydration>${component}<NoHydration>`;
      });
      if (!hasComponent) return _;

      return `${p1}<NoHydration>${content}</NoHydration>${p3}`;
    });

  // const html = "";
  // const converter = new showdown.Converter();
  // const html = converter.makeHtml(readme).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  // Replace Demo MD with table / or bullet three values
  // 1. Live Site
  // 2. Online IDE (Stackblitz) / Stackblitz/Codepen
  // 3. Source code[packages/${name}/src/dev]

  const pathToSitePrimitivesRoute = r(`../site/src/routes/(primitives)/${name}.tsx`);
  const pageStr = `
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CopyPackages from "~/components/CopyPackage/CopyPackages";
import { NoHydration } from "solid-js/web";

${outputString}

export default function Index () {
  return (
    <PrimitivePageMain packageName="${pkg.name}" name="${name}" stage={${pkg.primitive.stage}} packageList={} primitiveList={}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}
`;

  items.push({ path: pathToSitePrimitivesRoute, pageStr });
};

export const writePages = () => {
  items.forEach(({ path, pageStr }) => {
    writeFile(path, pageStr, err => {
      if (err) console.log(err);
    });
  });
};
