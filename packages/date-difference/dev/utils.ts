export const flipVal = (val: number, min: number, max: number): number =>
  Math.abs(val * (Math.sign(val) || 1) - max) + min;

export const pToVal = (p: number, zero: number, hundred: number): number =>
  p * (hundred - zero) + zero;

export function valToP(value: number, min: number, max: number): number {
  if (min > max) {
    [min, max] = [max, min];
    value = flipVal(value, min, max);
  }
  return (value - min) / (max - min);
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
