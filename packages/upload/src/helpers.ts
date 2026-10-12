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

export function transformFiles(files: FileList | null): UploadFile[] {
  if (!files) return [];

  const parsed: UploadFile[] = []
  for (const idx in files) {
    // SAFETY: w3c File API defines FileList item access to be valid from index 0 to `files.length - 1`
    // https://w3c.github.io/FileAPI/#filelist-methods-params: "Supported property indices are the numbers in the range zero to one less than the number of File objects represented by the FileList object."
    const file = files[Number(idx)]!
    parsed.push({
      source: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      file,
    });
  }

  return parsed;
}
