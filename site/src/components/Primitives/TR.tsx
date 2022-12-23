import { ParentComponent } from "solid-js";

const TR: ParentComponent = props => {
  return (
    <tr class="[&>td:first-child]:sticky [&>td:first-child]:left-[2px] [&:nth-child(even)>td:first-child]:bg-[#f8fafc] [&:nth-child(odd)>td:first-child]:bg-white even:bg-[linear-gradient(90deg,#f8fafcc4,#f8fafc)] odd:bg-white border-spacing-1">
      {props.children}
    </tr>
  );
};

export default TR;
