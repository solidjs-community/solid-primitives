export const getParentDir = (path: string) => path.split("/").slice(0, -1).join("/") || "/";

export const getItemName = (path: string) => path.split("/").at(-1);

export const limitPath =
  (basePath: string) =>
  (path: string): string => {
    const parts = (basePath + "/" + path).split("/").filter(part => !!part);
    let nextDots: number;
    while ((nextDots = parts.indexOf("..")) > -1) {
      if (nextDots === 0) {
        throw new Error(`cannot go below root path: ${path}`);
      }
      parts.splice(nextDots - 1, 2);
    }
    const result = (basePath.startsWith("/") ? "/" : "") + parts.join("/");
    if (!result.startsWith(basePath)) {
      throw new Error(`cannot go below base path: ${path}`);
    }
    return result;
  };
