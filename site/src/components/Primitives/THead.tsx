import { ParentComponent } from "solid-js";

const THead: ParentComponent = props => {
  return (
    <thead class="sticky top-[58px] z-1">
      {/* box-shadow doesn't work on thead in Safari and iOS */}
      {/* So extra row containing div to show shadow in Safari and iOS */}
      <tr
        id="header-shadow"
        aria-hidden="true"
        class="absolute top-0 left-0 right-0 h-0 -z-1 pointer-events-none transition-opacity"
        style="opacity: 0;"
      >
        <td class="h-0">
          {/* <div class="absolute h-[8px] top-0 left-0 right-0 bg-white"></div> */}
          <div class="absolute inset-0 box-shadow-[var(--table-header-box-shadow)]" />
        </td>
      </tr>
      <tr
        id="header-real-tr"
        class="[&>th:first-child]:sticky [&>th:first-child]:left-[2px] [&>th:first-child]:rounded-tl-[26px] [&>th:last-child]:rounded-tr-[26px] text-[#49494B] dark:text-[#dee2e5]"
      >
        {props.children}
      </tr>
    </thead>
  );
};

export default THead;
