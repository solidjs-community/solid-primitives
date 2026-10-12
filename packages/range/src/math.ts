export function precisionRound(value: number, decimalPlaces = 10): number {
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function inverseLerp(min: number, max: number, value: number): number {
  if (min === max) return 0;
  const ratio = (value - min) / (max - min);
  return Math.max(0, Math.min(1, ratio));
}

export function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * Math.max(0, Math.min(1, t));
}

export function snapToStep(
  value: number,
  step: number,
  min = 0,
): number {
  if (step <= 0) return value;
  const stepDecimals = (step.toString().split(".")[1] || "").length;
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  return precisionRound(snapped, Math.max(stepDecimals, 4));
}

export function logScale(
  min: number,
  max: number,
  ratio: number,
): number {
  const safeMin = Math.max(min, 0.00001);
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const logMin = Math.log(safeMin);
  const logMax = Math.log(max);
  return Math.exp(logMin + safeRatio * (logMax - logMin));
}

export function inverseLogScale(
  min: number,
  max: number,
  value: number,
): number {
  const safeMin = Math.max(min, 0.00001);
  const safeVal = Math.max(safeMin, Math.min(max, value));
  const logMin = Math.log(safeMin);
  const logMax = Math.log(max);
  return (Math.log(safeVal) - logMin) / (logMax - logMin);
}
