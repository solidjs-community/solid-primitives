import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createMutationObserver } from "@solid-primitives/mutation-observer";
import type { PositiveNumber } from "./positive-number";

export const UPDATE: symbol = Symbol.for("update-grid");

export type FixedAspectGridProps = {
  fixedRatio: PositiveNumber;
}

export const computeFixedAspectHeight = (
  width: number,
  height: number,
  itemCount: number,
  fixedRatio: PositiveNumber,
): number => {
  if (itemCount === 0 || width === 0 || height === 0) return 0;
  if (itemCount === 1) return width / height > fixedRatio ? height : width / fixedRatio;
  const rows = Math.ceil(Math.sqrt(itemCount * fixedRatio * height / width));
  return Math.round(height / rows);
}

/**
 * Sets a CSS `--row-height variable on a grid container to support the grid
 */
export const createFixedAspectGrid = (props: FixedAspectGridProps) => {
  return (ref: HTMLElement): void => {
    // n = item count, i = item aspect ratio, w = container width, h = container height
    // fixed aspect ratio row height: r =  ⌊h / √(n * i * h / w)⌋
    const adjustHeight = ({ width, height }: { width: number, height: number}) => {
      ref.style.setProperty(
        "--row-height", 
        `${computeFixedAspectHeight(width, height, ref.children.length, props.fixedRatio)}px`
      );
    };    
    const update = () => adjustHeight({ width: ref.offsetWidth, height: ref.offsetHeight });
    createResizeObserver(ref, adjustHeight);
    createMutationObserver([[ref, { childList: true }]], update);
    Object.assign(ref, { [UPDATE]: update });
  };
}

export type FreeAspectGridProps = {
  getAspect: (node: HTMLElement) => number;
}


/**
 * finds the first image or video being or inside the node and gets its aspect, 
 * returns 0 otherwise
 */
export const getAspect = (node: HTMLElement): number => {
  if (node instanceof HTMLVideoElement) {
    const width = node.videoWidth, height = node.videoHeight;
    return height ? width / height : 0;
  } else if (node instanceof HTMLImageElement) {
    const width = node.naturalWidth, height = node.naturalHeight;
    return height ? width / height : 0;
  } else {
    for (let child of node.childNodes) {
      const aspect = child instanceof HTMLElement && getAspect(child as HTMLElement);
      if (aspect) return aspect;
    }
  }
  return 0;
}

/**
 * Sets a CSS `--row-height variable on a grid container to support the grid
 */
export const computeFreeAspectHeight = (width: number, height: number, items: number[]): number => {
  if (width === 0 || height === 0 || items.length === 0) return 0;
  if (items.length === 1) return height * height / width * items[0]!;
  const containerRatio = width / height;
  // create an unoptimized array with each possible number of lines and item-wise distributions
  const heights = items.map((_, length) => {
    const lineAspectRatio = containerRatio * length;
    const [lines] = items.reduce(([lines, no, lastSum], item) => {
      if (lastSum + item / 2 > lineAspectRatio && no + 1 < length) {
        no++;
        lastSum = 0;
      } else {
        lastSum += item;
      }
      lines[no]!.push(item);
      return [lines, no, lastSum];
    }, [Array.from({ length }, () => []) as number[][], 0, 0])
    const longestLine = Math.max(...lines.map(line => line.reduce((a, b) => a + b)));
    return height / longestLine;
  });
  return Math.max(...heights);
}

export const createFreeAspectGrid = (props: FreeAspectGridProps = { getAspect }): ((ref: HTMLElement) => void) => {
  const getItemAspects = (ref: HTMLElement) => Array.from(ref.children)
      .filter((node) => node instanceof HTMLElement)
      .map(props.getAspect)
  
  return (ref: HTMLElement) => {
    const adjustHeight = ({ width, height }: { width: number, height: number }) => {
      ref.style.setProperty(
        "--row-height",
        `${computeFreeAspectHeight(width, height, getItemAspects(ref) )}px`
      );
    };
    const update = () => adjustHeight({ width: ref.offsetWidth, height: ref.offsetHeight });
    createResizeObserver(ref, adjustHeight);
    createMutationObserver([[ref, { childList: true }]], update);
    Object.assign(ref, { [UPDATE]: update });
  }
}
