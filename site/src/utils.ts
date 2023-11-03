import { BASE, BASE_NOFS } from "~/constants.js";

export const doesPathnameMatchBase = (pathname: string) =>
  pathname === BASE || pathname === BASE_NOFS;

// Credit https://stackoverflow.com/a/55652503/8234457
/**
 * Must be invoked inside user events, such as onclick
 */
export const focusInputAndKeepVirtualKeyboardOpen = (
  input: HTMLElement | (() => HTMLElement),
  { timeout }: { timeout?: number } = {},
) => {
  // create invisible dummy input to receive the focus first
  const fakeInput = document.createElement("input");
  fakeInput.setAttribute("type", "text");
  fakeInput.style.position = "absolute";
  fakeInput.style.opacity = "0";
  fakeInput.style.height = "0";
  fakeInput.style.fontSize = "16px"; // disable auto zoom

  // you may need to append to another element depending on the browser's auto
  // zoom/scroll behavior
  document.body.prepend(fakeInput);

  // focus so that subsequent async focus will work
  fakeInput.focus();

  const switchFocus = () => {
    /**
     *  do not query dom inside this block
     */
    if (typeof input === "function") {
      input()!.focus();
    } else {
      input.focus();
    }
    fakeInput.remove();
  };

  if (timeout) {
    setTimeout(switchFocus, timeout);
    return;
  }

  requestAnimationFrame(switchFocus);
};

export function getTextWidth(text: string, font: string): number {
  // re-use canvas object for better performance
  const canvas: HTMLCanvasElement =
    // @ts-ignore
    getTextWidth.canvas ||
    // @ts-ignore
    (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

export function reflow() {
  document.body.clientWidth;
}

export const scrollIntoView = (
  input: string | Element,
  { offset, behavior }: { offset: number; behavior: "auto" | "smooth" },
) => {
  const el = typeof input === "string" ? document.querySelector(input) : input;
  if (!el) return;

  window.scrollTo({
    behavior,
    top: el.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset,
  });
};

export const kebabCaseToCapitalized = (str: string) => {
  return str
    .split("-")
    .map(word => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
};
