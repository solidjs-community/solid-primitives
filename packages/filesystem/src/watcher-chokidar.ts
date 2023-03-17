import { Operation, Watcher } from "./types"

export const makeChokidarWatcher = (basePath: string = "/"): Watcher => {
  let subscriber: ((operation: Operation, path: string) => void) | undefined;

  import("chokidar").then(chokidar =>
    chokidar.watch(
      `${basePath}${basePath.endsWith("/") ? "": "/"}**/*`,
      { persistent: true }
    )
      .on("change", (path: string) => subscriber?.("writeFile", path))
      .on("add", (path: string) => subscriber?.("writeFile", path))
      .on("addDir", (path: string) => subscriber?.("mkdir", path))
      .on("unlink", (path: string) => subscriber?.("rm", path))
      .on("unlinkDir", (path: string) => subscriber?.("rm", path))
  // eslint-disable-next-line no-console
  ).catch(e => console.warn(e));

  return (fn) => { subscriber = fn; }
}
