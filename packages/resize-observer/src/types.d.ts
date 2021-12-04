declare type ObservedSize = {
  width: number | undefined;
  height: number | undefined;
};

declare type ResizeHandler = (size: ObservedSize, ref: Element) => void;
