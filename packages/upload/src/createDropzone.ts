import { createSignal, getOwner, onCleanup, runWithOwner } from "solid-js";
import { isServer } from "@solidjs/web";
import { transformFiles } from "./helpers.js";
import type { UploadFile, Dropzone, DropzoneOptions } from "./types.js";

/**
 * Primitive to make working with dropzones easier.
 *
 * @returns `setRef`
 * @returns `files`
 * @returns `error` - Reactive error from the last drag callback, cleared on next drop
 * @returns `isLoading` - True while the `onDrop` callback is pending
 * @returns `isDragging`
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * const { setRef: dropzoneRef, files: droppedFiles, error } = createDropzone({
 *   onDrop: async files => {
 *     await doStuff(2);
 *     files.forEach(f => console.log(f));
 *   },
 *   onDragStart: files => files.forEach(f => console.log(f)),
 *   onDragOver: files => console.log("drag over")
 * });
 * ```
 */
function createDropzone<T extends HTMLElement = HTMLElement>(
  options?: DropzoneOptions,
): Dropzone<T> {
  if (isServer) {
    return {
      setRef: () => {},
      files: () => [],
      error: () => null,
      isLoading: () => false,
      isDragging: () => false,
      removeFile: () => {},
      clearFiles: () => {},
    };
  }
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [error, setError] = createSignal<unknown>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  // Capture owner in the Phase-1 (owned) scope so cleanup can be registered later
  const owner = getOwner();

  const runCallback = async (
    callback: ((files: UploadFile[]) => void | Promise<void>) | undefined,
    parsedFiles: UploadFile[],
  ) => {
    try {
      await callback?.(parsedFiles);
    } catch (err) {
      setError(err);
    }
  };

  const onDragStart = (event: DragEvent) => {
    void runCallback(options?.onDragStart, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnd = (event: DragEvent) => {
    void runCallback(options?.onDragEnd, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnter = (event: DragEvent) => {
    setIsDragging(true);
    void runCallback(options?.onDragEnter, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragLeave = (event: DragEvent) => {
    setIsDragging(false);
    void runCallback(options?.onDragLeave, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    void runCallback(options?.onDragOver, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrag = (event: DragEvent) => {
    void runCallback(options?.onDrag, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const parsedFiles = transformFiles(event.dataTransfer?.files || null);
    setFiles(parsedFiles);
    setError(null);
    setIsLoading(true);
    void (async () => {
      try {
        await options?.onDrop?.(parsedFiles);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  // setRef is the Phase-2 ref callback: called synchronously when the element is created.
  // Listeners are attached immediately; cleanup is registered back in the owner scope.
  const setRef = (ref: T) => {
    ref.addEventListener("dragstart", onDragStart);
    ref.addEventListener("dragenter", onDragEnter);
    ref.addEventListener("dragend", onDragEnd);
    ref.addEventListener("dragleave", onDragLeave);
    ref.addEventListener("dragover", onDragOver);
    ref.addEventListener("drag", onDrag);
    ref.addEventListener("drop", onDrop);

    runWithOwner(owner, () => {
      onCleanup(() => {
        ref.removeEventListener("dragstart", onDragStart);
        ref.removeEventListener("dragenter", onDragEnter);
        ref.removeEventListener("dragend", onDragEnd);
        ref.removeEventListener("dragleave", onDragLeave);
        ref.removeEventListener("dragover", onDragOver);
        ref.removeEventListener("drag", onDrag);
        ref.removeEventListener("drop", onDrop);
      });
    });
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    setRef,
    files,
    error,
    isLoading,
    isDragging,
    removeFile,
    clearFiles,
  };
}

export { createDropzone };
