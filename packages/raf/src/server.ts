export type FPS = number | Function;

const createRAF = (
  _callback: (timeStamp: number) => void,
  _targetFps: FPS = Infinity
): [running: () => boolean, start: () => void, stop: () => void] => {
  return [
    () => false,
    () => {
      /*noop*/
    },
    () => {
      /*noop*/
    }
  ];
};

export default createRAF;
