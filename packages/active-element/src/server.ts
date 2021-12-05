export const createActiveElement = () => [
  () => null,
  {
    stop: () => {},
    start: () => {}
  }
];

export const createIsElementActive = () => [
  () => false,
  {
    stop: () => {},
    start: () => {}
  }
];

export const isActive = () => {};
