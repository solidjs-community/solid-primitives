/**
 * Creates a method that is called.
 *

  * @param {Function} callback The callback to debounce
  * @param {number} wait The duration to debounce
  * @returns {Function} The debounced callback
 * 
 * @example
 * ```ts
 * const [trigger, clear] = createDebounce(() => console.log('hi'), 250, false));
 * trigger('my-new-value');
 * console.log(value());
 * ```
 */
 const createDebounce = (
  func: Function,
  wait: number,
  immediate: boolean = false
) => {
  let timerId: number | null;
  const clear = () => clearTimeout(timerId!);
  function fn() {
    const context = this,
      args = arguments;
    const later = () => {
      timerId = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timerId;
    clear();
    timerId = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
  return [fn, clear];
};

export default createDebounce;
