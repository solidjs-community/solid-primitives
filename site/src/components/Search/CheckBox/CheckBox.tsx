import { ParentComponent } from "solid-js";
import s from "./checkbox.module.scss";

const CheckBox: ParentComponent<{
  checked: boolean;
  onChange: (props: boolean) => void;
}> = props => {
  return (
    <label class="xs:py-[5px] xs:px-[12px] box-shadow-[0_1px_0_0_#b4c3dd] dark:box-shadow-[0_1px_0_0_#15232e] flex cursor-pointer gap-1 rounded-full border border-[#e0eeff] px-[7px] py-[3px] transition hover:border-[#7ea2cf] dark:border-[#1a2a37] dark:hover:border-[#040c12]">
      {/* padding: 3px 7px;
    border: 1px solid #e0eeff;
    box-shadow: 0 1px 0 0 #002a5c33; */}
      <input
        class={s.checkbox}
        type="checkbox"
        checked={props.checked}
        onChange={e => props.onChange(e.currentTarget.checked)}
      />
      <span class="select-none">{props.children}</span>
    </label>
  );
};
export default CheckBox;
