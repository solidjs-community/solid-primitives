import { type FileUploaderOptions, type UploadFile } from "./types.js";

export const doStuff = (s: number): Promise<void> => {
  return new Promise(res => setTimeout(res, s * 1000));
};

export function createInputComponent({ multiple = false, accept = "" }: FileUploaderOptions) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}

/**
 * Converts a `FileList` (from an input or a drop) into `UploadFile` entries, each with an object
 * URL for previews. Returns an empty array for `null`.
 */
export function transformFiles(files: FileList | null): UploadFile[] {
  if (!files) return [];

  // iterate the FileList itself: `for...in` would also visit its `length` and `item` members
  return Array.from(files, file => ({
    source: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    file,
  }));
}
