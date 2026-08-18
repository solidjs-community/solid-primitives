export class AbortError extends Error {
  constructor(message = "aborted") {
    super(message);
    this.name = "AbortError";
  }
}

export type Segment = [text: string, matched: boolean];

/** Simulates a slow, abortable fuzzy-search fetcher over `data`. */
export async function autoSuggest(
  query: string,
  signal: AbortSignal,
  data: string[],
): Promise<Segment[][]> {
  await new Promise(r => setTimeout(r, 200));
  query = query.replace(/\W/g, "");
  if (!query) return [];
  if (signal.aborted) throw new AbortError();

  const fuzzyIndices = (term: string) => {
    let pos = -1;
    const indices: number[] = [];
    for (const char of query) {
      pos = term.indexOf(char, pos + 1);
      if (pos === -1) return null;
      indices.push(pos);
    }
    return indices;
  };

  return data.reduce<Segment[][]>((matches, term) => {
    if (signal.aborted) throw new AbortError();
    const indices = fuzzyIndices(term);
    if (!indices) return matches;

    const segments: Segment[] = [];
    [...term].forEach((char, i) => {
      const matched = indices.includes(i);
      if (segments.at(-1)?.[1] === matched) segments[segments.length - 1][0] += char;
      else segments.push([char, matched]);
    });
    matches.push(segments);
    return matches;
  }, []);
}

/** A ReadableStream that trickles `text` out in evenly-sized chunks, `delay`ms apart. */
export function makeChunkedTextStream(
  text: string,
  { packetCount = 16, delay = 200 } = {},
): ReadableStream<Uint8Array> {
  const sliceLength = Math.ceil(text.length / packetCount);
  const parts = Array.from({ length: packetCount }, (_, i) =>
    text.slice(i * sliceLength, (i + 1) * sliceLength),
  );
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      for (const part of parts) {
        await new Promise(r => setTimeout(r, delay));
        controller.enqueue(encoder.encode(part));
      }
      controller.close();
    },
  });
}
