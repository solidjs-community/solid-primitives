import { ParentComponent } from "solid-js";

const TD: ParentComponent<{ h4?: boolean }> = props => {
  if (props.h4) {
    let el!: HTMLTableDataCellElement;

    return (
      <td ref={el} class="px-1 py-3 sm:px-3 sm:py-6">
        <h4 class="font-bold text-lg text-[#49494B] dark:text-[#dee2e5]">{props.children}</h4>
      </td>
    );
  }
  return <td class="px-1 py-1 sm:px-3 sm:py-2">{props.children}</td>;
};

export default TD;
