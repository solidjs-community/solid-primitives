const createResizeObserver = <T extends HTMLElement>(opts: {
  _onResize: ResizeHandler;
  _refs?: T | T[] | (() => T | T[]);
}): (arg: T) => void => {
  return () => {
    /*noop*/
  };
}

export default createResizeObserver;
