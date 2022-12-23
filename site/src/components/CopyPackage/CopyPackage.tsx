import { Component, Match, Switch } from "solid-js";
import NpmLogo from "../Icons/NpmLogo";
import NpmMonochrome from "../Icons/NpmMonochrome";
import PnpmLogo from "../Icons/PnpmLogo";
import PnpmMonochrome from "../Icons/PnpmMonochrome";
import YarnLogo from "../Icons/YarnLogo";
import YarnMonochrome from "../Icons/YarnMonochrome";

const CopyPackage: Component<{ type: "npm" | "yarn" | "pnpm"; packageName: string }> = ({
  type,
  packageName
}) => {
  const getAriaLabel = (managerName: string) => {
    return `Copy ${managerName} install script to clipboard`;
  };

  const packageManagers = {
    npm: {
      monochromeLogo: NpmMonochrome,
      logo: NpmLogo,
      text: `${type} install ${packageName}`,
      ariaLabel: getAriaLabel("NPM")
    },
    yarn: {
      monochromeLogo: YarnMonochrome,
      logo: YarnLogo,
      text: `${type} add ${packageName}`,
      ariaLabel: getAriaLabel("Yarn")
    },
    pnpm: {
      monochromeLogo: PnpmMonochrome,
      logo: PnpmLogo,
      text: `${type} add ${packageName}`,
      ariaLabel: getAriaLabel("PNPM")
    }
  };

  return (
    <div class="relative flex items-center h-[40px] my-4">
      <button
        class="h-full group flex gap-2 items-center border border-[#99999a] rounded-l-lg font-semibold px-2 pl-3 text-[#555] hover:border-[#0030b1] transition-colors"
        aria-label={packageManagers[type].ariaLabel}
      >
        <div class="group-hover:text-black transition-colors">Copy</div>
        <div class="relative h-full py-2">
          <div class="flex justify-center items-center h-full w-[40px] relative delay-[0] transition-opacity group-hover:opacity-0 group-hover:delay-100">
            {packageManagers[type].monochromeLogo()}
          </div>
          <div class="flex justify-center items-center py-2 absolute top-0 left-0 bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {packageManagers[type].logo()}
          </div>
        </div>

        <div class="absolute top-0 left-0 bottom-0 right-0 rounded-lg pointer-events-none border border-transparent group-hover:border-[#0030b1] group-hover:box-shadow-[0_5px_0_0_#c5d4e4] transition-[border-color_box-shadow]" />
      </button>
      <div class="flex-grow h-full border border-[#99999a] border-l-0 rounded-r-lg flex items-center px-2 pr-3 text-[13px] xs:text-sm sm:text-base whitespace-nowrap overflow-auto">
        {packageManagers[type].text}
      </div>
    </div>
  );
};

export default CopyPackage;
