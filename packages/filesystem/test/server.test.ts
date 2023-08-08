import "./tauri-mock";
import { describe, test, expect, afterAll } from "vitest";
import {
  limitPath,
  makeNodeFileSystem,
  makeTauriFileSystem,
  makeWebAccessFileSystem,
} from "../src/index.js";
import { mkdtemp, rm } from "fs/promises";

describe("limitPath", () => {
  test("handle empty base path and root path correctly", () => {
    expect(limitPath("")("/test")).toBe("test");
    expect(limitPath("/")("/test")).toBe("/test");
  });

  test("add base path", () => {
    expect(limitPath("/package/")("/test")).toBe("/package/test");
  });

  test("throws error if path is not starting with root path", () => {
    expect(limitPath("/root/")("../root/extra")).toBe("/root/extra");
    expect(() => limitPath("/root/")("../other/path")).toThrow(
      "cannot go below base path: ../other/path",
    );
  });

  test("throws error when going below root", () => {
    expect(() => limitPath("/root/")("../../..")).toThrow("cannot go below root path: ../../..");
  });
});

describe("makeNodeFileSystem", async () => {
  const tmpDir = await mkdtemp("solid-primitives-fs-tests-");
  const fs = await makeNodeFileSystem(tmpDir);
  if (fs === null) throw new Error("makeNodeFileSystem should not return null");
  afterAll(() => rm(tmpDir, { recursive: true }));

  test("creates/reads a directory", async () => {
    await fs.mkdir("dirtest");
    await fs.mkdir("dirtest/test");
    expect(await fs.readdir("/dirtest")).toEqual(["test"]);
    await fs.rm("dirtest");
  });
  test("creates/reads a file", async () => {
    await fs.mkdir("filetest");
    await fs.writeFile("filetest/test", "data");
    expect(await fs.readFile("filetest/test")).toBe("data");
    await fs.rm("filetest");
  });
  test("renames a file", async () => {
    await fs.mkdir("renametest");
    await fs.writeFile("renametest/test", "data");
    expect(await fs.readdir("renametest")).toEqual(["test"]);
    await fs.rename("renametest/test", "renametest/test2");
    expect(await fs.readdir("renametest")).toEqual(["test2"]);
    expect(await fs.readFile("renametest/test2")).toBe("data");
  });
  test("gets the type of file/dir/non-existent", async () => {
    await fs.mkdir("typetest/dir");
    await fs.writeFile("typetest/file", "file");
    expect(await fs.getType("typetest/file")).toBe("file");
    expect(await fs.getType("typetest/dir")).toBe("dir");
    expect(await fs.getType("typetest/null")).toBeNull();
    await fs.rm("typetest");
  });
});

describe.todo("makeTauriFileSystem", () => {
  const fs = makeTauriFileSystem();
  if (fs === null) throw new Error("makeTauriFileSystem should not return null");

  test("creates/reads a directory", async () => {
    await fs.mkdir("dirtest");
    await fs.mkdir("dirtest/test");
    expect(await fs.readdir("/dirtest")).toEqual(["test"]);
    await fs.rm("dirtest");
  });
  test("creates/reads a file", async () => {
    await fs.mkdir("filetest");
    await fs.writeFile("filetest/test", "data");
    expect(await fs.readFile("filetest/test")).toBe("data");
    await fs.rm("filetest");
  });
  test("renames a file", async () => {
    await fs.mkdir("renametest");
    await fs.writeFile("renametest/test", "data");
    expect(await fs.readdir("renametest")).toEqual(["test"]);
    await fs.rename("renametest/test", "renametest/test2");
    expect(await fs.readdir("renametest")).toEqual(["test2"]);
    expect(await fs.readFile("renametest/test2")).toBe("data");
  });
  test("gets the type of file/dir/non-existent", async () => {
    await fs.mkdir("typetest/dir");
    await fs.writeFile("typetest/file", "file");
    expect(await fs.getType("typetest/file")).toBe("file");
    expect(await fs.getType("typetest/dir")).toBe("dir");
    expect(await fs.getType("typetest/null")).toBeNull();
    await fs.rm("typetest");
  });
});

describe("fallbacks", () => {
  test("makeWebAccessFileSystem returns Promise<null>", async () => {
    expect(await makeWebAccessFileSystem()).toBeNull();
  });
});
