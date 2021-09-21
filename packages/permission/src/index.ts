import { Accessor, createSignal, onCleanup } from "solid-js";

/**
 * Querying the permission API
 * 
 * @param name permission name (e.g. "microphone") or a PermissionDescriptor object (`{ name: ... }`)
 * @returns "unknown" | "pending" | "granted" | "rejected"
 */
export const createPermission = (
  name: PermissionDescriptor | PermissionName
): Accessor<PermissionState | "unknown"> => {
  const [permission, setPermission] = createSignal<PermissionState | "unknown">(
    "unknown"
  );
  navigator.permissions
    .query(typeof name === "string" ? { name } : name)
    .then((status) => {
      setPermission(status.state);
      const listener = () => {
        console.log('event', status.state);
        setPermission(status.state);
      };
      status.addEventListener("change", listener);
      onCleanup(() => { console.log('remove listener'); status.removeEventListener("change", listener) });
    });
  return permission;
};
