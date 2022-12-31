import { createEffect, createSignal, ParentComponent } from "solid-js";
import {
  createIntersectionObserver,
  createVisibilityObserver
} from "@solid-primitives/intersection-observer";
import { isServer } from "solid-js/web";

let table: HTMLTableElement | null = null;
const TD: ParentComponent<{ h4?: boolean }> = props => {
  // const [targets, setTargets] = createSignal<Element[]>([]);

  if (props.h4) {
    let el!: HTMLTableDataCellElement;

    const getRoot = () => {
      return null;
      if (isServer) return null;
      if (table) return table;

      table = document.querySelector("table");
      return table;
    };
    //     const useVisibilityObserver = createVisibilityObserver({ threshold: 1, root: getRoot() });
    //     const visible = useVisibilityObserver(() => el);
    //
    //     createEffect(() => {
    //       console.log(props.children, visible());
    //     });

    return (
      <td ref={el} class="px-1 py-3 sm:px-3 sm:py-6">
        <h4 class="font-bold text-lg text-[#49494B] dark:text-[#dee2e5]">{props.children}</h4>
      </td>
    );
  }
  return <td class="px-1 py-1 sm:px-3 sm:py-2">{props.children}</td>;
};

export default TD;
