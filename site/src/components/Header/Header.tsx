// TEMP: stubbed during Solid 2 migration to bypass workspace packages that
// still use Solid 1 APIs (onMount, solid-js/web, etc.). Re-enable once those
// packages have been migrated.
import { type Accessor, type Component } from "solid-js";

export const HEADER_HEIGHT = 60;
export const PRIMITIVE_PAGE_PADDING_TOP = 140;

export const isScrollEnabled: Accessor<boolean> = () => true;
export const setScrollEnabled = (_v: boolean): void => {};
export function overrideShadow(_signal: Accessor<boolean>): void {}

const Header: Component = () => null;
export default Header;
