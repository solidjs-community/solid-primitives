// import { createShortcut } from "@solid-primitives/keyboard";
import Dismiss from "solid-dismiss";
import { Accessor, batch, Component, createEffect, on, onMount } from "solid-js";
import { produce, unwrap } from "solid-js/store";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import { headerState, setHeaderState } from "../Header/Header";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: HTMLElement;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
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

    // or
    // const documentWidth = document.documentElement.clientWidth;
    // rootApp.style.left = `${rootAppBCR.left}px`;
    // rootApp.style.right = `${documentWidth - rootAppBCR.right}px`;

    prevScrollY = scrollY;
    // scroll top to 1 instead of 0, to prevent iOS Safari navigation bar to fully expand if it was previously collapsed.
    window.scrollTo({ top: 1 });
  };

  const restorePageLayout = () => {
    rootApp.style.position = "";
    rootApp.style.top = "";
    rootApp.style.left = "";
    rootApp.style.right = "";
    window.scrollTo({ top: prevScrollY });
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
            <div class="fixed top-0 left-0 right-0 h-[60px] z-[1002]" onClick={onClickClose} />
            <div class="fixed inset-0 z-[1000] will-change-transform" onClick={onClickClose}>
              <div class="h-full mt-[60px] bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-sm" />
            </div>
          </div>
        ),
        animation: {
          name: "fade-opacity",
          onEnter() {
            prevHeaderState = structuredClone(unwrap(headerState));
            batch(() => {
              setHeaderState("disableScroll", true);
              setHeaderState("showSearchBtn", false);
              setHeaderState("showGradientBorder", false);
              setHeaderState("showOpaqueBg", true);
              setHeaderState("zIndex", 1001);
            });
            changePageLayout();
          },
          onExit: () => {
            setHeaderState("showSearchBtn", true);
          },
          onAfterExit: () => {
            restorePageLayout();

            batch(() => {
              setHeaderState("disableScroll", false);
              setHeaderState("showGradientBorder", prevHeaderState.showGradientBorder);
              setHeaderState("showOpaqueBg", prevHeaderState.showOpaqueBg);
              setHeaderState("zIndex", prevHeaderState.zIndex);
            });
          }
        }
      }}
      animation={{
        name: "fade-opacity"
      }}
      focusElementOnOpen="firstChild"
      ref={containerEl}
    >
      <div
        // class="fixed top-[80px] left-0 right-0 flex justify-center pointer-events-none"
        class="mt-[80px] mb-[60px] px-2 flex justify-center pointer-events-none"
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
