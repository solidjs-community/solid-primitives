import { type FilePickerOptions, type UploadFile } from "./types.ts";

export function createInputComponent({ multiple = false, accept = "" }: FilePickerOptions) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}

export function transformFiles(files: FileList | null): UploadFile[] {
  const parsedFiles: UploadFile[] = [];

  if (!files) return parsedFiles;

  for (const index in files) {
    const fileIndex = +index;
    if (isNaN(+fileIndex)) {
      continue;
    }

    const file = files[fileIndex];
    if (!file) {
      continue;
    }

    const parsedFile: UploadFile = {
      source: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      file,
    };
    parsedFiles.push(parsedFile);
  }

  return parsedFiles;
}
