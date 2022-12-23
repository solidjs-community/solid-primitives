import { ParentComponent } from "solid-js";

const THead: ParentComponent = props => {
  return (
    <thead class="sticky top-[58px] z-1">
      <tr
        id="header-shadow"
        aria-hidden="true"
        class="absolute top-0 left-0 h-full w-full -z-1 pointer-events-none transition-opacity"
        style="opacity: 0;"
      >
        <td class="w-full h-full absolute top-0">
          {/* <div class="absolute h-[8px] top-0 left-0 right-0 bg-white"></div> */}
          <div
            class="absolute h-full"
            style="box-shadow: 0px 8px 14px 0px #24405966; border-radius: 30px; top: 0px; left: 20px; right: 20px;"
          ></div>
        </td>
      </tr>
      <tr
        id="header-real-tr"
        class="[&>th:first-child]:sticky [&>th:first-child]:left-[2px] [&>th:first-child]:rounded-tl-[26px] [&>th:last-child]:rounded-tr-[26px] text-[#49494B]"
      >
        {props.children}
      </tr>
    </thead>
  );
};

export default THead;
