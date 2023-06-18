import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * Returns an accessor for a boolean - containing the current tab visibility.
 *
 * @return The current tab visibility as an accessor
 */
export const useTabVisibility = () => {
  const [isFocused, setIsFocused] = createSignal(
    isServer ? true : document.visibilityState === "visible",
  );
  if (!isServer) {
    document.onvisibilitychange = () => {
      setIsFocused(document.visibilityState === "visible");
    };
  }
  return isFocused;
};
