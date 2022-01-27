/**
 * Get a single property value of an object by specifying a path to it.
 */
export function get<O extends object, K extends keyof O>(obj: O, key: K): O[K];
export function get<O extends object, K1 extends keyof O, K2 extends keyof O[K1]>(
  obj: O,
  k1: K1,
  k2: K2
): O[K1][K2];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2]
>(obj: O, k1: K1, k2: K2, k3: K3): O[K1][K2][K3];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3]
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4): O[K1][K2][K3][K4];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4]
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): O[K1][K2][K3][K4][K5];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4],
  K6 extends keyof O[K1][K2][K3][K4][K5]
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): O[K1][K2][K3][K4][K5][K6];
export function get(obj: any, ...keys: (string | number | symbol)[]) {
  let res = obj;
  for (const key of keys) {
    res = res[key];
  }
  return res;
}
