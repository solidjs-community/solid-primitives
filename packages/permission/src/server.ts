import { Accessor } from "solid-js";

/**
 * Querying the permission API
 *
 * @param name permission name (e.g. "microphone") or a PermissionDescriptor object (`{ name: ... }`)
 * @returns "unknown" | "pending" | "granted" | "rejected"
 */
export const createPermission = (
  _name: PermissionDescriptor | PermissionName
): Accessor<PermissionState | "unknown"> => {
  return () => 'unknown';
};
