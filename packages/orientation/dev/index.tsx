import { type Component } from "solid-js";
import { createOrientation } from "../src/index.js";

const App: Component = () => {
  const { angle, type } = createOrientation();

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Screen Orientation</h4>
        <p class="caption">Rotate your device or resize to a narrow viewport to see changes.</p>
        <p>
          <strong>Angle:</strong> {angle()}°
        </p>
        <p>
          <strong>Type:</strong> {type()}
        </p>
      </div>
    </div>
  );
};

export default App;
