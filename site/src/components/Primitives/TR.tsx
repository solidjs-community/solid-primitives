import { ParentComponent } from "solid-js";

const TR: ParentComponent = props => {
  return (
    <tr
      class="[&>td:first-child]:sticky [&>td:first-child]:z-1 [&>td:first-child]:left-[2px] [&:nth-child(even)>td:first-child]:bg-[#f8fafc] [&:nth-child(odd)>td:first-child]:bg-page-main-bg even:bg-[linear-gradient(90deg,#f8fafcc4,#f8fafc)] odd:bg-page-main-bg border-spacing-1
    dark:even:bg-[linear-gradient(90deg,#2b3e4a,#2b3e4ae3)] dark:[&:nth-child(even)>td:first-child]:bg-[#2b3e4a]"
    >
      {props.children}
    </tr>
  );
};

export default TR;
