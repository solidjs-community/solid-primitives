import { ChainedContextApp } from "./chainedContext";
import { NoContextI18nApp } from "./createChained";

const Root = () => {
  return (
    <div>
      <NoContextI18nApp />
      <hr />
      <ChainedContextApp />
    </div>
  );
};

render(() => <Root />, document.getElementById("root")!);
