import { Accessor, createMemo, createSignal, mapArray } from "solid-js";
import { MaybeAccessor, asAccessor } from "@solid-primitives/utils";

export type MasonryLayoutOptions<T> = {
  items: Accessor<readonly T[] | false | null | undefined>;
  mapItem: (item: T, margin: Accessor<number>) => MaybeAccessor<number>;
  columns: MaybeAccessor<number>;
  gap?: number | Accessor<number | false | null | undefined> | undefined;
};

function getShortestColumn(heights: number[]): number {
  let min = 0;
  for (let i = 0, record = Infinity; i < heights.length; i++)
    if (heights[i]! < record) record = heights[(min = i)]!;
  return min;
}

export function createMasonryLayout<T>(
  options: MasonryLayoutOptions<T>,
): Accessor<T[]> & { height: Accessor<number> } {
  const { items, mapItem, columns, gap } = options,
    marginMap = mapItem.length > 1 ? new Map<T, number>() : undefined,
    [getMemo, setMemo] = createSignal<VoidFunction>(),
    getNCols = asAccessor(columns),
    getGap = asAccessor(gap),
    mapped = mapArray(items, item => ({
      item,
      height: asAccessor(mapItem(item, () => (getMemo()?.(), marginMap!.get(item) ?? 0))),
    })),
    memo = setMemo(() =>
      createMemo(() => {
        const items = mapped(),
          nCols = getNCols(),
          gap = getGap() || 0,
          columns = Array.from({ length: nCols }, (): T[] => []),
          heights = new Array(nCols).fill(0);

        for (let i = 0; i < items.length; i++) {
          const item = items[i]!,
            h = item.height(),
            col = getShortestColumn(heights);

          console.log("col", col, h);

          columns[col]!.push(item.item);
          heights[col] += i < nCols ? h : h + gap;
        }
        const height = Math.max(...heights);

        if (marginMap) {
          marginMap.clear();
          for (let col = 0; col < columns.length; col++) {
            const margin = height - heights[col]!;
            margin && marginMap.set(columns[col]![columns[col]!.length - 1]!, margin);
          }
        }

        return { layout: columns.flat(), height };
      }),
    );

  return Object.assign(() => memo().layout, { height: () => memo().height });
}
