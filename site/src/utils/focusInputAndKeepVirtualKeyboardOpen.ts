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
