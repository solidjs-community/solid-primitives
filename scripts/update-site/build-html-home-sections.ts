import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { existsSync, mkdirSync, readFileSync, writeFile } from "fs";
import { r } from "../utils";

// build sections by getting main README.md and CONTRIBUTING.md and grab

// 1. Philosophy
// 2.? Contribution Process
// 3. Design Maxims
// 4. Basic and Compound Primitives
// 5. Managing Primitive Complexity

export const buildAndWriteHomeSections = async () => {
  const dirReadMeMD = r(`../README.md`);
  const dirContributingMD = r(`../CONTRIBUTING.md`);
  const contributingMD = readFileSync(dirContributingMD, "utf-8");
  const readMeMD = readFileSync(dirReadMeMD, "utf-8");
  const fileName = "HomeSections";
  const filePath = r(`../site/src/_generated/Home/${fileName}.tsx`);
  const readMeH2List = ["Philosophy"];
  const contributingH2List = [
    "Design Maxims",
    "Basic and Compound Primitives",
    "Managing Primitive Complexity",
  ];
  let sections = "";

  const matchHeadingRegex = (heading: string) =>
    new RegExp(`(?<!#)(##\\s+${heading}\\n)((.|\\n)+?)(?=(\\n##\\s))`);

  readMeH2List.forEach(heading => {
    const regex = matchHeadingRegex(heading);
    const match = readMeMD.match(regex);

    if (!match) return;

    sections += `${match[0]}\n`;
  });
  contributingH2List.forEach(heading => {
    const regex = matchHeadingRegex(heading);
    const match = contributingMD.match(regex);

    if (!match) return;

    sections += `${match[0]}\n`;
  });

  sections = "## Contribution Process\n\n <StageContent/>\n\n" + sections;

  const output = await compile(sections, {
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
  output;
  let outputString = output.toString();
  outputString = outputString
    .replace("export default MDXContent;", "")
    .replace(/,\s+\{[^\}]+\}\s+=\s+_components;?/, ";");

  const result = `
// Do not modify
// Generated from "./scripts/update-site/build-html-home-sections"
import { StageContent } from "~/components/Stage/Stage"

${outputString}

export default function ${fileName} () {
  return (
    <div class="prose">
      <MDXContent/>
    </div>
  )
}
`;

  const homeDir = r(`../site/src/_generated/Home`);
  if (!existsSync(homeDir)) {
    mkdirSync(homeDir);
  }
  writeFile(filePath, result, err => {
    if (err) console.log(err);
  });
};
