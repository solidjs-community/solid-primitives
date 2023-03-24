import { Component } from "solid-js";

export const H2: Component<{ text: string }> = props => {
  const id = () => props.text.toLowerCase().replace(/ /g, "-");
  return (
    <h2 id={id()}>
      <a class="header-anchor" href={`#${id()}`}>
        #
      </a>
      {props.text}
    </h2>
  );
};
