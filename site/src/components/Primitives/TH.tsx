import { ParentComponent } from "solid-js";

const TH: ParentComponent = props => {
  return (
    <th class="py-3 pb-1 px-[2px] sm:px-5 bg-white text-[12px] sm:text-base">{props.children}</th>
  );
};

export default TH;
