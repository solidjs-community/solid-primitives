import { Component } from "solid-js";
import CopyPackage from "./CopyPackage";

const CopyPackages: Component<{ packageName: string }> = ({ packageName }) => {
  return (
    <div class="w-full [&>div]:my-4 [@media(min-width:470px)]:w-fit">
      <CopyPackage type="npm" packageName={packageName} />
      <CopyPackage type="yarn" packageName={packageName} />
      <CopyPackage type="pnpm" packageName={packageName} />
    </div>
  );
};

export default CopyPackages;
