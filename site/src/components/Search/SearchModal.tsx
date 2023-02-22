// import { createShortcut } from "@solid-primitives/keyboard";
import { createMediaQuery } from "@solid-primitives/media";
import { isIOS } from "@solid-primitives/platform";
import Dismiss from "solid-dismiss";
import { Accessor, batch, Component, createComputed, createEffect, on, onMount } from "solid-js";
import { produce, unwrap } from "solid-js/store";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import { scrollIntoView } from "~/utils/scrollIntoView";
import { headerState, setHeaderState } from "../Header/Header";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: HTMLElement;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  let prevHeaderState: typeof headerState;
  let rootApp!: HTMLElement;
  let containerEl!: HTMLElement;
  let dialogEl!: HTMLDivElement;
  const location = useLocation();

  let prevScrollY = 0;

  const changePageLayout = () => {
    const rootAppBCR = rootApp.getBoundingClientRect();
    // const { scrollY } = window;

    rootApp.style.position = "fixed";
    rootApp.style.top = `${rootAppBCR.top}px`;
    rootApp.style.left = "0";
    rootApp.style.right = "0";

    // weird scrollY sudden change to bottom of page, moved setting prevScrollY from window.scrollY inside computed
    // prevScrollY = scrollY;

    // scroll top to 1 instead of 0, to prevent iOS Safari navigation bar to fully expand if it was previously collapsed.
    window.scrollTo({ top: 1 });
  };

  const restorePageLayout = () => {
    rootApp.style.position = "";
    rootApp.style.top = "";
    rootApp.style.left = "";
    rootApp.style.right = "";

    if (location.pathname !== "/solid-primitives/" && !location.hash) {
      prevScrollY = 1;
    }
    window.scrollTo({ top: prevScrollY });
  };

  const scrollToLink = () => {
    if (!location.hash) return;

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

  // TODO: ONLY WORKS ONCE?? (sometimes it works again)
  // but is same code as https://github.com/solidjs-community/solid-primitives/blob/main/packages/keyboard/dev/index.tsx#L37 and that works
  // seems like interacting with tabbable items silences the event or something
  createShortcut(["Meta", "K"], () => {
    setOpen(true);
  });
  createShortcut(["Control", "K"], () => {
    setOpen(true);
  });

  createComputed(() => {
    if (!open()) return;
    const { scrollY } = window;
    prevScrollY = scrollY;
  });

  createEffect(
    on(
      () => location.pathname,
      (currentPathname, prevPathname) => {
        if (prevPathname === currentPathname) return;
        setOpen(false);
      },
      { defer: true }
    )
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
            <div class="fixed inset-0 z-[1000] will-change-transform" onClick={onClickClose}>
              <div
                class="h-full bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-sm"
                classList={{ "mt-[60px]": !isSmall() }}
              />
            </div>
          </div>
        ),
        animation: !isSmall()
          ? {
              name: "fade-opacity"
            }
          : undefined
      }}
      animation={{
        name: "fade-opacity",
        onBeforeEnter: () => {
          prevHeaderState = structuredClone(unwrap(headerState));
          setHeaderState("disableScroll", true);
        },
        onEnter: () => {
          batch(() => {
            setHeaderState("showSearchBtn", false);
            setHeaderState("showGradientBorder", false);
            setHeaderState("showShadow", false);
            setHeaderState("showOpaqueBg", true);
            if (!isSmall()) {
              setHeaderState("zIndex", 1001);
            }
          });
          changePageLayout();
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
            if (location.pathname === "/solid-primitives/") {
              setHeaderState("showGradientBorder", prevHeaderState.showGradientBorder);
            }
            setHeaderState("showOpaqueBg", prevHeaderState.showOpaqueBg);
            setHeaderState("showShadow", prevHeaderState.showShadow);
            setHeaderState("zIndex", prevHeaderState.zIndex);
          });
        }
      }}
      focusElementOnOpen={isIOS ? "none" : "firstChild"}
      focusMenuButtonOnMouseDown={!isIOS}
      ref={containerEl}
    >
      <div
        // class="fixed top-[80px] left-0 right-0 flex justify-center pointer-events-none"
        class="mb-[60px] flex justify-center pointer-events-none"
        classList={{ "mt-[80px]": !isSmall() }}
        role="presentation"
        ref={dialogEl}
      >
        <div class="pointer-events-auto" role="dialog" aria-modal="true" tabindex="-1">
          <Search setOpen={setOpen} />
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;
