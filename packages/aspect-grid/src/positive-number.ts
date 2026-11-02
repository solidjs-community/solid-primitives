export const positiveNumberSchema = (x: number): PositiveNumber => {
  if (x <= 0) throw new Error(`${x} is not positive`);
  return x as PositiveNumber;
}

export type PositiveNumber = number & { __brand: "PositiveNumber" };
