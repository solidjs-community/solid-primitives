import { createSignal, ParentComponent } from "solid-js";
import { useTippy } from "solid-tippy";

const CodePrimitive: ParentComponent = props => {
  const [anchor, setAnchor] = createSignal<Element>();

  useTippy(anchor, {
    props: {
      content: "This is a tooltip.",
    },
  });
  return <code ref={setAnchor}>{props.children}</code>;
};

export default CodePrimitive;
