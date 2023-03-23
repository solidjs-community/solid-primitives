import { isServer } from "solid-js/web";
import { PackageData, PackageListItem } from "./types";

const GEN_DIR = "_generated";

let packageList: PackageListItem[] | null = null;

export function getCachedPackageListItemData(name: string): PackageListItem | null {
  if (isServer) {
    return null;
  }

  if (!packageList) {
    fetchPackageList();
    return null;
  }

  return packageList.find(item => item.name === name) ?? null;
}

export async function fetchPackageData(name: string): Promise<PackageData> {
  return import(`./${GEN_DIR}/packages/${name}.json`);
}

export async function fetchPackageList(): Promise<PackageListItem[]> {
  const data = (await import(`./${GEN_DIR}/packages.json`)).default as PackageListItem[];

  if (!isServer) {
    packageList = data;
  }

  return data;
}
