import { existsSync, mkdirSync, readFileSync, writeFile, writeFileSync } from "fs";
import { r } from "../utils";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { PackageJSONData, TUpdateSiteGlobal } from ".";

const items: { path: string; pageStr: string }[] = [];

const routeName = "package";

export const buildPage = async ({
  pkg,
  name,
  globalState,
}: {
  pkg: PackageJSONData;
  name: string;
  globalState: TUpdateSiteGlobal;
}) => {
  const dir = r(`../packages/${name}/README.md`);
  if (!existsSync(dir)) return;
  let readme = readFileSync(dir, "utf-8");

  const codeSandboxName = "codesandbox";
  const stackBlitzName = "stackblitz";
  const githubPagesURL = `https://solidjs-community.github.io/solid-primitives/${name}/`;
  const githubChangelogURL = `https://github.com/solidjs-community/solid-primitives/blob/main/packages/${name}/CHANGELOG.md`;
  // console.log(pkg.primitive.list.join("|"));
  const primitiveCodeElRegex = new RegExp(
    `<((?:_components\\.)?code)>{?(?:"|')?(<?(?:${pkg.primitive.list.join(
      "|",
    )})>?)(?:"|')?}?<\\/((?:_components\\.)?code)>`,
    "g",
  );

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
      return `${p1}(${githubChangelogURL})`;
    })
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
          content: { type: "text", value: "#" },
        },
      ],
    ],
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
    })
    // update code tag that contains primitives to have attribute
    .replace(primitiveCodeElRegex, (_, p1, p2, p3) => {
      if (!p2) return _;
      return `<${p1} data-code-primitive-name="${p2.replace(
        /\<|\>/g,
        "",
      )}" data-code-package-name="${name}">{"${p2}"}</${p3}>`;
    });

  // const html = "";
  // const converter = new showdown.Converter();
  // const html = converter.makeHtml(readme).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  // Replace Demo MD with table / or bullet three values
  // 1. Live Site
  // 2. Online IDE (Stackblitz) / Stackblitz/Codepen
  // 3. Source code[packages/${name}/src/dev]

  const packageList = JSON.stringify([
    {
      name: globalState.packageName[name]!.name,
      gzipped: globalState.packageName[name]!.size.gzipped.string,
      minified: globalState.packageName[name]!.size.minified.string,
    },
  ]);
  const primitiveList = JSON.stringify(
    Object.entries(globalState.primitives)
      .filter(([key, value]) => {
        return value.packageName === name;
      })
      .map(([key, value]) => {
        return {
          name: key,
          gzipped: value.size.gzipped.string,
          minified: value.size.minified.string,
        };
      }),
  );

  const pathToSitePrimitivesRoute = r(`../site/src/routes/${routeName}/${name}.tsx`);
  const pageStr = `
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CodePrimitive from "~/components/Primitives/CodePrimitive";
import CopyPackages from "~/components/CopyPackage/CopyPackages";
import { NoHydration } from "solid-js/web";

${outputString}

export default function Index () {
  return (
    <PrimitivePageMain packageName="${pkg.name}" name="${name}" stage={${pkg.primitive.stage}} packageList={${packageList}} primitiveList={${primitiveList}}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}
`;

  items.push({ path: pathToSitePrimitivesRoute, pageStr });
};

export const writePages = () => {
  const pathToSitePrimitivesRouteDir = r(`../site/src/routes/${routeName}`);
  if (!existsSync(pathToSitePrimitivesRouteDir)) {
    mkdirSync(pathToSitePrimitivesRouteDir);
  }
  items.forEach(({ path, pageStr }) => {
    writeFile(path, pageStr, err => {
      if (err) console.log(err);
    });
  });
};
