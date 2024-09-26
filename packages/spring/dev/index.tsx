import { createSpring } from "../src/index.js"

export default function App() {
  const [progress, setProgress] = createSpring(0);
  const [radialProgress, setRadialProgress] = createSpring(0, {
    stiffness: 0.1, damping: 0.3
  });
  const [xy, setXY] = createSpring({ x: 50, y: 50 }, { stiffness: 0.1, damping: 0.3 });
  const [date, setDate] = createSpring(new Date());

  function toggleProgress() {
    if (progress() === 0) setProgress(1);
    else setProgress(0);
  }
  function toggleRadialProgress() {
    if (radialProgress() === 0) setRadialProgress(1);
    else setRadialProgress(0);
  }
  let d = false
  function toggleXY() {
    if (d = !d) setXY({ x: 200, y: 200 });
    else setXY({ x: 50, y: 50 });
  }
  function toggleDate() {
    if (date().getDate() === new Date("2024-12-01").getDate()) setDate(new Date("2024-04-14"));
    else setDate(new Date("2024-12-01"));
  }

  return <>
  <style>{`
progress {
  color: #a3e635;
}
progress::-moz-progress-bar {
  background: #a3e635;
}
progress::-moz-progress-bar {
  background: #a3e635;
}

.circular-progress {
  --size: 250px;
  --half-size: calc(var(--size) / 2);
  --stroke-width: 20px;
  --radius: calc((var(--size) - var(--stroke-width)) / 2);
  --circumference: calc(var(--radius) * pi * 2);
  --dash: calc((var(--progress) * var(--circumference)) / 100);
  animation: progress-animation 5s linear 0s 1 forwards;
}

.circular-progress circle {
  cx: var(--half-size);
  cy: var(--half-size);
  r: var(--radius);
  stroke-width: var(--stroke-width);
  fill: none;
  stroke-linecap: round;
}

.circular-progress circle.bg {
  stroke: #111;
}

.circular-progress circle.fg {
  transform: rotate(-90deg);
  transform-origin: var(--half-size) var(--half-size);
  stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
  transition: stroke-dasharray 0.3s linear 0s;
  stroke: #a3e635;
}
`}</style>
    <div class="flex flex-col items-center justify-center gap-8">
      <div class="flex gap-3 p-2">
        <button onClick={toggleProgress}>Toggle progress</button>
        <button onClick={toggleRadialProgress}>Toggle Radial progress</button>
        <button onClick={toggleXY}>Toggle XY</button>
        <button onClick={toggleDate}>Toggle Date</button>
      </div>

      {/* Progress */}
      <div class="flex flex-col items-center">
        <progress
          class="progress w-56"
          value={progress() * 100}
          max="100"
        ></progress>

        <p class="text-white">{(progress() * 100).toFixed(0)}%</p>
      </div>

      {/* Radial progress */}
      <div class="flex flex-col items-center gap-4">
        <svg
          width="120"
          height="120"
          viewBox="0 0 250 250"
          class="circular-progress"
          style={`--progress:${radialProgress() * 100};`}
        >
          <circle class="bg"></circle>
          <circle class="fg"></circle>
        </svg>
        <span class="text-white">{(radialProgress() * 100).toFixed(0)}%</span>
      </div>

      {/* XY */}
      <div
        class="bg-lime-400 rounded-lg flex items-center justify-center whitespace-nowrap text-black text-sm font-bold"
        style={{
          width: xy().x + "px",
          height: 100 + "px",
        }}
      >
        {xy().x.toFixed(0)}x{xy().y.toFixed(0)}
      </div>

      {/* Date */}
      <div>{date()+""}</div>
    </div>
  </>
};
