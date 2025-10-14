import { type Component } from "solid-js";

const BundleSizeWrapper: Component<{ value: number; unit: string }> = ({ unit, value }) => {
  return (
    <span>
      {value} <span class="font-semibold opacity-50">{unit}</span>
    </span>
  );
};

export default BundleSizeWrapper;
