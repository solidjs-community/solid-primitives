import type { ModuleData } from "../../scripts/get-modules-data";

export type Bundlesize = {
  min: string;
  gzip: string;
};

export type BundlesizeItem = Bundlesize & {
  name: string;
};

export type PackageData = Omit<ModuleData, "primitives"> & {
  readme: string;
  primitives: BundlesizeItem[];
  packageSize: Bundlesize | null;
};

export const GITHUB_REPO = "https://github.com/solidjs-community/solid-primitives";
