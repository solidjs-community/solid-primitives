import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";

/**
 * Querying the permission API
 *
 * @param name permission name (e.g. "microphone") or a PermissionDescriptor object (`{ name: ... }`)
 * @returns "unknown" | "denied" | "granted" | "prompt"
 */
export const createPermission = (
  name: PermissionDescriptor | PermissionName | "microphone" | "camera",
): Accessor<PermissionState | "unknown"> => {
  if (isServer) {
    return () => "unknown";
  }
  const [permission, setPermission] = createSignal<PermissionState | "unknown">("unknown", {
    ownedWrite: true,
  });
  const [status, setStatus] = createSignal<PermissionStatus | undefined>(undefined, {
    ownedWrite: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (navigator) {
    navigator.permissions
      .query(typeof name === "string" ? { name } : name)
      .then(s => setStatus(() => s))
      .catch(error => {
        if (error.name !== "TypeError" || (name !== "microphone" && name !== "camera")) {
          return;
        }
        // firefox will not allow us to read media permissions,
        // so we need to wrap getUserMedia in order to get them:
        // TODO: only set to prompt if devices are available
        setPermission("prompt");
        const constraint = name === "camera" ? "video" : "audio";
        const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = constraints =>
          constraints?.[constraint]
            ? getUserMedia(constraints)
                .then(stream => (setPermission("granted"), stream))
                .catch(error => {
                  if (/not allowed/.test(error.message)) {
                    setPermission("denied");
                  }
                  return Promise.reject(error);
                })
            : getUserMedia(constraints);
      });
    let removeChangeListener: VoidFunction | undefined;

    createEffect(
      () => status(),
      currentStatus => {
        removeChangeListener?.();
        removeChangeListener = undefined;
        if (currentStatus) {
          setPermission(currentStatus.state);
          const listener = () => setPermission(currentStatus.state);
          currentStatus.addEventListener("change", listener);
          removeChangeListener = () => currentStatus.removeEventListener("change", listener);
        }
      },
    );

    onCleanup(() => removeChangeListener?.());
  }
  return permission;
};
