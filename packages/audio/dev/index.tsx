import { type Component, For, type JSX, Suspense, createSignal, splitProps } from "solid-js";
import { createAudio } from "../src/index.js";

type IconPath = { path: () => JSX.Element; outline?: boolean; mini?: boolean };
type IconProps = JSX.SvgSVGAttributes<SVGSVGElement> & { path: IconPath };

const Icon = (props: IconProps) => {
  const [internal, external] = splitProps(props, ["path"]);
  return (
    <svg
      viewBox={internal.path.mini ? "0 0 20 20" : "0 0 24 24"}
      fill={internal.path.outline ? "none" : "currentColor"}
      stroke={internal.path.outline ? "currentColor" : "none"}
      stroke-width={internal.path.outline ? 1.5 : undefined}
      {...external}
    >
      {internal.path.path()}
    </svg>
  );
};

const play: IconPath = {
  path: () => (
    <path
      fill-rule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
      clip-rule="evenodd"
    />
  ),
};
const pause: IconPath = {
  path: () => (
    <path
      fill-rule="evenodd"
      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
      clip-rule="evenodd"
    />
  ),
};
const speakerWave: IconPath = {
  path: () => (
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
    />
  ),
  outline: true,
};

const formatTime = (time: number) => new Date(time * 1000).toISOString().substr(14, 8);

const Player: Component<{ source: () => string }> = props => {
  const audio = createAudio(props.source);

  return (
    <div class="flex items-center justify-center space-x-4 rounded-full bg-white p-1 shadow">
      <button
        class="flex scale-200 cursor-pointer border-none bg-transparent"
        onClick={() => audio.setPlaying(!audio.playing())}
      >
        <Icon
          class="w-12 text-blue-600 transition hover:text-blue-700"
          path={audio.playing() ? pause : play}
        />
      </button>
      <div class="min-w-32 text-center">
        <Suspense fallback="Loading...">
          {formatTime(audio.currentTime())} / {formatTime(audio.duration())}
        </Suspense>
      </div>
      <Suspense fallback={<div class="w-40" />}>
        <input
          onInput={evt => audio.seek(+evt.currentTarget.value)}
          type="range"
          min="0"
          step="0.1"
          max={audio.duration()}
          value={audio.currentTime()}
          class="form-range w-40 cursor-pointer appearance-none rounded-3xl bg-gray-200 transition hover:bg-gray-300 focus:ring-0 focus:outline-none"
        />
      </Suspense>
      <div class="flex px-2">
        <Icon class="w-6 text-blue-600" path={speakerWave} />
        <input
          onInput={evt => audio.setVolume(+evt.currentTarget.value)}
          type="range"
          min="0"
          step="0.1"
          max={1}
          value={audio.volume()}
          class="cursor w-10"
        />
      </div>
    </div>
  );
};

const App: Component = () => {
  const [source, setSource] = createSignal("sample1.mp3");

  return (
    <div class="box-border flex h-screen w-full items-center justify-center overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <Player source={source} />
        <div class="bg flex justify-center rounded-b-xl bg-blue-500">
          <For
            each={Object.entries({
              "Sample 1": "sample1.mp3",
              "Sample 2": "sample2.mp3",
              "Sample 3": "sample3.mp3",
            })}
          >
            {([label, url]) => (
              <button
                onClick={() => setSource(url)}
                class="cursor-pointer border-none bg-transparent px-4 py-3 transition"
                classList={{
                  "text-white hover:text-gray-900": url !== source(),
                  "text-blue-800": url === source(),
                }}
              >
                {label}
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default App;
