import { ParentComponent } from "solid-js";

const PrimitiveBtnLineWrapper: ParentComponent<{ primitiveName: string }> = props => {
  return (
    <div class="group flex items-center gap-1 py-2">
      <div class="xs:static sticky left-[116px] w-fit flex-shrink-0">{props.children}</div>
      <div
        data-line-primitive-id={props.primitiveName}
        class="xs:block hidden flex-grow border-b-2 border-[#000e3954] opacity-20 group-hover:opacity-100 dark:border-[#97b1ff7d]"
      />
    </div>
  );
};

export default PrimitiveBtnLineWrapper;
