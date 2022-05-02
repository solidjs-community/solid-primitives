import { FileUploaderOptions, UploadFile } from "./types";

export const doStuff = (s: number): Promise<void> => {
  return new Promise((res) => setTimeout(res, s * 1000));
};

export function createInputComponent({ multiple = false, accept = "" }: FileUploaderOptions) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}

export function transformFile(file: File): UploadFile {
  const parsedFile: UploadFile = {
    source: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    file
  };
  return parsedFile;
}
