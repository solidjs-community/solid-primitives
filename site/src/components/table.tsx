import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { isIOS, isSafari } from "@solid-primitives/platform";
import { defer } from "@solid-primitives/utils";
import { createEffect, createSignal, onMount, ParentComponent } from "solid-js";
import { useLocation } from "solid-start";
import { pageWidthClass } from "~/constants";
import { doesPathnameMatchBase } from "~/utils/doesPathnameMatchBase";
import reflow from "~/utils/reflow";
import * as Header from "./Header/Header.js";

export const TR: ParentComponent = props => {
  return (
    <tr
      class="[&>td:first-child]:z-1 [&:nth-child(odd)>td:first-child]:bg-page-main-bg odd:bg-page-main-bg border-spacing-1 even:bg-[linear-gradient(90deg,#f8fafcc4,#f8fafc)] dark:even:bg-[linear-gradient(90deg,#2b3e4a,#2b3e4ae3)] [&:nth-child(even)>td:first-child]:bg-[#f8fafc] dark:[&:nth-child(even)>td:first-child]:bg-[#2b3e4a]
    [&>td:first-child]:sticky [&>td:first-child]:left-[2px]"
    >
      {props.children}
    </tr>
  );
};

export const THead: ParentComponent = props => {
  return (
    <thead class="sticky top-[58px] z-[2]">
      {/* box-shadow doesn't work on thead in Safari and iOS */}
      {/* So extra row containing div to show shadow in Safari and iOS */}
      <tr
        id="header-shadow"
        aria-hidden="true"
        class="-z-1 pointer-events-none absolute left-0 right-0 top-0 h-0 transition-opacity"
        style="opacity: 0;"
      >
        <td class="h-0">
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

export const TH: ParentComponent = props => {
  return (
    <th class="dark:bg-page-main-bg overflow-hidden text-ellipsis whitespace-nowrap bg-white px-[2px] py-1 text-[12px] sm:px-5 sm:text-sm md:text-base">
      {props.children}
    </th>
  );
};

export const TD: ParentComponent<{ withH4?: boolean }> = props => {
  if (props.withH4) {
    return (
      <td class="px-1 py-3 sm:px-3 sm:py-6">
        <h4 class="text-lg font-bold text-[#49494B] dark:text-[#dee2e5]">{props.children}</h4>
      </td>
    );
  }

  return <td class="px-1 py-1 sm:px-3 sm:py-2">{props.children}</td>;
};

export const [translateStickyTheader, setTranslateStickyTheader] = createSignal(false);

export const Table: ParentComponent = props => {
  const location = useLocation();
  const [tableRowTargets, setTableRowTargets] = createSignal<Element[]>([]);
  const [tableTarget, setTableTarget] = createSignal<Element[]>([]);
  const [headerActive, setHeaderActive] = createSignal(false);
  Header.overrideShadow(headerActive);

  // const isSmall = createMediaQuery("(max-width: 767px)");
  let tableContainerParent!: HTMLElement;
  let tableEl!: HTMLTableElement;
  let tableHeaderName!: HTMLElement;
  let tableHeader!: HTMLElement;
  let tableHeaders: HTMLTableCellElement[] = [];
  let tableFirstTableRowCells: HTMLTableCellElement[] = [];
  let tableHeaderFirstLastSiblings: HTMLTableCellElement[] = [];
  let tableHeaderRealTR!: HTMLElement;
  let tableHeaderShadowTR!: HTMLElement;
  let tableHeaderShadowStickyDiv!: HTMLDivElement;
  let tableBody!: HTMLElement;
  let tableVerticalScrollShadow!: HTMLDivElement;
  const fakeTableRow = (
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
  let tableSameWidthAsParent = false;
  let addedFakeTableRow = false;
  let prevY = 0;
  let prevTableWidth = 0;
  let prevTableContainerParentWidth = 0;
  let observeTableElInit = true;
  let setTableSizeSameAsParentInit = true;

  const pageHeaderHeight = 60;
  const tableHeaderHeight = 80;
  const rootMarginTop = tableHeaderHeight + pageHeaderHeight;

  const showActiveHeader = () => {
    if (!tableSameWidthAsParent) {
      tableHeader.style.position = "fixed";
      tableHeader.style.top = "54px";
      tableHeader.style.left = "4px";
      tableHeader.style.transform = "translateY(4px)";
      if (isSafari || isIOS) {
        tableHeaderShadowStickyDiv.style.opacity = "1";
      }
    }
    if (isSafari || isIOS) {
      tableHeaderShadowTR.style.opacity = "1";
    } else {
      tableHeader.style.boxShadow = "var(--table-header-box-shadow)";
      tableHeader.style.transition = "box-shadow 200ms";
    }
    tableHeaderFirstLastSiblings.forEach(item => {
      item.style.borderRadius = "0";
      item.style.transition = "border-radius 200ms";
    });

    setHeaderActive(true);
  };

  const hideActiveHeader = () => {
    if (!tableSameWidthAsParent) {
      const { scrollLeft } = tableContainerParent;
      tableHeader.style.position = "absolute";
      tableHeader.style.top = "0px";
      tableHeader.style.left = "0px";
      tableHeader.style.transform = `translate(${scrollLeft}px, 4px)`;
    }
    tableHeaderShadowTR.style.opacity = "0";
    tableHeaderShadowStickyDiv.style.opacity = "0";
    tableHeader.style.boxShadow = "var(--table-header-box-shadow-hide)";
    tableHeaderFirstLastSiblings.forEach(item => {
      item.style.borderRadius = "";
    });

    setHeaderActive(false);

    // refreash paint to fix painting bug in Safari
    if (isSafari || isIOS) {
      requestAnimationFrame(() => {
        tableHeader.style.top = "0.1px";
        requestAnimationFrame(() => {
          if (tableSameWidthAsParent) {
            tableHeader.style.top = "";
          } else {
            tableHeader.style.top = "0px";
          }
        });
      });
    }
  };

  const onParentScrollX = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const { scrollLeft } = target;

    if (scrollLeft > 0) {
      tableVerticalScrollShadow.style.opacity = "1";
    } else {
      tableVerticalScrollShadow.style.opacity = "0";
    }

    tableHeader.scrollLeft = scrollLeft;
    if (!headerActive()) {
      tableHeader.style.transform = `translate(${scrollLeft}px, 4px)`;
    }
  };

  const checkTableSameWidthAsParent = () => {
    const tableWidth = tableEl.clientWidth;
    const result = tableWidth <= tableContainerParent.clientWidth;
    tableSameWidthAsParent = result;
    prevTableWidth = tableWidth;
    return result;
  };

  const queryTableElements = (el: Element) => {
    tableContainerParent = el.parentElement!;
    tableEl = el as any;
    tableHeader = el.querySelector("thead")!;
    tableHeaderName = tableHeader.querySelector("th")!;
    tableHeaders = [...tableHeader.querySelectorAll("th")!];
    tableBody = tableEl.querySelector("tbody")!;
    tableFirstTableRowCells = [...tableBody.querySelector("tr")!.querySelectorAll("td")!];
    tableHeaderFirstLastSiblings = [tableHeaders[0], tableHeaders[tableHeaders.length - 1]];
    tableHeaderRealTR = tableHeader.querySelector("#header-real-tr")!;
    tableHeaderShadowTR = tableHeader.querySelector("#header-shadow")!;
  };

  const resetSizes = () => {
    // const tableContainerParentWidth = tableContainerParent.getBoundingClientRect().width;
    // const tableWidth = tableEl.getBoundingClientRect().width;
    // const tableHeaderHeight = tableHeader.getBoundingClientRect().height;
    // const tableHeadersBCRs = tableHeaders.map(item => item.getBoundingClientRect());
    tableHeaders.forEach((item, idx) => {
      item.style.maxWidth = "";
      item.style.width = "";
      item.style.height = "";
    });
    tableFirstTableRowCells.forEach((item, idx) => {
      item.style.minWidth = "";
    });

    tableHeader.style.position = "";
    tableHeader.style.top = "";
    tableHeader.style.left = "";
    tableHeader.style.height = "";
    tableHeader.style.width = "";
    tableHeader.style.overflow = "";
    tableHeader.style.transform = "";
    tableHeader.style.background = "";
    tableHeaderRealTR.style.position = "";
    tableHeaderRealTR.style.top = "";
    tableHeaderRealTR.style.left = "";
    tableHeaderRealTR.style.width = "";
    tableContainerParent.style.overflow = "";

    if (addedFakeTableRow) {
      const tableChildren = tableBody.children;
      const fakeRow = tableChildren[0];
      const hiddenRow = tableChildren[1];
      fakeRow.remove();
      hiddenRow.remove();

      addedFakeTableRow = false;
    }

    reflow();
  };

  const setTableSizeSameAsParent = () => {
    if (!setTableSizeSameAsParentInit) {
      tableHeader.style.position = "sticky";
      tableHeaderRealTR.style.position = "static";
      tableHeaderRealTR.style.width = "";
      tableHeaders.forEach(item => {
        item.style.maxWidth = "";
        item.style.width = "";
        item.style.height = "";
      });
      tableFirstTableRowCells.forEach(item => {
        item.style.minWidth = "";
      });

      setTableSizeSameAsParentInit = false;

      reflow();
    }

    const tableContainerParentWidth = tableContainerParent.getBoundingClientRect().width;
    const tableWidth = tableEl.getBoundingClientRect().width;
    const tableHeaderHeight = tableHeader.getBoundingClientRect().height;
    const tableHeadersBCRs = tableHeaders.map(item => item.getBoundingClientRect());

    tableHeaders.forEach((item, idx) => {
      if (idx === 0) {
        item.style.maxWidth = `${tableHeadersBCRs[idx].width!}px`;
      }
      item.style.width = `${tableHeadersBCRs[idx].width!}px`;
      item.style.height = `${tableHeaderHeight}px`;
    });
    tableFirstTableRowCells.forEach((item, idx) => {
      item.style.minWidth = `${tableHeadersBCRs[idx].width!}px`;
    });
    tableVerticalScrollShadow.style.left = `${tableHeadersBCRs[0].right}px`;
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
    tableHeaderShadowTR.style.height = `${tableHeaderHeight - (tableSameWidthAsParent ? 2 : 0)}px`;
    fakeTableRow[0].style.height = `${tableHeaderHeight}px`;
    tableContainerParent.style.overflow = "auto hidden";
    if (!addedFakeTableRow) {
      tableBody.insertAdjacentElement("afterbegin", fakeTableRow[1]);
      tableBody.insertAdjacentElement("afterbegin", fakeTableRow[0]);
      addedFakeTableRow = true;
    }

    if (headerActive()) {
      showActiveHeader();
    } else {
      hideActiveHeader();
    }
  };

  onMount(() => {
    queryTableElements(tableEl);
    if (isSafari || isIOS) {
      // Safari doesn't take borders into account, so subtrack 2px
      tableHeader.classList.replace("top-[58px]", "top-[56px]");
      const height = `${tableHeader.getBoundingClientRect().height - 2}px`;
      tableHeaderShadowTR.style.height = height;
      tableHeaderShadowStickyDiv.style.height = height;
    }
    tableContainerParent.addEventListener("scroll", onParentScrollX);

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const targetWidth = entry.contentBoxSize
          ? entry.contentBoxSize[0]
            ? entry.contentBoxSize[0].inlineSize
            : // @ts-ignore
              (entry.contentBoxSize.inlineSize as number)
          : entry.contentRect.width;

        if (entry.target === tableContainerParent) {
          if (prevTableContainerParentWidth === targetWidth) {
            prevTableContainerParentWidth = targetWidth;
            return;
          }
          prevTableContainerParentWidth = targetWidth;
        }

        if (entry.target === tableEl) {
          if (prevTableWidth === targetWidth) {
            prevTableWidth = targetWidth;
            return;
          }
          prevTableWidth = targetWidth;

          if (observeTableElInit) {
            observeTableElInit = false;
            return;
          }
        }

        if (!checkTableSameWidthAsParent()) {
          setTableSizeSameAsParent();
        } else {
          resetSizes();
        }
      }
    });

    const h4Els = tableEl.querySelectorAll("h4");
    // setHeaders([...h4Els].map(item => ({ name: item.textContent!, active: false })));

    // TODO: resizing logic is broken in Safari
    setTableRowTargets(() => [...h4Els]);
    setTableTarget(() => [tableEl]);
    requestAnimationFrame(() => {
      resizeObserver.observe(tableContainerParent);
      resizeObserver.observe(tableEl);

      if (isSafari || isIOS) {
        if (window.scrollY < 100) return;
        checkTableSameWidthAsParent();
        setTimeout(() => {
          setTableSizeSameAsParentInit = false;
          prevTableContainerParentWidth = tableContainerParent.clientWidth;
          setTableSizeSameAsParent();
        });
      }
    });
  });

  createIntersectionObserver(
    tableTarget,
    entries => {
      entries.forEach(entry => {
        const { isIntersecting, boundingClientRect } = entry;
        const top = boundingClientRect.top - rootMarginTop;
        const bottom = boundingClientRect.bottom - rootMarginTop;

        if (top < 0 && bottom >= 0) {
          showActiveHeader();
          return;
        }
        if (isIntersecting) return;
        // if (boundingClientRect.bottom > 0) return;
        if (bottom > 0) return;
        // if (tableSameWidthAsParent) return;

        hideActiveHeader();
      });
    },
    { rootMargin: `-${rootMarginTop}px 0px -${rootMarginTop}px 0px` },
  );

  createIntersectionObserver(
    tableRowTargets,
    entries => {
      entries.forEach(entry => {
        const { target, rootBounds, isIntersecting, boundingClientRect } = entry;
        if (boundingClientRect.bottom >= rootBounds?.bottom! && isIntersecting) {
          prevY = window.scrollY;
          return;
        }

        if (boundingClientRect.top <= rootBounds?.top! && !isIntersecting) {
          prevY = window.scrollY;
          tableHeaderName.textContent = target.textContent;

          showActiveHeader();

          return;
        }
        if (isIntersecting && prevY > window.scrollY) {
          prevY = window.scrollY;
          const els = tableRowTargets();
          const prevEl = els[els.indexOf(target) - 1];
          showActiveHeader();

          if (prevEl) {
            tableHeaderName.textContent = prevEl.textContent;
          } else {
            tableHeaderName.textContent = "Name";
            hideActiveHeader();
          }
          return;
        }
      });
    },
    { rootMargin: `-${rootMarginTop}px 0px 0px 0px` },
  );

  createEffect(
    defer(
      () => location.hash,
      (currentHash, prevHash) => {
        if (prevHash === currentHash) return;
        if (!doesPathnameMatchBase(location.pathname)) return;

        const run = () => {
          const tableElBCR = tableEl.getBoundingClientRect();

          const top = tableElBCR.top - rootMarginTop;
          const bottom = tableElBCR.bottom - rootMarginTop;

          if (top + rootMarginTop > 0) {
            tableHeaderName.textContent = "Name";
            hideActiveHeader();
            return;
          }

          if (top < 0 && bottom >= 0) {
            showActiveHeader();
            return;
          }
          // if (boundingClientRect.bottom > 0) return;
          if (bottom > 0) return;
          // if (tableSameWidthAsParent) return;

          hideActiveHeader();
        };

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            run();
            setTimeout(() => {
              run();
            });
          });
        });
      },
    ),
  );

  createEffect(
    defer(translateStickyTheader, translateStickyTheader => {
      if (!tableEl || !tableSameWidthAsParent || !headerActive()) return;

      if (translateStickyTheader) {
        const tableBCR = tableEl.getBoundingClientRect();
        const theadPositionTop = 58;
        const theadBorderWidth = 2;
        tableHeader.style.transform = `translateY(${-(
          tableBCR.top -
          (theadPositionTop - theadBorderWidth)
        )}px)`;
        return;
      } else {
        tableHeader.style.transform = "";
      }
    }),
  );

  return (
    <div class={`${pageWidthClass} isolate mx-auto`}>
      <div
        class="box-shadow-[var(--table-header-box-shadow)] pointer-events-none fixed left-0 right-0 top-[60px] z-[2] transition-opacity"
        style={{ opacity: "0" }}
        ref={tableHeaderShadowStickyDiv}
      />
      <div class="relative w-full overflow-clip rounded-[30px] pb-[5px]">
        {/* despite having overflow-clip doesn't cut off overflowing table in Safari/iOS */}
        {/* so added a inverse rounded corner to hide overflowing theader text */}
        <div
          class="inverse-corner-[size(30px)_color(var(--page-main-bg))_position(0,100%)] pointer-events-none absolute right-0 top-0 z-10"
          classList={{ hidden: !(isSafari || isIOS) }}
        />
        <div class="pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-[30px] border-[7px] border-[#E4F6F9] dark:border-[#2b455a]" />
        <div
          class="pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-[30px] border-[7px] border-[#D8DFF5] dark:border-[#2c4668]"
          style="-webkit-mask-image: linear-gradient(to right, transparent 0px, rgb(0, 0, 0)); mask-image: linear-gradient(to right, transparent 0px, rgb(0, 0, 0))"
        />
        <div
          class="pointer-events-none absolute bottom-0 left-[120.8px] top-[7px] z-10 w-[15px] bg-[linear-gradient(to_right,#24405966,#24405900)] opacity-0 transition-opacity dark:bg-[linear-gradient(to_right,#05121dbf,#05121d00)]"
          ref={tableVerticalScrollShadow}
        />
        <div class="no-scrollbar w-full overflow-x-clip rounded-[30px] bg-[linear-gradient(45deg,#D8DFF5,#E4F6F9)] p-1 pb-0 pt-[2px] dark:bg-[linear-gradient(45deg,#2c4668,#2b455a)]">
          <table
            class="relative mt-[-2px] w-full overflow-clip"
            style="border-collapse: separate; border-spacing: 2px 2px;"
            ref={tableEl}
          >
            {props.children}
          </table>
        </div>
      </div>
    </div>
  );
};
