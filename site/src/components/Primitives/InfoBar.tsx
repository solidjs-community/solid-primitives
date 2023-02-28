import { FaBrandsGithub } from "solid-icons/fa";
import { Component } from "solid-js";
import { TBundleSizeItem } from "../BundleSizeModal/BundleSizeModal";
import SizeBadge, { SizeBadgePill } from "./SizeBadge";
import StageBadge, { StageBadgePill } from "./StageBadge";
import VersionBadge, { VersionBadgePill } from "./VersionBadge";

const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
const bundlephobiaURL = "https://bundlephobia.com/package/";
const npmShield = "https://img.shields.io/npm/v/";
const npmURL = "https://www.npmjs.com/package/";
const stageShieldBaseURL =
  "https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-"; // add "<stage>.json" after
const stageShieldLink =
  "https://github.com/solidjs-community/solid-primitives#contribution-process";
const githubRepo = "https://github.com/solidjs-community/solid-primitives";

export const getSizeShield = (name: string) => `${sizeShield}${name}.json`;
export const getNPMShield = (name: string) => `${npmShield}${name}.json`;

const InfoBar: Component<{
  packageName: string;
  name: string;
  stage: number;

  packageList: TBundleSizeItem[];
  primitiveList: TBundleSizeItem[];
}> = ({ name, packageName, stage, packageList, primitiveList }) => {
  const githubRepoPrimitve = `${githubRepo}/tree/main/packages/${name}`;
  const bundlephobiaFullURL = `${bundlephobiaURL}/${packageName}`;
  const npmFullURL = `${npmURL}/${packageName}`;
  return (
    <div class="flex gap-2 flex-wrap">
      <SizeBadgePill
        value="https://img.shields.io/bundlephobia/minzip/@solid-primitives/active-element.json"
        href={bundlephobiaFullURL}
        packageList={packageList}
        primitiveList={primitiveList}
      />
      <VersionBadgePill
        value="https://img.shields.io/npm/v/@solid-primitives/active-element.json"
        href={npmFullURL}
      />
      <StageBadgePill value={stage} />
    </div>
  );
};

export default InfoBar;
