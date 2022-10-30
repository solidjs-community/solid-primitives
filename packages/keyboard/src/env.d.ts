export {};

declare global {
  interface Array {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
  interface ReadonlyArray {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
}
