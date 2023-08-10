import { describe, test, expect, vi } from "vitest";
import "./fsaccess-mock";
import {
  createFileSystem,
  makeNoFileSystem,
  makeNoAsyncFileSystem,
  makeVirtualFileSystem,
  makeNodeFileSystem,
  FileSystemAdapter,
  makeWebAccessFileSystem,
  makeTauriFileSystem,
  rsync,
} from "../src/index.js";
import { createEffect, createRoot } from "solid-js";

describe("makeNoFileSystem", () => {
  const fs = makeNoFileSystem();
  test("fs.getType returns null", () => expect(fs.getType("/any/file")).toBeNull());
  test("fs.readDir returns an empty array", () => expect(fs.readdir("/")).toEqual([]));
  test("fs.mkdir returns void", () => expect(fs.mkdir("test")).toBeUndefined());
  test("fs.readFile returns an empty string", () => expect(fs.readFile("test")).toBe(""));
  test("fs.writeFile returns void", () => expect(fs.writeFile("test", "data")).toBeUndefined());
  test("fs.rm returns void", () => expect(fs.rm("test")).toBeUndefined());
});

describe("makeNoAsyncFileSystem", () => {
  const fs = makeNoAsyncFileSystem();
  test("fs.getType returns null", async () => expect(await fs.getType("/any/file")).toBeNull());
  test("fs.readDir returns an empty array", async () => expect(await fs.readdir("/")).toEqual([]));
  test("fs.mkdir returns void", async () => expect(await fs.mkdir("test")).toBeUndefined());
  test("fs.readFile returns an empty string", async () =>
    expect(await fs.readFile("test")).toBe(""));
  test("fs.writeFile returns void", async () =>
    expect(await fs.writeFile("test", "data")).toBeUndefined());
  test("fs.rm returns void", async () => expect(await fs.rm("test")).toBeUndefined());
});

describe("makeVirtualFileSystem", () => {
  const fs = makeVirtualFileSystem({ src: { "test.ts": "// test" } });
  test("fs.getType returns correct type", () => {
    expect(fs.getType("src")).toBe("dir");
    expect(fs.getType("src/test.ts")).toBe("file");
    expect(fs.getType("unknown")).toBeNull();
  });
  test("fs.readDir returns directory listing", () =>
    expect(fs.readdir("src")).toEqual(["test.ts"]));
  test("fs.mkdir creates a new directory", () => {
    expect(fs.getType("test")).toBeNull();
    fs.mkdir("test");
    expect(fs.getType("test")).toBe("dir");
  });
  test("fs.readFile returns file content", () =>
    expect(fs.readFile("src/test.ts")).toBe("// test"));
  test("fs.writeFile creates and overwrites file", () => {
    expect(fs.readdir("src")).toHaveLength(1);
    fs.writeFile("src/test2.ts", "// data");
    expect(fs.readdir("src")).toHaveLength(2);
    expect(fs.readFile("src/test2.ts")).toBe("// data");
    fs.writeFile("src/test2.ts", "// overwritten");
    expect(fs.readFile("src/test2.ts")).toBe("// overwritten");
  });
  test("fs.rm recursively removes files and directories", () => {
    fs.mkdir("dir/subdir/subsubdir");
    fs.writeFile("dir/subdir/subsubdir/file.txt", "x");
    expect(fs.getType("dir/subdir/subsubdir")).toBe("dir");
    expect(fs.getType("dir/subdir/subsubdir/file.txt")).toBe("file");
    fs.rm("dir");
    expect(fs.getType("dir")).toBeNull();
  });
  test("fs.toMap returns a Map-like object", () => {
    const map = fs.toMap();
    expect(map.get("/src/test.ts")).toBe("// test");
    map.set("/map-test/data.json", "{}");
    expect(fs.readFile("map-test/data.json")).toBe("{}");
    map.delete("/map-test/data.json");
    expect(fs.getType("map-test/data.json")).toBeNull();
    const newFsMap = makeVirtualFileSystem({ src: { test: { "data.json": "{}" } } }).toMap();
    expect([...newFsMap.keys()]).toEqual(["/src/test/data.json"]);
  });
});

