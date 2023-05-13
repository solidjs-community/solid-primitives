import { ChainedContextApp } from "./chainedContext";
import { NoContextI18nApp } from "./createChained";

const App = () => {
  return (
    <div>
      <NoContextI18nApp />
      <hr />
      <ChainedContextApp />
    </div>
  );
};

export default App;
