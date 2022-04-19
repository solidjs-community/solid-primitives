export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isObject(value: any): value is Record<string, any> {
  const type = typeof value;
  return value != null && (type === "object" || type === "function") && !isArray(value);
}

export function isFunction<T extends Function = Function>(value: any): value is T {
  return typeof value === "function";
}

export function isNull(value: any): value is null {
  return value == null;
}

export function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

export function isUndefined(value: any): value is undefined {
  return typeof value === "undefined" || value === undefined;
}