const instrumentFs = (fs: FileSystemAdapter) =>
  Object.keys(fs).forEach(
    fn => typeof fs[fn as keyof typeof fs] === "function" && vi.spyOn(fs, fn as any),
  );

describe("createFileSystem (sync) calls the underlying fs", () => {
  const nfs = makeNoFileSystem();
  instrumentFs(nfs);
  const fs = createFileSystem(nfs);
  test("fs.getType", () => {
    fs.getType("test");
    expect(nfs.getType).toHaveBeenCalled();
  });
  test("fs.readdir", () => {
    fs.readdir("src");
    expect(nfs.readdir).toHaveBeenCalled();
  });
  test("fs.mkdir", () => {
    fs.mkdir("test");
    expect(nfs.mkdir).toHaveBeenCalled();
  });
  test("fs.readFile", () => {
    fs.readFile("src/index.ts");
    expect(nfs.readFile).toHaveBeenCalled();
  });
  test("fs.writeFile", () => {
    fs.writeFile("src/test.ts", "");
    expect(nfs.writeFile).toHaveBeenCalled();
  });
  test("fs.rm", () => {
    fs.rm("src");
    expect(nfs.rm).toHaveBeenCalled();
  });
});

describe("createFileSystem (async) calls the underlying fs", () => {
  const afs = makeNoAsyncFileSystem();
  instrumentFs(afs);
  const fs = createFileSystem(afs);
  test("fs.getType", () => {
    fs.getType("test");
    expect(afs.getType).toHaveBeenCalled();
  });
  test("fs.readdir", () => {
    fs.readdir("src");
    expect(afs.readdir).toHaveBeenCalled();
  });
  test("fs.mkdir", () => {
    fs.mkdir("test");
    expect(afs.mkdir).toHaveBeenCalled();
  });
  test("fs.readFile", () => {
    fs.readFile("src/index.ts");
    expect(afs.readFile).toHaveBeenCalled();
  });
  test("fs.writeFile", () => {
    fs.writeFile("src/test.ts", "");
    expect(afs.writeFile).toHaveBeenCalled();
  });
  test("fs.rm", () => {
    fs.rm("src");
    expect(afs.rm).toHaveBeenCalled();
  });
});

describe("createFileSystem(makeWebAccessFileSystem)", async () => {
  const wfs = await makeWebAccessFileSystem();
  if (wfs === null) {
    throw new Error("web fs access mock broke for some reason, see fsaccess-mock.fs");
  }

  const fs = createFileSystem(wfs);

  test("fs.getType returns the correct output", async () => {
    let resolve: (() => void) | undefined;
    let captured: unknown;

    let dispose = createRoot(dispose => {
      createEffect(() => {
        captured = fs.getType("/src/index.ts");
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual(undefined);

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual("file");

    dispose();

    dispose = createRoot(dispose => {
      createEffect(() => {
        captured = fs.getType("/src");
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual(undefined);

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual("dir");

    dispose();
  });

  test("fs.readdir returns the correct output", async () => {
    let resolve: (() => void) | undefined;
    let captured: unknown;

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured = fs.readdir("src");
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual(undefined);

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual(["index.ts"]);

    dispose();
  });

  test("fs.mkdir updates existing readdir", async () => {
    let resolve: (() => void) | undefined;
    const captured: unknown[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured.push(fs.readdir("/"));
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual([undefined]);
    captured.length = 0;

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["src", "data"]]);
    captured.length = 0;

    fs.mkdir("/test");
    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["src", "data", "test"]]);

    dispose();
  });

  test("fs.readFile returns the content", async () => {
    let resolve: (() => void) | undefined;
    const captured: unknown[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured.push(fs.readFile("/src/index.ts"));
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual([undefined]);
    captured.length = 0;

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual(["// test"]);
    captured.length = 0;

    dispose();
  });

  test("fs.writeFile updates a readFile resource", async () => {
    let resolve: (() => void) | undefined;
    const captured: unknown[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured.push(fs.readFile("/data/data.json"));
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual([undefined]);
    captured.length = 0;

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual(["[1, 2, 3]"]);
    captured.length = 0;

    fs.writeFile("/data/data.json", "[1, 2, 3, 4]");
    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual(["[1, 2, 3, 4]"]);

    dispose();
  });

  test("fs.rm udpates a readdir resource", async () => {
    await fs.mkdir("/src/subdir");

    let resolve: (() => void) | undefined;
    const captured: unknown[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured.push(fs.readdir("/src"));
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual([undefined]);
    captured.length = 0;

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["index.ts", "subdir"]]);
    captured.length = 0;

    fs.rm("/src/subdir");
    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["index.ts"]]);

    dispose();
  });

  test("fs.rename updates a readdir resource", async () => {
    await fs.mkdir("/data/subdir");
    await fs.writeFile("/data/subdir/test.ts", "// test");

    let resolve: (() => void) | undefined;
    const captured: unknown[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        captured.push(fs.readdir("/data/subdir"));
        resolve?.();
      });

      return dispose;
    });

    expect(captured).toEqual([undefined]);
    captured.length = 0;

    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["test.ts"]]);
    captured.length = 0;

    fs.rename("/data/subdir/test.ts", "/data/subdir/index.ts");
    await new Promise<void>(r => (resolve = r));
    expect(captured).toEqual([["index.ts"]]);

    fs.rm("/data/subdir");
    dispose();
  });

  describe("fallbacks", () => {
    test("makeNodeFileSystem returns null on client", async () => {
      expect(await makeNodeFileSystem()).toBeNull();
    });

    test("makeTauriFileSystem returns null on client", () => {
      expect(makeTauriFileSystem()).toBeNull();
    });
  });
});

