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

export function valToPwMid(
  value: number,
  min: number,
  max: number,
  turn = pToVal(0.5, min, max)
): number {
  if (min > max) {
    [min, max] = [max, min];
    turn = flipVal(turn, min, max);
    value = flipVal(value, min, max);
  }
  return value < turn ? (value - turn) / (turn - min) : (value - turn) / (max - turn);
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
