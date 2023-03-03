import type { ComponentProps, JSX } from "solid-js";
import { For, createMemo } from "solid-js";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  [...Array(6)].forEach(() => (color += letters[Math.floor(Math.random() * 16)]));
  return color;
};

export type BoxesDemoArgs = {
  boxes: number;
  boxSize?: string;
} & ComponentProps<"div">;

export const BoxesDemo = (props: BoxesDemoArgs) => {
  const boxes = createMemo(() => [...Array(props.boxes).keys()], [0]);

  return (
    <>
      <div
        {...props}
        class="flex flex-row flex-wrap justify-around gap-3 min-h-80 w-80"
        style={{
          ...((props.style as JSX.CSSProperties) || []),
        }}
      >
        <For each={boxes()} fallback={<div>No Items</div>}>
          {(_, index) => {
            return (
              <>
                <div
                  class={`flex items-center justify-center`}
                  classList={{
                    "w-[50px]": !props?.boxSize,
                    "h-[50px]": !props?.boxSize,
                  }}
                  style={{
                    ...(props?.boxSize
                      ? {
                          width: props.boxSize,
                          height: props.boxSize,
                        }
                      : {}),
                    "background-color": getRandomColor(),
                  }}
                >
                  {index() + 1}
                </div>
              </>
            );
          }}
        </For>
      </div>
    </>
  );
};
