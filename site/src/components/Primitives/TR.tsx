import { ParentComponent } from "solid-js";

const TR: ParentComponent = props => {
  return (
    <tr
      class="[&>td:first-child]:sticky [&>td:first-child]:left-[2px] [&:nth-child(even)>td:first-child]:bg-[#f8fafc] [&:nth-child(odd)>td:first-child]:bg-page-main-bg even:bg-[linear-gradient(90deg,#f8fafcc4,#f8fafc)] odd:bg-page-main-bg border-spacing-1
    dark:even:bg-[linear-gradient(90deg,#2d414e,#2d414ee3)] dark:[&:nth-child(even)>td:first-child]:bg-[#2d414e]"
    >
      {props.children}
    </tr>
  );
};

export default TR;
