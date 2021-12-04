const createScrollObserver = <T extends HTMLElement>(
  _target: () => T | Window = () => window
): (() => number | null) => {
  return () => null;
};

export default createScrollObserver;
