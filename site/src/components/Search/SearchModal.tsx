// import { createShortcut } from "@solid-primitives/keyboard";
import { createMediaQuery } from "@solid-primitives/media";
import { isIOS } from "@solid-primitives/platform";
import { defer } from "@solid-primitives/utils";
import Dismiss from "solid-dismiss";
import { Component, createEffect, onMount } from "solid-js";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import { doesPathnameMatchBase } from "~/utils/doesPathnameMatchBase";
import { scrollIntoView } from "~/utils/scrollIntoView";
import * as Header from "../Header/Header";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: HTMLElement;
  open: boolean;
  setOpen: (value: boolean) => void;
}> = props => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  let prevPathname = "";
  let prevHash = "";
  let rootApp!: HTMLElement;
  let containerEl!: HTMLElement;
  let dialogEl!: HTMLDivElement;
  const location = useLocation();

  let prevScrollY = 0;

  const changePageLayout = () => {
    const rootAppBCR = rootApp.getBoundingClientRect();
    const { scrollY } = window;

    rootApp.style.position = "fixed";
    rootApp.style.top = `${rootAppBCR.top}px`;
    rootApp.style.left = "0";
    rootApp.style.right = "0";

    prevScrollY = scrollY;

    // scroll top to 1 instead of 0, to prevent iOS Safari navigation bar to fully expand if it was previously collapsed.
    window.scrollTo({ top: 1 });
  };

  const restorePageLayout = () => {
    rootApp.style.position = "";
    rootApp.style.top = "";
    rootApp.style.left = "";
    rootApp.style.right = "";

    if (
      !doesPathnameMatchBase(location.pathname) &&
      !location.hash &&
      prevPathname !== location.pathname
    ) {
      prevPathname = location.pathname;
      prevScrollY = 1;
    }
    window.scrollTo({ top: prevScrollY });
  };

  const scrollToLink = () => {
    if (!location.hash) return;
    if (location.hash === prevHash) return;
    prevHash = location.hash;

    scrollIntoView(`[href="${location.hash}"]`, { behavior: "auto", offset: 70 });
  };

  const onClickClose = () => {
    props.setOpen(false);
    requestAnimationFrame(() => {
      props.menuButton.focus();
    });
  };

  onMount(() => {
    rootApp = document.getElementById("root-subcontainer")!;
  });

  createShortcut(["Meta", "K"], () => props.setOpen(true));
  createShortcut(["Control", "K"], () => props.setOpen(true));

  createEffect(
    defer(
      () => props.open,
      open => {
        if (!open) return;
        prevPathname = location.pathname;
        prevHash = location.hash;
      },
    ),
  );

  createEffect(
    defer(
      () => location.pathname,
      (currentPathname, prevPathname) => {
        if (prevPathname === currentPathname) return;
        props.setOpen(false);
      },
    ),
  );

  return (
    <Dismiss
      menuButton={props.menuButton}
      modal
      open={() => props.open}
      setOpen={props.setOpen}
      removeScrollbar={false}
      overlayElement={{
        element: (
          <div>
            <div
              class="fixed top-0 left-0 right-0 z-[1002] h-[60px]"
              classList={{ hidden: isSmall() }}
              onClick={onClickClose}
            />
            <div
              class="fixed inset-0 z-[1000] will-change-transform"
              data-overlay-backdrop
              onClick={onClickClose}
            >
              <div
                class="h-[calc(100%+100px)] bg-[#102a62b8] backdrop-blur-sm dark:bg-[#001627bd]"
                classList={{ "mt-[60px]": !isSmall() }}
              />
            </div>
          </div>
        ),
        animation: {
          enterClass: "opacity-0",
          enterToClass: "opacity-100 transition duration-200",
          exitClass: "opacity-100",
          exitToClass: "opacity-0 transition duration-200",
          appendToElement: "[data-overlay-backdrop]",
        },
      }}
      animation={{
        enterClass: "opacity-0",
        enterToClass: "opacity-100 transition-opacity duration-200",
        exitClass: "opacity-100",
        exitToClass: "opacity-0 transition-opacity duration-200",
        appendToElement: "menuPopup",
        onBeforeEnter: () => {
          Header.setScrollEnabled(false);
        },
        onEnter: () => {
          changePageLayout();
        },
        onExit: () => {
          rootApp.style.top = "1";
        },
        onAfterExit: () => {
          restorePageLayout();
          scrollToLink();
          Header.setScrollEnabled(true);
        },
      }}
      focusElementOnOpen={{ target: isIOS ? "none" : "firstChild", preventScroll: true }}
      focusMenuButtonOnMouseDown={!isIOS}
      ref={containerEl}
    >
      <div
        class="pointer-events-none mb-[60px] flex justify-center p-4"
        classList={{ "mt-[80px]": !isSmall() }}
        role="presentation"
      >
        <div class="flex-grow">
          <div
            class="!pointer-events-none flex justify-center [&>div]:pointer-events-auto"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            ref={dialogEl}
          >
            <Search setOpen={props.setOpen} />
          </div>
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;
