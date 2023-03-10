import { BASE, BASE_NOFS } from "~/constants";

export const doesPathnameMatchBase = (pathname: string) =>
  pathname === BASE || pathname === BASE_NOFS;
