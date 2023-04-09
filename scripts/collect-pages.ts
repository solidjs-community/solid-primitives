import { cp, mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import { ROOT_DIR, PACKAGES_DIR } from "./utils";

const pagesPath = path.resolve(ROOT_DIR, "pages");

const isDir = async (dir: string) => {
  try {
    return (await stat(path.resolve(dir))).isDirectory();
  } catch (e) {
    return false;
  }
};

const initDir = async () => {
  if (!(await isDir(pagesPath))) {
    await mkdir(pagesPath);
  }
};

const copyPage = async () => {
  const pages: string[] = [];
  await Promise.all(
    (
      await readdir(PACKAGES_DIR)
    ).map(async pkg => {
      const pkgPath = path.resolve(PACKAGES_DIR, pkg, `dev/dist`);
      if (await isDir(pkgPath)) {
        await cp(pkgPath, path.resolve(pagesPath, pkg), {
          recursive: true,
          force: true,
        });
        pages.push(pkg);
      }
    }),
  );
  return pages;
};

const writeIndex = async (pages: string[]) => {
  await writeFile(
    path.resolve(pagesPath, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Available demos</title>
    <style>
      html { margin: 0; padding: 0; }
      body { font: 1.25em sans-serif; }
    </style>
  </head>
  <body>
    <h1>Available demos</h1>
    <ul>
      ${pages
        .sort()
        .map(page => `<li><a href="${page}">${page}</a></li>`)
        .join("\n      ")}
    </ul>
  </body>
</html>
`,
    "utf-8",
  );
};

initDir().then(copyPage).then(writeIndex).catch(console.error);
