import { ObjectFileSystem } from "../src";

export class FileSystemHandle {
  get kind(): "file" | "directory" {
    return this._kind;
  }
  constructor(
    private _kind: "file" | "directory",
    public name: string,
  ) {}
  isSameEntry(entry: FileSystemHandle) {
    return entry == this;
  }
}

export class FileSystemFileHandle extends FileSystemHandle {
  constructor(
    public name: string,
    private data: string,
  ) {
    super("file", name);
  }
  createWritable() {
    const file = this;
    let content = "";
    const writable = {
      write: (data: string) => {
        content += data;
        return Promise.resolve();
      },
      close: () => {
        file.data = content;
        return Promise.resolve();
      },
    };
    return Promise.resolve(writable);
  }
  getFile() {
    const file = this;
    return new Promise(resolve => setTimeout(() => resolve({ text: () => file.data }), 20));
  }
}

export class FileSystemDirectoryHandle extends FileSystemHandle {
  constructor(
    public name: string,
    private contents: [string, FileSystemFileHandle | FileSystemDirectoryHandle][],
  ) {
    super("directory", name);
  }
  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    const directory = this.contents.find(item => item[0] === name);
    if (directory?.[1].kind === "file") {
      throw new Error("TypeMismatchError");
    }
    if (directory) {
      return Promise.resolve(directory[1] as FileSystemDirectoryHandle);
    }
    if (!options?.create) {
      throw new Error("NotFoundError");
    }
    const newDir = new FileSystemDirectoryHandle(name, []);
    this.contents.push([name, newDir]);
    return Promise.resolve(newDir);
  }
  async getFileHandle(name: string, options?: { create?: boolean }) {
    const file = this.contents.find(item => item[0] === name);
    if (file?.[1].kind === "directory") {
      throw new Error("TypeMismatchError");
    }
    if (file) {
      return Promise.resolve(file[1] as FileSystemFileHandle);
    }
    if (!options?.create) {
      throw new Error("NotFoundError");
    }
    const newFile = new FileSystemFileHandle(name, "");
    this.contents.push([name, newFile]);
    return Promise.resolve(newFile);
  }
  async *entries() {
    const entries = this.contents.map(item => Promise.resolve(item));
    for await (const entry of entries) {
      yield entry;
    }
  }
  async *keys() {
    const keys = this.contents.map(item => Promise.resolve(item[0]));
    for await (const key of keys) {
      yield key;
    }
  }
  async *values() {
    const values = this.contents.map(item => Promise.resolve(item[1]));
    for await (const value of values) {
      yield value;
    }
  }
  async removeEntry(name: string, options?: { recursive?: boolean }) {
    const itemIndex = this.contents.findIndex(item => item[0] == name);
    const item = this.contents[itemIndex];
    const dir: FileSystemDirectoryHandle | false =
      item?.[1].kind === "directory" && (item[1] as FileSystemDirectoryHandle);
    if (options?.recursive && dir) {
      for await (const entry of dir.keys()) {
        await dir.removeEntry(entry, { recursive: true });
      }
    }
    this.contents.splice(itemIndex, 1);
    return Promise.resolve();
  }
}

export const createFromObject = (
  obj: ObjectFileSystem | string,
  name?: string,
): FileSystemHandle => {
  if (name === undefined) {
    return createFromObject(obj, "filesystem");
  } else if (typeof obj === "string") {
    return new FileSystemFileHandle(name, obj);
  } else {
    return new FileSystemDirectoryHandle(
      name,
      Object.entries(obj).map(
        ([name, content]: [string, ObjectFileSystem | string]) =>
          [name, createFromObject(content, name)] as [
            string,
            FileSystemFileHandle | FileSystemDirectoryHandle,
          ],
      ),
    );
  }
};

(globalThis as any).currentFileSystem = createFromObject({
  src: { "index.ts": "// test" },
  data: { "data.json": "[1, 2, 3]" },
});

(globalThis as any).showDirectoryPicker = () =>
  Promise.resolve((globalThis as any).currentFileSystem);
