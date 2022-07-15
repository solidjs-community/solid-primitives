export {};

declare global {
  interface Array<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
  interface ReadonlyArray<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
}
