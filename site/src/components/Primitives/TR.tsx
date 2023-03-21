import { ParentComponent } from "solid-js";

const TR: ParentComponent = props => {
  return (
    <tr
      class="[&>td:first-child]:z-1 [&:nth-child(odd)>td:first-child]:bg-page-main-bg odd:bg-page-main-bg border-spacing-1 even:bg-[linear-gradient(90deg,#f8fafcc4,#f8fafc)] dark:even:bg-[linear-gradient(90deg,#2b3e4a,#2b3e4ae3)] [&:nth-child(even)>td:first-child]:bg-[#f8fafc] dark:[&:nth-child(even)>td:first-child]:bg-[#2b3e4a]
    [&>td:first-child]:sticky [&>td:first-child]:left-[2px]"
    >
      {props.children}
    </tr>
  );
};

export default TR;
