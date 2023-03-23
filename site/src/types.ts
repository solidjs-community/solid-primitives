import type { ModuleData } from "../../scripts/get-modules-data";

export type Bundlesize = {
  min: string;
  gzip: string;
};

export type BundlesizeItem = Bundlesize & {
  name: string;
};

export type PackageListItem = Omit<ModuleData, "primitives"> & {
  primitives: BundlesizeItem[];
  packageSize: Bundlesize | null;
};

export type PackageData = PackageListItem & { readme: string };

export const GITHUB_REPO = "https://github.com/solidjs-community/solid-primitives";
