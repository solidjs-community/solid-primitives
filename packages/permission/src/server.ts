import { Accessor } from "solid-js";

/**
 * Querying the permission API
 *
 * @param name permission name (e.g. "microphone") or a PermissionDescriptor object (`{ name: ... }`)
 * @returns "unknown" | "denied" | "granted" | "prompt"
 */
export const createPermission = (
  _name: PermissionDescriptor | PermissionName
): Accessor<PermissionState | "unknown"> => {
  return () => "unknown";
};
