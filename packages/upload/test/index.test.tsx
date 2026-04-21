import { describe, it, expect, vi, beforeAll } from "vitest";
import { createRoot } from "solid-js";
import { createFileUploader, createDropzone, fileUploader } from "../src/index.js";
import { transformFiles } from "../src/helpers.js";
import type { UploadFile } from "../src/types.js";

// ── jsdom polyfills ───────────────────────────────────────────────────────────

beforeAll(() => {
  // jsdom does not implement createObjectURL
  vi.stubGlobal("URL", { createObjectURL: (f: File) => `blob:${f.name}` });
});

// Creates a minimal FileList-alike without DataTransfer (not in jsdom)
function makeFileList(...files: File[]): FileList {
  const fl: Record<string, unknown> = {};
  files.forEach((f, i) => (fl[i] = f));
  fl.length = files.length;
  return fl as unknown as FileList;
}

function makeFile(name = "test.png", size = 64, type = "image/png"): File {
  return new File(["x".repeat(size)], name, { type });
}

// ── transformFiles ────────────────────────────────────────────────────────────

describe("transformFiles", () => {
  it("returns empty array for null input", () => {
    expect(transformFiles(null)).toEqual([]);
  });

  it("converts a FileList to UploadFile array", () => {
    const file = makeFile("hello.png", 512);
    const result = transformFiles(makeFileList(file));
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("hello.png");
    expect(result[0]!.size).toBe(512);
    expect(result[0]!.file).toBe(file);
    expect(typeof result[0]!.source).toBe("string");
  });

  it("converts multiple files", () => {
    const result = transformFiles(makeFileList(makeFile("a.png"), makeFile("b.jpg")));
    expect(result).toHaveLength(2);
    expect(result.map(f => f.name)).toEqual(["a.png", "b.jpg"]);
  });
});

// ── createFileUploader ────────────────────────────────────────────────────────

describe("createFileUploader", () => {
  it("initialises with empty file list", () => {
    const { files, dispose } = createRoot(dispose => ({
      ...createFileUploader(),
      dispose,
    }));
    expect(files()).toEqual([]);
    dispose();
  });

  it("initialises with empty file list (multiple mode)", () => {
    const { files, dispose } = createRoot(dispose => ({
      ...createFileUploader({ multiple: true }),
      dispose,
    }));
    expect(files()).toEqual([]);
    dispose();
  });

  it("removeFile filters by name", () => {
    // In Solid 2.0, signal writes must occur outside owned scopes.
    // We pull the API out of createRoot, then call it at the test level.
    const { files, removeFile, dispose } = createRoot(dispose => ({
      ...createFileUploader(),
      dispose,
    }));
    expect(files()).toEqual([]);
    removeFile("nonexistent.png"); // no-op, should not throw
    expect(files()).toEqual([]);
    dispose();
  });

  it("clearFiles empties the list", () => {
    const { files, clearFiles, dispose } = createRoot(dispose => ({
      ...createFileUploader(),
      dispose,
    }));
    clearFiles();
    expect(files()).toEqual([]);
    dispose();
  });

  it("selectFiles triggers a file input click", () => {
    const { selectFiles, dispose } = createRoot(dispose => ({
      ...createFileUploader(),
      dispose,
    }));

    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === "input") vi.spyOn(el as HTMLInputElement, "click").mockImplementation(clickSpy);
      return el;
    });

    selectFiles(() => {});
    expect(clickSpy).toHaveBeenCalledOnce();

    vi.restoreAllMocks();
    dispose();
  });
});

// ── createDropzone ────────────────────────────────────────────────────────────

describe("createDropzone", () => {
  it("initialises with empty files and isDragging=false", () => {
    const { files, isDragging, dispose } = createRoot(dispose => ({
      ...createDropzone(),
      dispose,
    }));
    expect(files()).toEqual([]);
    expect(isDragging()).toBe(false);
    dispose();
  });

  it("exposes setRef, removeFile, clearFiles", () => {
    const { setRef, removeFile, clearFiles, dispose } = createRoot(dispose => ({
      ...createDropzone(),
      dispose,
    }));
    expect(typeof setRef).toBe("function");
    expect(typeof removeFile).toBe("function");
    expect(typeof clearFiles).toBe("function");
    dispose();
  });

  it("clearFiles empties the list", () => {
    const { files, clearFiles, dispose } = createRoot(dispose => ({
      ...createDropzone(),
      dispose,
    }));
    clearFiles();
    expect(files()).toEqual([]);
    dispose();
  });

  it("accepts DropzoneOptions callbacks without throwing", () => {
    expect(() => {
      const dispose = createRoot(dispose => {
        createDropzone({
          onDrop: vi.fn(),
          onDragStart: vi.fn(),
          onDragEnter: vi.fn(),
          onDragEnd: vi.fn(),
          onDragLeave: vi.fn(),
          onDragOver: vi.fn(),
          onDrag: vi.fn(),
        });
        return dispose;
      });
      dispose();
    }).not.toThrow();
  });
});

// ── fileUploader ref callback ─────────────────────────────────────────────────

describe("fileUploader", () => {
  it("returns a function (ref callback)", () => {
    const ref = createRoot(dispose => {
      const r = fileUploader({ userCallback: vi.fn(), setFiles: vi.fn() });
      dispose();
      return r;
    });
    expect(typeof ref).toBe("function");
  });

  it("attaches a change listener to the element", () => {
    const input = document.createElement("input");
    input.type = "file";
    const addSpy = vi.spyOn(input, "addEventListener");

    const ref = createRoot(dispose => {
      const r = fileUploader({ userCallback: vi.fn(), setFiles: vi.fn() });
      dispose();
      return r;
    });

    ref(input);
    expect(addSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("calls setFiles and userCallback on change event", async () => {
    const input = document.createElement("input");
    input.type = "file";
    const setFiles = vi.fn();
    const userCallback = vi.fn();

    const ref = createRoot(dispose => {
      const r = fileUploader({ userCallback, setFiles });
      dispose();
      return r;
    });

    ref(input);

    const file = makeFile("upload.png");
    Object.defineProperty(input, "files", { value: makeFileList(file), configurable: true });

    const event = new Event("change");
    Object.defineProperty(event, "currentTarget", { value: input, configurable: true });
    input.dispatchEvent(event);

    await Promise.resolve();

    expect(setFiles).toHaveBeenCalledOnce();
    const uploaded: UploadFile[] = setFiles.mock.calls[0]![0];
    expect(uploaded).toHaveLength(1);
    expect(uploaded[0]!.name).toBe("upload.png");
    expect(userCallback).toHaveBeenCalledOnce();
  });
});
