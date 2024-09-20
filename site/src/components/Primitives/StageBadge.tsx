import { createSignal, ParentComponent } from "solid-js";
import SlideModal from "../Modal/SlideModal.js";
import Stage from "../Stage/Stage.js";

const bgLevel0 = "bg-[#FA233E]";
const bgLevel1 = "bg-[#FFA15C]";
const bgLevel2 = "bg-[#E9DE47]";
const bgLevel3 = "bg-[#12C3A2]";
const bgLevel4 = "bg-[#2962FF]";

const classStageColor = (level: number | string) => {
  const value = (level as any) === "X" ? level : parseInt(level as any);
  switch (value) {
    case 0:
      return `${bgLevel0} text-white`;
    case 1:
      return `${bgLevel1} text-black`;
    case 2:
      return `${bgLevel2} text-black`;
    case 3:
      return `${bgLevel3} text-white`;
    case 4:
      return `${bgLevel4} text-white`;
    default:
      return `${bgLevel0} text-white`;
  }
};

const styleStageColor = (level: string | number) => {
  //
  // border: 3px solid transparent;
  const value = (level as any) === "X" ? level : parseInt(level as any);

  const getStyle = ({ bgClass, borderBg }: { bgClass: string; borderBg: string }) => {
    const bg = bgClass.match(/\[([^\]]+)\]/)![1];
    const paddingBox = `linear-gradient(${bg},${bg}) padding-box`;
    const borderBox = `linear-gradient(to right, ${bg}, ${borderBg}) border-box`;
    return `background: ${paddingBox},${borderBox};`;
  };
  switch (value) {
    case 0:
      return getStyle({ bgClass: bgLevel0, borderBg: "#c80019" });
    case 1:
      return getStyle({ bgClass: bgLevel1, borderBg: "#ef761e" });
    case 2:
      return getStyle({ bgClass: bgLevel2, borderBg: "#dbcf2f" });
    case 3:
      return getStyle({ bgClass: bgLevel3, borderBg: "#08a689" });
    case 4:
      return getStyle({ bgClass: bgLevel4, borderBg: "#0033be" });
    default:
      return getStyle({ bgClass: bgLevel0, borderBg: "#c80019" });
  }
};

const StageBadge: ParentComponent<{
  type?: "button" | "static";
  value: number | string;
  size?: "small";
}> = ({ type = "button", value: level, size }) => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;
  if (type === "static") {
    return (
      <span class="flex justify-center">
        <span
          data-stage
          class={"flex items-center justify-center rounded-md font-sans " + classStageColor(level)}
          classList={{
            "w-[25px] sm:w-[32.25px] h-[28px]": !size,
            "w-[22px] h-[24px]": size === "small",
          }}
        >
          <span>{level}</span>
        </span>
      </span>
    );
  }
  return (
    <div class="flex justify-center">
      <button
        data-stage
        class={
          "flex h-[28px] w-[25px] items-center justify-center rounded-md border-2 border-[rgba(0,0,0,0.15)] font-sans transition-[border-color,filter] hover:border-black/40 hover:brightness-110 dark:border-black/20 dark:hover:border-black/60 sm:w-[32.25px] " +
          classStageColor(level)
        }
        ref={menuButton}
      >
        <span>{level}</span>
      </button>
      <SlideModal menuButton={menuButton} open={open} setOpen={setOpen}>
        <Stage />
      </SlideModal>
    </div>
  );
};

export const StageBadgePill: ParentComponent<{ value: number | undefined }> = props => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;

  return (
    <>
      <button class="transition-filter flex font-sans hover:contrast-[1.2]" ref={menuButton}>
        <div class="flex h-[38px] items-center rounded-l-lg border-[3px] border-[#cae0ff] bg-[#cae0ff40] px-4 dark:border-[#405b6e] dark:bg-[#2a4355]">
          Stage
        </div>
        <div
          class={
            "flex h-full items-center justify-center rounded-r-lg border-[3px] border-transparent px-6 font-semibold " +
            classStageColor(props.value ?? "X")
          }
          style={styleStageColor(props.value ?? "X")}
        >
          {props.value}
        </div>
      </button>
      <SlideModal menuButton={menuButton} open={open} setOpen={setOpen}>
        <Stage />
      </SlideModal>
    </>
  );
};

export default StageBadge;
