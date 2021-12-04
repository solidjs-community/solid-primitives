export type FPS = number | Function;

const createRAF = (
  _callback: (timeElapse: number) => void,
  _fps: FPS = 60,
  _runImmediately = true
): [running: () => boolean, start: () => void, stop: () => void] => {
  return [
    () => false,
    () => {
      /*noop*/
    },
    () => {
      /*noop*/
    }, 
  ];
};

export default createRAF;
