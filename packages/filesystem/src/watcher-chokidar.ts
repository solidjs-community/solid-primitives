import type { Operation, Watcher } from "./types.js";

export const makeChokidarWatcher = (basePath: string = "/"): Watcher => {
  let subscriber: ((operation: Operation, path: string) => void) | undefined;

  import("chokidar")
    .then(chokidar =>
      chokidar
        .watch(`${basePath}${basePath.endsWith("/") ? "" : "/"}**/*`, { persistent: true })
        .on("change", path => subscriber?.("writeFile", path))
        .on("add", path => subscriber?.("writeFile", path))
        .on("addDir", path => subscriber?.("mkdir", path))
        .on("unlink", path => subscriber?.("rm", path))
        .on("unlinkDir", path => subscriber?.("rm", path)),
    )
    // eslint-disable-next-line no-console
    .catch(e => console.warn(e));

  return fn => {
    subscriber = fn;
  };
};
