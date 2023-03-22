import type { ModuleData } from "../../scripts/get-modules-data";

export type PackageData = ModuleData & {
  readme: string;
  exports: {
    name: string;
    min: string;
    gzip: string;
  }[];
  packageSize: {
    min: string;
    gzip: string;
  } | null;
};
