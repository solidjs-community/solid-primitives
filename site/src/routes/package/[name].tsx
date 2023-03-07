import { Component } from "solid-js";
import { useParams } from "solid-start";

const Test: Component<{}> = props => {
  const params = useParams();

  return <div>Package {params.name}</div>;
};

export default Test;
