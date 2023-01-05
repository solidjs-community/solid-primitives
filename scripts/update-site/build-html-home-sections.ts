import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { readFileSync, writeFile } from "fs";
import { r } from "../utils";

// build sections by getting main README.md and grab

// 1. Philosophy
// 2.? Contribution Process
// 3. Design Maxims
// 4. Basic and Compound Primitives
// 5. Managing Primitive Complexity

export const buildAndWriteHomeSections = async () => {
  // const { list, category, stage } = pkg.primitive;

  const dir = r(`../README.md`);
  const rootReadme = readFileSync(dir, "utf-8");
  const fileName = "HomeSections";
  const filePath = r(`../site/src/components/Home/${fileName}.tsx`);
  const heading2List = [
    "Philosophy",
    // "Contribution Process",
    "Design Maxims",
    "Basic and Compound Primitives",
    "Managing Primitive Complexity"
  ];
  let sections = "";

  heading2List.forEach(heading => {
    const regex = RegExp(`(?<!#)(##\\s+${heading}\\n)((.|\\n)+?)(?=(\\n##\\s))`);
    const match = rootReadme.match(regex);

    if (!match) return;

    sections += `${match[0]}\n`;
  });

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
          content: { type: "text", value: "#" }
        }
      ]
    ]
    // outputFormat: "function-body"
  });
  let outputString = output.toString();
  outputString = outputString.replace("export default MDXContent;", "");

  const result = `
// Do not modify
// Generated from "./scripts/update-site/build-html-home-sections"

${outputString}

export default function ${fileName} () {
  return (
    <div class="prose">
      <MDXContent/>
    </div>
  )
}
`;

  writeFile(filePath, result, err => {
    if (err) console.log(err);
  });
};