describe("rsync", () => {
  test("it copies parts of a file system using the adapter", async () => {
    const sourceobj = {
      test: {
        "file.json": "[1, 2, 3]",
        "file.ts": "console.log(1);",
        folder: { folder2: { folder3: { "test.txt": "test" } } },
      },
    };
    const destobj = {};
    const sourcevfs = makeVirtualFileSystem(sourceobj);
    const destvfs = makeVirtualFileSystem(destobj);
    await rsync(sourcevfs, "/", destvfs, "/");
    expect(destobj).toEqual(sourceobj);
  });

  test("it copies from a file system adapter to a file system", async () => {
    const sourceobj = {
      test: {
        "file.json": "[1, 2, 3]",
        "file.ts": "console.log(1);",
        folder: { folder2: { folder3: { "test.txt": "test" } } },
      },
    };
    const destobj = {};
    const sourcevfs = makeVirtualFileSystem(sourceobj);
    const destvfs = makeVirtualFileSystem(destobj);
    const destfs = createFileSystem(destvfs);
    await rsync(sourcevfs, "/", destfs, "/");
    expect(destobj).toEqual(sourceobj);
  });

  test("it copies from a file system to a file system adapter", async () => {
    const sourceobj = {
      test: {
        "file.json": "[1, 2, 3]",
        "file.ts": "console.log(1);",
        folder: { folder2: { folder3: { "test.txt": "test" } } },
      },
    };
    const destobj = {};
    const sourcevfs = makeVirtualFileSystem(sourceobj);
    const sourcefs = createFileSystem(sourcevfs);
    const destvfs = makeVirtualFileSystem(destobj);
    await rsync(sourcefs, "/", destvfs, "/");
    expect(destobj).toEqual(sourceobj);
  });

  test("it copies from a file system to a file system", async () => {
    const sourceobj = {
      test: {
        "file.json": "[1, 2, 3]",
        "file.ts": "console.log(1);",
        folder: { folder2: { folder3: { "test.txt": "test" } } },
      },
    };
    const destobj = {};
    const sourcevfs = makeVirtualFileSystem(sourceobj);
    const sourcefs = createFileSystem(sourcevfs);
    const destvfs = makeVirtualFileSystem(destobj);
    const destfs = createFileSystem(destvfs);
    await rsync(sourcefs, "/", destfs, "/");
    expect(destobj).toEqual(sourceobj);
  });
});
