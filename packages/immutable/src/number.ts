export const add = (...a: number[]): number => {
  let r = 0;
  for (const n of a) {
    r += n;
  }
  return r;
};

export const substract = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a -= n;
  }
  return a;
};

export const multiply = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a *= n;
  }
  return a;
};

export const divide = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a /= n;
  }
  return a;
};

export const power = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a = a ** n;
  }
  return a;
};
