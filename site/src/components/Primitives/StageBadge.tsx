import { createSignal, ParentComponent } from "solid-js";
import StageModal from "../Stage/StageModal";

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

const StageBadge: ParentComponent<{ type?: "button" | "static"; value: number | string }> = ({
  type = "button",
  value: level
}) => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;
  if (type === "static") {
    return (
      <div class="flex justify-center">
        <div
          data-stage
          class={
            "flex justify-center items-center font-sans w-[25px] sm:w-[32.25px] h-[28px] rounded-md " +
            classStageColor(level)
          }
        >
          <span>{level}</span>
        </div>
      </div>
    );
  }
  return (
    <div class="flex justify-center">
      <button
        data-stage
        class={
          "flex justify-center items-center font-sans w-[25px] sm:w-[32.25px] h-[28px] rounded-md " +
          classStageColor(level)
        }
        ref={menuButton}
      >
        <span>{level}</span>
      </button>
      <StageModal menuButton={menuButton} open={open} setOpen={setOpen} />
    </div>
  );
};

export const StageBadgePill: ParentComponent<{ value: number | string }> = ({ value: level }) => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;

  return (
    <>
      <button class="flex font-sans hover:contrast-[1.2] transition-filter" ref={menuButton}>
        <div class="flex items-center rounded-l-lg h-[38px] border-[#cae0ff] px-4 border-[3px] bg-[#cae0ff40]">
          Stage
        </div>
        <div
          class={
            "flex justify-center items-center rounded-r-lg px-6 h-full font-semibold border-[3px] border-transparent " +
            classStageColor(level)
          }
          style={styleStageColor(level)}
        >
          {level}
        </div>
      </button>
      <StageModal menuButton={menuButton} open={open} setOpen={setOpen} />
    </>
  );
};

export default StageBadge;
