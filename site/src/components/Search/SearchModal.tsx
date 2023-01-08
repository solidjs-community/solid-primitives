// import { createShortcut } from "@solid-primitives/keyboard";
import Dismiss from "solid-dismiss";
import { Accessor, Component, createEffect, on } from "solid-js";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: Element;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
  const location = useLocation();

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

  let timeout: number | null = null;
  const onFocusOut = () => {
    setOpen(false);
  };

  return (
    <Dismiss
      menuButton={menuButton}
      modal
      open={open}
      setOpen={setOpen}
      overlayElement={{
        class: "bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-md !top-[60px]"
      }}
      focusElementOnOpen="firstChild"
    >
      <div
        class="fixed top-[80px] left-0 right-0 flex justify-center pointer-events-none"
        role="presentation"
      >
        <div
          class="pointer-events-auto"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          // this is a bug, I need to fix dismiss
          // main page header has higher zindex than overlay element and when clicking on it, it doesn't close modal
          // here's workaround
          onFocusOut={() => {
            window.clearTimeout(timeout!);
            timeout = window.setTimeout(onFocusOut);
          }}
          onFocusIn={() => {
            window.clearTimeout(timeout!);
          }}
        >
          <Search />
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;
