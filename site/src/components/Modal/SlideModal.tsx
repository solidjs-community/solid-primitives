import Dismiss from "solid-dismiss";
import { FiX } from "solid-icons/fi";
import { Accessor, onMount, ParentComponent } from "solid-js";
import { setHeaderState } from "../Header/Header";

const SlideModal: ParentComponent<{
  menuButton: Element;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = props => {
  const { menuButton, open, setOpen } = props;

  let containerEl!: HTMLElement;
  let dialogEl!: HTMLDivElement;
  let rootApp!: HTMLElement;

  let prevScrollY = 0;

  const changePageLayout = () => {
    const rootAppBCR = rootApp.getBoundingClientRect();
    const containerBCR = containerEl.getBoundingClientRect();
    const documentHeight = document.documentElement.clientHeight;
    const { scrollY } = window;
    const containerMarginTop = 100;
    const containerMarginBottom = 60;
    const containerHeight = containerBCR.height + containerMarginTop + containerMarginBottom;

    rootApp.style.position = "fixed";
    rootApp.style.top = `${rootAppBCR.top}px`;
    rootApp.style.left = "0";
    rootApp.style.right = "0";

    if (containerHeight <= documentHeight) {
      document.documentElement.style.overflow = "hidden";
      rootApp.style.overflow = "hidden";
    }

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
    rootApp.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo({ top: prevScrollY });
  };

  const getScrollPercentage = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    return scrollPercent;
  };

  const updateModalSlideExitDirectionCSSVariable = () => {
    // This is used to determine on animation exit, whether modal slides down or up
    const scrollPercent = getScrollPercentage();
    const innerHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const dialogBCR = dialogEl.getBoundingClientRect();
    const bottomShadowHeight = 20;
    const position = innerHeight + scrollY - (dialogBCR.top + scrollY);
    const value = scrollPercent < 0.5 ? position : -dialogBCR.bottom - bottomShadowHeight;

    // update css variable --slide-exit-y that is used in "slide-modal-exit-to" class
    document.documentElement.style.setProperty("--slide-exit-y", `${value}px`);
  };

  onMount(() => {
    rootApp = document.getElementById("root")!;
  });

  return (
    <Dismiss
      menuButton={menuButton}
      modal
      open={open}
      setOpen={setOpen}
      removeScrollbar={false}
      menuPopup={`[role="dialog"]`}
      overlayElement={{
        element: (
          <div
            class="fixed inset-0 h-[calc(100%+100px)] z-[1000] bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          ></div>
        ),
        animation: {
          enterClass: "opacity-0",
          enterToClass: "opacity-100 transition duration-200",
          exitClass: "opacity-100",
          exitToClass: "opacity-0 transition duration-200",
        },
      }}
      animation={{
        name: "slide-modal",
        onEnter: () => {
          setHeaderState("disableScroll", true);
          requestAnimationFrame(() => {
            changePageLayout();
          });
        },
        onBeforeExit: () => {
          updateModalSlideExitDirectionCSSVariable();
        },
        onAfterExit: () => {
          setHeaderState("disableScroll", false);
          restorePageLayout();
        },
      }}
      ref={containerEl}
    >
      <div
        class="mt-[100px] mb-[60px] px-2 flex justify-center pointer-events-none"
        role="presentation"
      >
        <div
          class="pointer-events-auto relative w-full xxs:w-auto outline-none"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          ref={dialogEl}
        >
          {props.children}
          <button
            class="absolute top-0 right-0 w-[45px] h-[45px] rounded-lg text-[#306FC4] flex justify-center items-center dark:text-[#c2d5ee] dark:hover:text-white"
            onClick={() => {
              setOpen(false);
            }}
            aria-label="Close Modal"
          >
            <FiX size={25} />
          </button>
        </div>
      </div>
    </Dismiss>
  );
};

export default SlideModal;
