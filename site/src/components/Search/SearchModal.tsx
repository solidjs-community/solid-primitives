// import { createShortcut } from "@solid-primitives/keyboard";
import { createMediaQuery } from "@solid-primitives/media";
import { isIOS } from "@solid-primitives/platform";
import { defer } from "@solid-primitives/utils";
import Dismiss from "solid-dismiss";
import { Accessor, batch, Component, createEffect, onMount } from "solid-js";
import { unwrap } from "solid-js/store";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import { doesPathnameMatchBase } from "~/utils/doesPathnameMatchBase";
import { scrollIntoView } from "~/utils/scrollIntoView";
import { headerState, setHeaderState } from "../Header/Header";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: HTMLElement;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  let prevPathname = "";
  let prevHash = "";
  let prevHeaderState: typeof headerState;
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
    setOpen(false);
    requestAnimationFrame(() => {
      menuButton.focus();
    });
  };

  onMount(() => {
    rootApp = document.getElementById("root-subcontainer")!;
  });

  createShortcut(["Meta", "K"], () => {
    setOpen(true);
  });
  createShortcut(["Control", "K"], () => {
    setOpen(true);
  });

  createEffect(
    defer(open, open => {
      if (!open) return;
      prevPathname = location.pathname;
      prevHash = location.hash;
    }),
  );

  createEffect(
    defer(
      () => location.pathname,
      (currentPathname, prevPathname) => {
        if (prevPathname === currentPathname) return;
        setOpen(false);
      },
    ),
  );

  return (
    <Dismiss
      menuButton={menuButton}
      modal
      open={open}
      setOpen={setOpen}
      removeScrollbar={false}
      overlayElement={{
        element: (
          <div>
            <div
              class="fixed top-0 left-0 right-0 h-[60px] z-[1002]"
              classList={{ hidden: isSmall() }}
              onClick={onClickClose}
            />
            <div
              class="fixed inset-0 z-[1000] will-change-transform"
              data-overlay-backdrop
              onClick={onClickClose}
            >
              <div
                class="h-[calc(100%+100px)] bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-sm"
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
          prevHeaderState = structuredClone(unwrap(headerState));
          setHeaderState("disableScroll", true);
        },
        onEnter: () => {
          changePageLayout();
          batch(() => {
            setHeaderState("showSearchBtn", false);
            setHeaderState("showGradientBorder", false);
            setHeaderState("showShadow", false);
            setHeaderState("showOpaqueBg", true);
            if (!isSmall()) {
              setHeaderState("zIndex", 1001);
            }
          });
        },
        onExit: () => {
          setHeaderState("showSearchBtn", true);
          rootApp.style.top = "1";
        },
        onAfterExit: () => {
          restorePageLayout();
          scrollToLink();
          batch(() => {
            setHeaderState("disableScroll", false);
            if (doesPathnameMatchBase(location.pathname)) {
              setHeaderState("showGradientBorder", prevHeaderState.showGradientBorder);
            }
            setHeaderState("showOpaqueBg", prevHeaderState.showOpaqueBg);
            setHeaderState("showShadow", prevHeaderState.showShadow);
            setHeaderState("zIndex", prevHeaderState.zIndex);
          });
        },
      }}
      focusElementOnOpen={{ target: isIOS ? "none" : "firstChild", preventScroll: true }}
      focusMenuButtonOnMouseDown={!isIOS}
      ref={containerEl}
    >
      <div
        class="mb-[60px] flex justify-center pointer-events-none p-4"
        classList={{ "mt-[80px]": !isSmall() }}
        role="presentation"
      >
        <div class="flex-grow">
          <div
            class="flex justify-center !pointer-events-none [&>div]:pointer-events-auto"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            ref={dialogEl}
          >
            <Search setOpen={setOpen} />
          </div>
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;
