import { cp, mkdir, readdir, stat, writeFile } from "fs/promises"
import { r } from "./utils";

const isDir = async (dir: string) => {
  try {
    return (await stat(r(dir))).isDirectory();
  } catch (e) {
    return false;
  }
};

const initDir = async () => {
  if (!(await isDir('../pages'))) {
    await mkdir("../pages")
  }
}

const copyPage = async () => {
  const pages: string[] = [];
  await Promise.all((await readdir(r("../packages"))).map(async (pkg) => {
    if (await isDir(r(`../packages/${pkg}/dev/dist`))) {
      await cp(
        r(`../packages/${pkg}/dev/dist`),
        r(`../pages/${pkg}`),
        { recursive: true, force: true }
      );
      pages.push(pkg);
    }
  }));
  return pages;
}

const writeIndex = async (pages: string[]) => {
  await writeFile(r('../pages/index.html'), `<!DOCTYPE html>
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
      ${pages.sort().map(page => `<li><a href="${page}">${page}</a></li>`).join('\n      ')}
    </ul>
  </body>
</html>
`, 'utf-8');
}

initDir().then(copyPage).then(writeIndex).catch(console.error);
