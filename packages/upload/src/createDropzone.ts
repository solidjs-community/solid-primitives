import { createSignal, flush } from "solid-js";
import { isServer } from "@solidjs/web";
import { createEventListenerMap } from "@solid-primitives/event-listener";
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

  const [refTarget, setRefTarget] = createSignal<T | undefined>(undefined);

  createEventListenerMap(refTarget as () => T, {
    dragstart: onDragStart,
    dragenter: onDragEnter,
    dragend: onDragEnd,
    dragleave: onDragLeave,
    dragover: onDragOver,
    drag: onDrag,
    drop: onDrop,
  });

  const setRef = (ref: T) => { setRefTarget(() => ref); flush(); };

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
