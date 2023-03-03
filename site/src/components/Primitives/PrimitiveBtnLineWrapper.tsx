import { ParentComponent } from "solid-js";

const PrimitiveBtnLineWrapper: ParentComponent<{ primitiveName: string }> = props => {
  return (
    <div class="flex gap-1 py-2 items-center group">
      <div class="flex-shrink-0 w-fit sticky left-[116px] xs:static">{props.children}</div>
      <div
        data-line-primitive={props.primitiveName}
        class="hidden xs:block flex-grow border-b-2 border-[#000e3954] dark:border-[#97b1ff7d] opacity-20 group-hover:opacity-100"
      />
    </div>
  );
};

export default PrimitiveBtnLineWrapper;
