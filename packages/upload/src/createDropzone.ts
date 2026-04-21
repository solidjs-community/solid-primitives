import { createSignal, type JSX, getOwner, onCleanup, runWithOwner } from "solid-js";
import { isServer } from "@solidjs/web";
import { transformFiles } from "./helpers.js";
import type { UploadFile, Dropzone, DropzoneOptions } from "./types.js";

/**
 * Primitive to make working with dropzones easier.
 *
 * @returns `setRef`
 * @returns `files`
 * @returns `error` - Reactive error from the last drag callback, cleared on next drop
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
      isDragging: () => false,
      removeFile: () => {},
      clearFiles: () => {},
    };
  }
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [error, setError] = createSignal<unknown>(null);
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

  const onDragStart: JSX.EventHandler<T, DragEvent> = event => {
    setIsDragging(true);
    void runCallback(options?.onDragStart, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnd: JSX.EventHandler<T, DragEvent> = event => {
    setIsDragging(false);
    void runCallback(options?.onDragEnd, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnter: JSX.EventHandler<T, DragEvent> = event => {
    void runCallback(options?.onDragEnter, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragLeave: JSX.EventHandler<T, DragEvent> = event => {
    void runCallback(options?.onDragLeave, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragOver: JSX.EventHandler<T, DragEvent> = event => {
    event.preventDefault();
    void runCallback(options?.onDragOver, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrag: JSX.EventHandler<T, DragEvent> = event => {
    void runCallback(options?.onDrag, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrop: JSX.EventHandler<T, DragEvent> = event => {
    event.preventDefault();
    const parsedFiles = transformFiles(event.dataTransfer?.files || null);
    setFiles(parsedFiles);
    setError(null);
    void runCallback(options?.onDrop, parsedFiles);
  };

  // setRef is the Phase-2 ref callback: called synchronously when the element is created.
  // Listeners are attached immediately; cleanup is registered back in the owner scope.
  const setRef = (ref: T) => {
    ref.addEventListener("dragstart", onDragStart as any);
    ref.addEventListener("dragenter", onDragEnter as any);
    ref.addEventListener("dragend", onDragEnd as any);
    ref.addEventListener("dragleave", onDragLeave as any);
    ref.addEventListener("dragover", onDragOver as any);
    ref.addEventListener("drag", onDrag as any);
    ref.addEventListener("drop", onDrop as any);

    runWithOwner(owner, () => {
      onCleanup(() => {
        ref.removeEventListener("dragstart", onDragStart as any);
        ref.removeEventListener("dragenter", onDragEnter as any);
        ref.removeEventListener("dragend", onDragEnd as any);
        ref.removeEventListener("dragleave", onDragLeave as any);
        ref.removeEventListener("dragover", onDragOver as any);
        ref.removeEventListener("drag", onDrag as any);
        ref.removeEventListener("drop", onDrop as any);
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
    isDragging,
    removeFile,
    clearFiles,
  };
}

export { createDropzone };
