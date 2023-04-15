import { Accessor, createMemo, createSignal, mapArray } from "solid-js";
import { MaybeAccessor, asAccessor } from "@solid-primitives/utils";

export type MasonryItemData<T> = {
  source: T;
  order: Accessor<number>;
  margin: Accessor<number>;
  height: Accessor<number>;
  column: Accessor<number>;
};

export type MapElement<TSource, TElement> = (
  data: MasonryItemData<TSource>,
  index: Accessor<number>,
) => TElement;

export type MasonryOptions<TSource> = {
  source: Accessor<readonly TSource[] | false | null | undefined>;
  mapHeight: (item: TSource) => MaybeAccessor<number>;
  mapElement?: undefined;
  columns: MaybeAccessor<number>;
};

export type MasonryOptionsWithElement<TSource, TElement> = Omit<
  MasonryOptions<TSource>,
  "mapElement"
> & {
  mapElement: MapElement<TSource, TElement>;
};

function getShortestColumn(heights: number[]): number {
  let min = 0;
  for (let i = 0, record = Infinity; i < heights.length; i++)
    if (heights[i]! < record) record = heights[(min = i)]!;
  return min;
}

const $SET_STYLE = Symbol("set-style");

const noopIndex = () => 0;

const mapData = <TSource, TElement>(
  source: TSource,
  track: VoidFunction,
  mapHeight: (item: TSource) => MaybeAccessor<number>,
  mapElement: MapElement<TSource, TElement> | undefined,
  index: Accessor<number>,
) => {
  let orderValue = 0,
    marginValue = 0,
    columnValue = 0;

  const data = {
    source,
    order: () => (track(), orderValue),
    margin: () => (track(), marginValue),
    column: () => (track(), columnValue),
    height: asAccessor(mapHeight(source)),
  } as MasonryItemData<TSource> & {
    [$SET_STYLE]: (col: number, order: number, margin: number) => void;
    element?: any;
  };

  if (mapElement) data.element = mapElement(data, index);

  data[$SET_STYLE] = (col, order, margin) => {
    columnValue = col;
    orderValue = order;
    marginValue = margin;
  };

  return data;
};

export function createMasonry<TSource, TElement>(
  options: MasonryOptionsWithElement<TSource, TElement>,
): Accessor<TElement[]> & { height: Accessor<number> };

export function createMasonry<TSource>(
  options: MasonryOptions<TSource>,
): Accessor<MasonryItemData<TSource>[]> & { height: Accessor<number> };

export function createMasonry<T>(
  options: MasonryOptions<T> | MasonryOptionsWithElement<T, any>,
): Accessor<any[]> & { height: Accessor<number> } {
  const { source, mapHeight, mapElement } = options,
    [memo, setMemo] = createSignal<VoidFunction>(),
    getCols = asAccessor(options.columns),
    mapped = createMemo(
      mapArray(
        source,
        mapElement && mapElement.length > 1
          ? (source, index) => mapData(source, () => memo()?.(), mapHeight, mapElement, index)
          : source => mapData(source, () => memo()?.(), mapHeight, mapElement, noopIndex),
      ),
    ),
    getOrder = createMemo(() =>
      Array.from({ length: getCols() }, (): ReturnType<typeof mapped> => []),
    ),
    height = setMemo(() =>
      createMemo(() => {
        const items = mapped(),
          columns = getOrder(),
          heights = new Array(columns.length).fill(0);

        for (let i = 0; i < items.length; i++) {
          const item = items[i]!,
            col = getShortestColumn(heights);

          columns[col]!.push(item);
          heights[col] += item.height();
        }
        const height = Math.max(...heights);

        for (let colIndex = 0, order = 0; colIndex < columns.length; colIndex++) {
          const col = columns[colIndex]!;
          for (let i = 0; i < col.length; i++, order++)
            col[i]![$SET_STYLE](
              colIndex,
              order,
              i === col.length - 1 ? height - heights[colIndex]! : 0,
            );
          col.length = 0;
        }

        return height;
      }),
    );

  const result = mapElement ? createMemo(() => mapped().map(i => i.element)) : mapped;

  (result as any).height = height;

  return result as any;
}
