import { ParentComponent } from "solid-js";

const TH: ParentComponent = props => {
  return (
    <th class="dark:bg-page-main-bg overflow-hidden text-ellipsis whitespace-nowrap bg-white px-[2px] py-1 text-[12px] sm:px-5 sm:text-sm md:text-base">
      {props.children}
    </th>
  );
};

export default TH;
