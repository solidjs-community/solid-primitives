import { describe, test, expect, vi } from "vitest";
import "./fsaccess-mock";
import {
  createFileSystem,
  makeNoFileSystem,
  makeNoAsyncFileSystem,
  makeVirtualFileSystem,
  FileSystemAdapter,
  makeWebAccessFileSystem,
} from "../src";
import { createEffect, createRoot, onError } from "solid-js";

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

const testReactive = (testcase: (done: () => void) => void): Promise<void> => {
  const context: {
    promise?: Promise<void>;
    done?: () => void;
    fail?: (error: any) => void;
    dispose?: () => void;
  } = {};
  context.promise = new Promise<void>((resolve, reject) => {
    context.done = resolve;
    context.fail = reject;
  });
  context.dispose = createRoot(dispose => {
    onError(err => context.fail?.(err));
    testcase(() => {
      context.done?.();
      dispose();
    });
    return dispose;
  });
  return context.promise;
};

describe("createFileSystem(makeWebAccessFileSystem)", async () => {
  const wfs = await makeWebAccessFileSystem();
  const fs = createFileSystem(wfs);
  test("fs.getType returns the correct output", async () => {
    await testReactive(done => {
      createEffect((run: number = 0) => {
        const fileType = fs.getType("/src/index.ts");
        if (run === 0) {
          expect(fileType).toBeUndefined();
        } else {
          expect(fileType).toBe("file");
          done();
        }
        return run + 1;
      });
    });
    await testReactive(done => {
      createEffect((run: number = 0) => {
        const dirType = fs.getType("/src");
        if (run === 0) {
          expect(dirType).toBeUndefined();
        } else {
          expect(dirType).toBe("dir");
          done();
        }
        return run + 1;
      });
    });
  });

  test("fs.readdir returns the correct output", () =>
    testReactive(done => {
      createEffect((run: number = 0) => {
        const srcFiles = fs.readdir("src");
        if (run === 0) {
          expect(srcFiles).toBeUndefined();
        } else {
          expect(srcFiles).toEqual(["index.ts"]);
          done();
        }
        return run + 1;
      });
    }));

  test("fs.mkdir updates existing readdir", () =>
    testReactive(done => {
      createEffect((run: number = 0) => {
        const rootItems = fs.readdir("/");
        if (run === 0) {
          expect(rootItems).toBeUndefined();
        } else if (run === 1) {
          expect(rootItems).toEqual(["src", "data"]);
          fs.mkdir("/test");
        } else {
          expect(rootItems).toEqual(["src", "data", "test"]);
          done();
        }
        return run + 1;
      });
    }));

  test("fs.readFile returns the content", () =>
    testReactive(done => {
      createEffect((run: number = 0) => {
        const fileData = fs.readFile("/src/index.ts");
        if (run === 0) {
          expect(fileData).toBeUndefined();
        } else {
          expect(fileData).toBe("// test");
          done();
        }
        return run + 1;
      });
    }));

  test("fs.writeFile updates a readFile resource", () =>
    testReactive(done => {
      createEffect((run: number = 0) => {
        const fileData = fs.readFile("/data/data.json");
        if (run === 0) {
          expect(fileData).toBeUndefined();
        } else if (run === 1) {
          expect(fileData).toBe("[1, 2, 3]");
          fs.writeFile("/data/data.json", "[1, 2, 3, 4]");
        } else {
          expect(fileData).toBe("[1, 2, 3, 4]");
          done();
        }
        return run + 1;
      });
    }));

  test("fs.rm udpates a readdir resource", async () => {
    await fs.mkdir("/src/subdir");
    return testReactive(done => {
      createEffect((run: number = 0) => {
        const dataItems = fs.readdir("/src");
        if (run === 0) {
          expect(dataItems).toBeUndefined();
        } else if (run === 1) {
          expect(dataItems).toEqual(["index.ts", "subdir"]);
          fs.rm("/src/subdir");
        } else {
          expect(dataItems).toEqual(["index.ts"]);
          done();
        }
        return run + 1;
      });
    });
  });

  test("fs.rename updates a readdir resource", async () => {
    await fs.mkdir("/data/subdir");
    await fs.writeFile("/data/subdir/test.ts", "// test");
    return testReactive(done => {
      createEffect((run: number = 0) => {
        const subdirItems = fs.readdir("/data/subdir");
        if (run === 0) {
          expect(subdirItems).toBeUndefined();
        } else if (run === 1) {
          expect(subdirItems).toEqual(["test.ts"]);
          fs.rename("/data/subdir/test.ts", "/data/subdir/index.ts");
        } else {
          expect(subdirItems).toEqual(["index.ts"]);
          fs.rm("/data/subdir");
          done();
        }
        return run + 1;
      });
    });
  });
});
