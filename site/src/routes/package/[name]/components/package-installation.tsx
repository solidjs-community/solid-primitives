import { writeClipboard } from "@solid-primitives/clipboard";
import { debounce } from "@solid-primitives/scheduled";
import { Component, createSignal } from "solid-js";
import NpmLogo from "~/components/Icons/NpmLogo";
import NpmMonochrome from "~/components/Icons/NpmMonochrome";
import PnpmLogo from "~/components/Icons/PnpmLogo";
import PnpmMonochrome from "~/components/Icons/PnpmMonochrome";
import YarnLogo from "~/components/Icons/YarnLogo";
import YarnMonochrome from "~/components/Icons/YarnMonochrome";

const CopyPackage: Component<{ type: "npm" | "yarn" | "pnpm"; packageName: string }> = props => {
  const [hasCopied, setHasCopied] = createSignal(false);

  const getAriaLabel = (managerName: string) => {
    return `Copy ${managerName} install script to clipboard`;
  };

  const packageManagers = {
    npm: {
      monochromeLogo: NpmMonochrome,
      logo: NpmLogo,
      text: `${props.type} install ${props.packageName}`,
      ariaLabel: getAriaLabel("NPM"),
    },
    yarn: {
      monochromeLogo: YarnMonochrome,
      logo: YarnLogo,
      text: `${props.type} add ${props.packageName}`,
      ariaLabel: getAriaLabel("Yarn"),
    },
    pnpm: {
      monochromeLogo: PnpmMonochrome,
      logo: PnpmLogo,
      text: `${props.type} add ${props.packageName}`,
      ariaLabel: getAriaLabel("PNPM"),
    },
  };

  const setHasCopiedDebounced = debounce(() => setHasCopied(false), 1500);

  const copyToClipboard = async () => {
    try {
      await writeClipboard(packageManagers[props.type].text);
      setHasCopied(true);
      setHasCopiedDebounced();
    } catch (err) {}
  };

  const onCopyClick = () => {
    copyToClipboard();
  };

  return (
    <div class="relative my-4 flex h-[40px] items-center">
      <button
        class="group flex h-full items-center gap-2 rounded-l-lg border border-[#99999a] px-2 pl-3 font-semibold text-[#555] transition-colors hover:border-[#0030b1] dark:text-[#ccc] dark:hover:border-[#b1bfe4]"
        aria-label={packageManagers[props.type].ariaLabel}
        onClick={onCopyClick}
      >
        <div class="transition-colors group-hover:text-black dark:group-hover:text-white">
          {hasCopied() ? "Copied!" : "Copy"}
        </div>
        <div class="relative h-full py-2">
          <div class="relative flex h-full w-[40px] items-center justify-center transition-opacity delay-[0] group-hover:opacity-0 group-hover:delay-100">
            {packageManagers[props.type].monochromeLogo()}
          </div>
          <div class="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center py-2 opacity-0 transition-opacity group-hover:opacity-100">
            {packageManagers[props.type].logo()}
          </div>
        </div>

        <div class="group-hover:box-shadow-[0_5px_0_0_#c5d4e4] dark:group-hover:box-shadow-[0_5px_0_0_#3f5d73] pointer-events-none absolute top-0 left-0 bottom-0 right-0 rounded-lg border border-transparent transition-[border-color_box-shadow] group-hover:border-[#0030b1] dark:group-hover:border-[#b1bfe4]" />
      </button>
      <div
        class="xs:text-sm flex h-full flex-grow items-center
        overflow-auto whitespace-nowrap rounded-r-lg border border-l-0 border-[#99999a] px-3
      pr-3 font-mono text-[13px] font-semibold text-gray-700 dark:text-gray-300 sm:text-base"
      >
        {packageManagers[props.type].text}
      </div>
    </div>
  );
};

export const PackageInstallation: Component<{ packageName: string }> = props => {
  return (
    <div class="w-full [&>div]:my-4 [@media(min-width:470px)]:w-fit">
      {(["npm", "yarn", "pnpm"] as const).map(type => (
        <CopyPackage type={type} packageName={props.packageName} />
      ))}
    </div>
  );
};
