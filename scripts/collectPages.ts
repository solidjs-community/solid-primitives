import { cp, mkdir, readdir, stat } from "fs/promises"
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
  await Promise.all((await readdir(r("../packages"))).map(async (pkg) => {
    if (await isDir(r(`../packages/${pkg}/dev/dist`))) {
      await cp(
        r(`../packages/${pkg}/dev/dist`),
        r(`../pages/${pkg}`),
        { recursive: true, force: true }
      );
    }
  }));
}

initDir().then(copyPage).catch(console.error);
