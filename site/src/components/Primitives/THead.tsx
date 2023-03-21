import { ParentComponent } from "solid-js";

const THead: ParentComponent = props => {
  return (
    <thead class="sticky top-[58px] z-[2]">
      {/* box-shadow doesn't work on thead in Safari and iOS */}
      {/* So extra row containing div to show shadow in Safari and iOS */}
      <tr
        id="header-shadow"
        aria-hidden="true"
        class="-z-1 pointer-events-none absolute top-0 left-0 right-0 h-0 transition-opacity"
        style="opacity: 0;"
      >
        <td class="h-0">
          {/* <div class="absolute h-[8px] top-0 left-0 right-0 bg-white"></div> */}
          <div class="box-shadow-[var(--table-header-box-shadow)] absolute inset-0" />
        </td>
      </tr>
      <tr
        id="header-real-tr"
        class="text-[#49494B] dark:text-[#dee2e5] [&>th:first-child]:sticky [&>th:first-child]:left-[2px] [&>th:first-child]:overflow-clip [&>th:first-child]:text-ellipsis [&>th:first-child]:rounded-tl-[26px] [&>th:last-child]:rounded-tr-[26px]"
      >
        {props.children}
      </tr>
    </thead>
  );
};

export default THead;
