import { Accessor, createSignal, onCleanup } from "solid-js";

/**
 * Querying the permission API
 *
 * @param name permission name (e.g. "microphone") or a PermissionDescriptor object (`{ name: ... }`)
 * @returns "unknown" | "denied" | "granted" | "prompt"
 */
export const createPermission = (
  name: PermissionDescriptor | PermissionName | "microphone" | "camera"
): Accessor<PermissionState | "unknown"> => {
  const [permission, setPermission] = createSignal<PermissionState | "unknown">("unknown");
  if (navigator) {
    navigator.permissions
      .query(typeof name === "string" ? { name: name as PermissionName } : name)
      .then(status => {
        setPermission(status.state);
        const listener = () => setPermission(status.state);
        status.addEventListener("change", listener);
        onCleanup(() => status.removeEventListener("change", listener));
      })
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
  }
  return permission;
};
