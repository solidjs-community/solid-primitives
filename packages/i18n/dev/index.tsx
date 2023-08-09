import { ChainedContextApp } from "./chainedContext.js";
import { NoContextI18nApp } from "./createChained.js";

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
