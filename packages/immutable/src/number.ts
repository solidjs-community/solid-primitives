/** `a + b + c + ...` */
export const add = (...a: number[]): number => {
  let r = 0;
  for (const n of a) {
    r += n;
  }
  return r;
};

/** `a - b - c - ...` */
export const substract = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a -= n;
  }
  return a;
};

/** `a * b * c * ...` */
export const multiply = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a *= n;
  }
  return a;
};

/** `a / b / c / ...` */
export const divide = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a /= n;
  }
  return a;
};

/** `a ** b ** c ** ...` */
export const power = (a: number, ...b: number[]): number => {
  for (const n of b) {
    a = a ** n;
  }
  return a;
};

/** clamp a number value between two other values */
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
