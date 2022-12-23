import { createIntersectionObserver, withDirection } from "@solid-primitives/intersection-observer";
import { createMediaQuery } from "@solid-primitives/media";
import { isIOS, isSafari } from "@solid-primitives/platform";
import { createSignal, onMount, ParentComponent } from "solid-js";
import StageModal from "../Stage/StageModal";

const Table: ParentComponent = props => {
  const [targets, setTargets] = createSignal<Element[]>([]);
  const [headerActive, setHeaderActive] = createSignal(false);
  // const isSmall = createMediaQuery("(max-width: 767px)");
  let tableContainerParent!: HTMLElement;
  let tableEl!: HTMLTableElement;
  let tableHeaderName!: HTMLElement;
  let tableHeader!: HTMLElement;
  let tableHeaderShadowEl!: HTMLElement;
  let tableHeaders: HTMLTableCellElement[] = [];
  let tableFirstTableRowCells: HTMLTableCellElement[] = [];
  let tableHeaderFirstLastSiblings: HTMLTableCellElement[] = [];
  let tableHeaderRealTR!: HTMLElement;
  let tableBody!: HTMLElement;
  let tableHorizontalScrollShadow!: HTMLElement;
  let pageHeader: HTMLElement;
  let fakeTableRow = (
    <>
      <tr aria-hidden="true" style="visibility: hidden;">
        <td aria-hidden="true" style="visibility: hidden;"></td>
      </tr>
      {/* To preserve odd/even row colors */}
      <tr aria-hidden="true" style="display: none;">
        <td aria-hidden="true"></td>
      </tr>
    </>
  ) as HTMLElement[];
  const [headers, setHeaders] = createSignal<{ name: string; active: boolean }[]>([]);
  let prevY = 0;

  const pageHeaderHeight = 60;
  const tableHeaderHeight = 80;
  const rootMarginTop = tableHeaderHeight + pageHeaderHeight;

  const showActiveHeader = () => {
    tableHeader.style.position = "fixed";
    tableHeader.style.top = "54px";
    tableHeader.style.left = "4px";
    // 0px 16px 14px -10px #24405966
    tableHeader.style.boxShadow = "0px 16px 14px -10px #24405966";
    tableHeader.style.transition = "box-shadow 200ms";
    tableHeader.style.transform = "translateY(4px)";
    pageHeader.style.borderBottom = "2px solid transparent";
    pageHeader.style.borderImage = "linear-gradient(to right,#E4F6F9,#D8DFF5) 1";
    // tableHeaderShadowEl.style.opacity = "1";
    tableHeaderFirstLastSiblings.forEach(item => {
      item.style.borderRadius = "0";
      item.style.transition = "border-radius 200ms";
    });

    setHeaderActive(true);
  };
  const hideActiveHeader = () => {
    const { scrollLeft } = tableContainerParent;
    tableHeader.style.position = "absolute";
    tableHeader.style.top = "0px";
    tableHeader.style.left = "0px";
    tableHeader.style.boxShadow = "0px 16px 14px -10px #24405900";
    tableHeader.style.transform = `translate(${scrollLeft}px, 4px)`;
    pageHeader.style.borderBottom = "";
    pageHeader.style.borderImage = "";
    // tableHeaderShadowEl.style.opacity = "0";
    tableHeaderFirstLastSiblings.forEach(item => {
      item.style.borderRadius = "";
    });

    setHeaderActive(false);

    // refreash paint to fix painting bug in Safari
    if (isSafari || isIOS) {
      requestAnimationFrame(() => {
        tableHeader.style.top = "0.1px";
        requestAnimationFrame(() => {
          tableHeader.style.top = "0px";
        });
      });
    }
  };

  const onParentScrollX = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const { scrollLeft } = target;

    if (scrollLeft > 0) {
      tableHorizontalScrollShadow.style.opacity = "1";
    } else {
      tableHorizontalScrollShadow.style.opacity = "0";
    }

    tableHeader.scrollLeft = scrollLeft;
    if (!headerActive()) {
      tableHeader.style.transform = `translate(${scrollLeft}px, 4px)`;
    }
  };

  createIntersectionObserver(
    targets,
    entries => {
      entries.forEach(entry => {
        const { target, rootBounds, isIntersecting, boundingClientRect } = entry;
        if (boundingClientRect.bottom >= rootBounds?.bottom! && isIntersecting) {
          prevY = window.scrollY;
          return;
        }
        // if (isIntersecting) return;

        if (boundingClientRect.top <= rootBounds?.top! && !isIntersecting) {
          prevY = window.scrollY;
          // console.log(target, boundingClientRect, rootBounds);
          tableHeaderName.textContent = target.textContent;
          // tableHeaderShadowEl.style.opacity = "1";
          showActiveHeader();

          return;
        }
        if (isIntersecting && prevY > window.scrollY) {
          prevY = window.scrollY;
          console.log("get TOP!!!!", target);
          const els = targets();
          const prevEl = els[els.indexOf(target) - 1];
          // tableHeaderShadowEl.style.opacity = "1";
          showActiveHeader();

          if (prevEl) {
            tableHeaderName.textContent = prevEl.textContent;
          } else {
            tableHeaderName.textContent = "Name";
            // tableHeaderShadowEl.style.opacity = "0";
            hideActiveHeader();
          }
          return;
        }

        // console.log(target, !isIntersecting);
      });
    },
    { rootMargin: `-${rootMarginTop}px 0px 0px 0px` }
  );

  const tableSameWidthAsParent = () => {
    return tableEl.clientWidth <= tableContainerParent.clientWidth;
  };

  const setTableSizeSameAsParent = () => {
    // set tableHeaderCells on fixed width based on bcr
    // set tableBodyFirstRowCells on min-width based tabledHeaderCells bcr

    const tableContainerParentWidth = tableContainerParent.getBoundingClientRect().width;
    const tableWidth = tableEl.getBoundingClientRect().width;
    const tableHeaderHeight = tableHeader.getBoundingClientRect().height;
    const tableHeadersBCRs = tableHeaders.map(item => item.getBoundingClientRect());
    tableHeaders.forEach((item, idx) => {
      item.style.width = `${tableHeadersBCRs[idx].width!}px`;
      item.style.height = `${tableHeaderHeight}px`;
    });
    tableFirstTableRowCells.forEach((item, idx) => {
      item.style.minWidth = `${tableHeadersBCRs[idx].width!}px`;
    });
    tableHeader.style.position = "absolute";
    tableHeader.style.top = "0px";
    tableHeader.style.left = "0px";
    tableHeader.style.width = `${tableContainerParentWidth}px`;
    tableHeader.style.height = `${tableHeaderHeight}px`;
    tableHeader.style.background = "none";
    tableHeader.style.transform = "translateY(4px)";
    tableHeader.classList.add("no-scrollbar");
    tableHeader.style.overflowX = "scroll";
    tableHeader.style.overflowY = "hidden";
    tableHeader.style.boxShadow = "0px 16px 14px -10px #24405900";
    tableHeaderRealTR.style.position = "absolute";
    tableHeaderRealTR.style.top = "0px";
    tableHeaderRealTR.style.left = "0px";
    tableHeaderRealTR.style.width = `${tableWidth + 8}px`;
    fakeTableRow[0].style.height = `${tableHeaderHeight}px`;
    tableContainerParent.style.overflow = "auto hidden";
    tableBody.insertAdjacentElement("afterbegin", fakeTableRow[1]);
    tableBody.insertAdjacentElement("afterbegin", fakeTableRow[0]);

    // tableHeader.style
    // tableHeader.style.position = 'fixed'
  };

  onMount(() => {
    tableContainerParent.addEventListener("scroll", onParentScrollX);
    if (!tableSameWidthAsParent()) {
      // setTimeout(() => {
      setTableSizeSameAsParent();
      // }, 50);
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === tableContainerParent) {
          // remove min-width values on tableBodyFirstRowCells
        }
        if (!tableSameWidthAsParent()) {
          setTableSizeSameAsParent();
          // renderSmallerTable
        }
        //         if (entry.contentBoxSize) {
        //           // Firefox implements `contentBoxSize` as a single content rect, rather than an array
        //           const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
        //
        //         } else {
        //
        //         }
      }
    });

    // resizeObserver.observe(tableEl);

    const h4Els = tableEl.querySelectorAll("h4");
    // setHeaders([...h4Els].map(item => ({ name: item.textContent!, active: false })));

    setTargets(() => [...h4Els]);
  });

  return (
    <div class="max-w-[900px] mx-auto isolate">
      <div class="w-full relative">
        <div class="absolute top-0 left-0 w-full h-full border-[#E4F6F9] border-[7px] rounded-[30px] pointer-events-none z-10" />
        <div
          class="absolute top-0 left-0 w-full h-full border-[#D8DFF5] border-[7px] rounded-[30px] pointer-events-none z-10"
          style="-webkit-mask-image: linear-gradient(to right, transparent 0px, rgb(0, 0, 0)); mask-image: linear-gradient(to right, transparent 0px, rgb(0, 0, 0))"
        />
        <div
          id="table-horizontal-scroll-shadow"
          class="absolute top-[7px] bottom-0 left-[120.8px] w-[15px] z-10 opacity-0 transition-opacity"
          style="background-image: linear-gradient(to right, #24405966, #24405900)"
        />
        <div
          class="w-full rounded-[30px] overflow-x-clip p-1 pt-[2px]"
          style="background: linear-gradient(45deg,#D8DFF5, #E4F6F9)"
        >
          <table
            class="w-full relative mt-[-2px] overflow-clip"
            style="border-collapse: separate; border-spacing: 2px 2px;"
            ref={el => {
              tableContainerParent = el.parentElement!;
              tableEl = el;
              tableHeader = el.querySelector("thead")!;
              tableHeaderName = tableHeader.querySelector("th")!;
              tableHeaders = [...tableHeader.querySelectorAll("th")!];
              tableBody = tableEl.querySelector("tbody")!;
              tableFirstTableRowCells = [...tableBody.querySelector("tr")!.querySelectorAll("td")!];
              tableHeaderFirstLastSiblings = [
                tableHeaders[0],
                tableHeaders[tableHeaders.length - 1]
              ];
              tableHeaderShadowEl = tableHeader.querySelector("#header-shadow")!;
              tableHeaderRealTR = tableHeader.querySelector("#header-real-tr")!;
              tableHorizontalScrollShadow = document.getElementById(
                "table-horizontal-scroll-shadow"
              )!;
              pageHeader = document.querySelector("header div")!;
            }}
          >
            {props.children}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
