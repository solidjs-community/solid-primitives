import { createSignal, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface ChunkMetadata {
  readonly index: number;
  readonly totalChunks: number;
  readonly startByte: number;
  readonly endByte: number;
  readonly totalBytes: number;
  readonly chunk: Blob;
}

export interface ChunkStreamerOptions {
  chunkSize?: number;
}

export interface ChunkStreamerReturn {
  progress: Accessor<number>;
  isProcessing: Accessor<boolean>;
  sliceFile: (file: File) => readonly ChunkMetadata[];
  streamChunks: (
    file: File,
    handler: (chunk: ChunkMetadata) => Promise<void>,
  ) => Promise<void>;
}

export function createChunkedUpload(
  options: ChunkStreamerOptions = {},
): ChunkStreamerReturn {
  const chunkSize = options.chunkSize ?? 1024 * 1024 * 5;

  const [progress, setProgress] = createSignal(0);
  const [isProcessing, setIsProcessing] = createSignal(false);

  const sliceFile = (file: File): readonly ChunkMetadata[] => {
    if (isServer || typeof window === "undefined") return [];
    const totalBytes = file.size;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / chunkSize));
    const chunks: ChunkMetadata[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const startByte = i * chunkSize;
      const endByte = Math.min(startByte + chunkSize, totalBytes);
      const chunk = file.slice(startByte, endByte);

      chunks.push({
        index: i,
        totalChunks,
        startByte,
        endByte,
        totalBytes,
        chunk,
      });
    }

    return chunks;
  };

  const streamChunks = async (
    file: File,
    handler: (chunk: ChunkMetadata) => Promise<void>,
  ): Promise<void> => {
    if (isServer || typeof window === "undefined") return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const chunks = sliceFile(file);
      const total = chunks.length;

      for (let i = 0; i < total; i++) {
        const chunk = chunks[i]!;
        await handler(chunk);
        setProgress(Math.round(((i + 1) / total) * 100));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    progress,
    isProcessing,
    sliceFile,
    streamChunks,
  };
}
