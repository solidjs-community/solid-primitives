import { type Accessor, createMemo, createSignal, mapArray } from "solid-js";
import { type MaybeAccessor, asAccessor } from "@solid-primitives/utils";
import { ColumnMinHeap } from "./heap.js";

export * from "./heap.js";

const $SET_ITEM = Symbol("set-item");
const noopIndex = () => 0;

export type MasonryItemData<T> = {
  source: T;
  order: Accessor<number>;
  margin: Accessor<number>;
  height: Accessor<number>;
  column: Accessor<number>;
};

export type MasonryOptions<TSource, TElement> = {
  source: Accessor<readonly TSource[] | false | null | undefined>;
  columns: MaybeAccessor<number>;
  mapHeight: (item: TSource) => MaybeAccessor<number>;
  mapElement: (data: MasonryItemData<TSource>, index: Accessor<number>) => TElement;
};

export type MasonryOptionsNoElements<TSource> = Omit<MasonryOptions<TSource, never>, "mapElement"> & {
  mapElement?: undefined;
};

export interface MasonryReturn<T> extends Accessor<readonly T[]> {
  readonly height: Accessor<number>;
}

const mapData = <TSource, TElement>(
  source: TSource,
  track: VoidFunction,
  mapHeight: (item: TSource) => MaybeAccessor<number>,
  mapElement: MasonryOptions<TSource, TElement>["mapElement"] | undefined,
  index: Accessor<number>,
) => {
  let orderValue = 0,
    marginValue = 0,
    columnValue = 0;

  const data: MasonryItemData<TSource> & {
    [$SET_ITEM]: (col: number, order: number, margin: number) => void;
    element?: TElement;
  } = {
    source,
    order: () => (track(), orderValue),
    margin: () => (track(), marginValue),
    column: () => (track(), columnValue),
    height: asAccessor(mapHeight(source)),
    [$SET_ITEM](col, order, margin) {
      columnValue = col;
      orderValue = order;
      marginValue = margin;
    },
  };

  if (mapElement) data.element = mapElement(data, index);

  return data;
};

export function createMasonry<TSource, TElement>(
  options: MasonryOptions<TSource, TElement>,
): MasonryReturn<TElement>;

export function createMasonry<TSource>(
  options: MasonryOptionsNoElements<TSource>,
): MasonryReturn<MasonryItemData<TSource>>;

export function createMasonry<TSource, TElement>(
  options: MasonryOptionsNoElements<TSource> | MasonryOptions<TSource, TElement>,
): MasonryReturn<TElement | MasonryItemData<TSource>> {
  const { source, mapHeight, mapElement } = options;
  const [memo, setMemo] = createSignal<VoidFunction>();

  const mapped = createMemo(
    mapArray(
      source,
      mapElement && mapElement.length > 1
        ? (item, index) => mapData(item, () => memo()?.(), mapHeight, mapElement, index)
        : item => mapData(item, () => memo()?.(), mapHeight, mapElement, noopIndex),
    ),
  );

  const columns = asAccessor(options.columns);
  const getColumns = createMemo(
    () => Array.from({ length: columns() }, (): ReturnType<typeof mapped> => []),
    undefined,
    { equals: (a, b) => a.length === b.length },
  );

  const height = setMemo(() =>
    createMemo(() => {
      const items = mapped();
      const cols = getColumns();
      const colCount = cols.length;
      if (colCount === 0) return 0;

      const heap = new ColumnMinHeap(colCount);
      const heights = new Array<number>(colCount).fill(0);

      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        const itemH = item.height();
        const col = heap.addHeight(itemH);
        cols[col]!.push(item);
        heights[col] += itemH;
      }

      const totalH = Math.max(...heights);

      for (let colIndex = 0, order = 0; colIndex < cols.length; colIndex++) {
        const col = cols[colIndex]!;
        for (let i = 0; i < col.length; i++, order++) {
          col[i]![$SET_ITEM](
            colIndex,
            order,
            i === col.length - 1 ? totalH - heights[colIndex]! : 0,
          );
        }
        col.length = 0;
      }

      return totalH;
    }),
  );

  const resultAccessor: Accessor<readonly (TElement | MasonryItemData<TSource>)[]> =
    mapElement ? createMemo(() => mapped().map(i => i.element!)) : mapped;

  return Object.assign(resultAccessor, {
    height,
  }) as MasonryReturn<TElement | MasonryItemData<TSource>>;
}
