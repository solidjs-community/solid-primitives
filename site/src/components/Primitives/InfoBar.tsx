import { Component } from "solid-js";
import { PackageData } from "~/types";
import { SizeBadgePill } from "./SizeBadge";
import { StageBadgePill } from "./StageBadge";
import { VersionBadgePill } from "./VersionBadge";

const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
// const bundlephobiaURL = "https://bundlephobia.com/package/";
const npmShield = "https://img.shields.io/npm/v/";
// const stageShieldBaseURL =
//   "https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-"; // add "<stage>.json" after
// const stageShieldLink =
//   "https://github.com/solidjs-community/solid-primitives#contribution-process";
// const githubRepo = "https://github.com/solidjs-community/solid-primitives";

export const getSizeShield = (name: string) => `${sizeShield}${name}.json`;
export const getNPMShield = (name: string) => `${npmShield}${name}.json`;

const InfoBar: Component<{
  name: string;
  packageName: string;
  packageSize: PackageData["packageSize"] | undefined;
  stage: PackageData["stage"] | undefined;
  primitives: PackageData["primitives"] | undefined;
}> = props => {
  // const githubRepoPrimitve = () => `${githubRepo}/tree/main/packages/${props.name}`;
  return (
    <div class="flex flex-wrap gap-2">
      <SizeBadgePill
        // href={`${bundlephobiaURL}/${props.packageName}`}
        name={props.name}
        packageSize={props.packageSize || undefined}
        primitives={props.primitives || []}
      />
      <VersionBadgePill name={props.name} />
      <StageBadgePill value={props.stage} />
    </div>
  );
};

export default InfoBar;
