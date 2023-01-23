import { createSignal } from "solid-js";

/**
 * a utility class representing an Optional value, which can be either Some\<T> or None.
 *
 * @example
 * ```ts
 * const option = Some(5);
 *
 * if (option.isSome()) {
 *   doSomething(option.unwrap())
 * }
 * ```
 */
class Option<T> {
  #value: T | null;
  constructor(value: T | null) {
    this.#value = value;
  }
  /**
   * Checks whether the option is the None variant.
   * @example
   * ```ts
   * const userInput = None();
   *
   * if (userInput.isNone()) return alert("Invalid input");
   * ```
   */
  isNone() {
    return this.#value == null;
  }
  /**
   * Checks whether the option is the Some variant.
   * @example
   * ```ts
   * const userSubmission = Some(5);
   *
   * if (userSubmission.isSome()) return alert(`The user has already submitted value of ${userInput}`);
   * ```
   */
  isSome() {
    return this.#value != null;
  }
  /**
   * Unwraps the stored value, possibly null.
   * @example
   * ```ts
   * const count = Some(5);
   *
   * // safe
   * onMount(() => {
   *   doSomething(count.unwrap());
   * });
   *
   * // very unsafe, possibly null!!!
   * const onClick = () => {
   *   doSomething(count.unwrap());
   * };
   *
   * ```
   */
  unwrap() {
    return this.#value;
  }
  /**
   * Unwraps the stored value.
   * @return the stored `Some` value or a provided default.
   * @example
   * ```ts
   * const count = None();
   *
   * const onClick () => {
   *   doSomething(count.unwrap_or(5));
   * };
   * ```
   */
  unwrap_or(value: T) {
    return this.isNone() ? value : (this.#value as T);
  }
  /**
   * Unwraps the stored value.
   * @return the stored `Some` value or computes it from a closure.
   * @example
   * ```ts
   * const count = None();
   *
   * const onClick () => {
   *   doSomething(count.unwrap_or_else(() => 5));
   * };
   * ```
   */
  unwrap_or_else(closure: () => T) {
    return this.isNone() ? closure() : (this.#value as T);
  }
  /**
   * Maps an Option\<T> to Option\<U> by applying a function to a stored value.
   * @return Option\<U>
   * @example
   * ```ts
   * const count = Some(5);
   *
   * const onClick () => {
   *   doSomething(count.map((count) => count * 2)); // Some(10);
   * };
   * ```
   */
  map<U extends Required<U>>(closure: (arg0: T) => U) {
    return this.isNone() ? (this as unknown as Option<U>) : Some(closure(this.#value as T));
  }
  /**
   * @return the Option if it is the `Some` variant, otherwise returns `option`.
   * @example
   * ```ts
   * const count = None();
   * const fallbackCount = Some(5);
   *
   * const onClick () => {
   *   doSomething(count.or(fallbackCount)); // Some(5);
   * };
   *
   * ```
   */
  or(option: Option<T>) {
    return this.isNone() ? option : this;
  }
}

/**
 * Creates a new Option instance.
 * @param value optional initial value
 * @return A non-reactive Option instance, useful for createStore, createMutable.
 * @example
 * ```tsx
 * const [user, setUser] = createStore({
 *   role: makeOption(1)
 * });
 * <div>{user.role.unwrap() || "Role is null"}</div>
 * ```
 */
export const makeOption = <T>(value: T | null) => new Option(value);

/**
 *
 * @param value optional initial value
 * @return A new Option signal, useful for single value declerations.
 * @example
 * ```tsx
 * const [role, setRole] = createOption(1);
 * <div>{role().unwrap() || "Role is null"}</div>
 * ```
 */
export const createOption = <T>(value: T | null) => createSignal(new Option(value));

/**
 * Creates a new Option instance with the Some variant.
 * @param value required initial value
 * @return A Some value of T
 * @example
 * ```tsx
 * const user = createStore({
 *   role: Some(1)
 * });
 * <div>{user.role.unwrap() || "Role is null"}</div>
 * ```
 */

export const Some = <T extends Required<T>>(value: T) => new Option(value);

/**
 * Creates a new Option instance with the None variant.
 * @return A None value of T
 * @example
 * ```tsx
 * const user = createStore({
 *   role: None
 * });
 * <div>{user.role.unwrap() || "Role is null"}</div>
 * ```
 */

export const None = <T>() => new Option<T>(null);
