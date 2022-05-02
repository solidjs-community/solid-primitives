import { onCleanup, onMount } from "solid-js";
import { transformFile } from "./helpers";
import { FileUploaderDirective } from "./types";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      fileUploader: FileUploaderDirective;
    }
  }
}

export const fileUploader = (element: HTMLInputElement, options: () => FileUploaderDirective) => {
  const { userCallback, setFiles } = options();


  onMount(() => {
    async function onChange(this: HTMLInputElement, event: Event) {
      const parsedFiles = [];
      const target = this;

      for (const index in target.files) {
        const fileIndex = +index;
        if (isNaN(+fileIndex)) {
          continue;
        }

        const file = target.files[fileIndex];
        const parsedFile = transformFile(file);

        parsedFiles.push(parsedFile);
      }

      setFiles(parsedFiles);

      try {
        await userCallback(parsedFiles);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    onCleanup(() => element.removeEventListener('change', onChange))

    element.addEventListener("change", onChange);
  })
};

export { createFileUploader } from "./createFileUploader";
export { createDropzone } from "./createDropzone";
