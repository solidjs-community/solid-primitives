import { type Component, createSignal, Show } from "solid-js";
import {
  isNotificationSupported,
  createNotification,
  createNotificationPermission,
} from "../src/index.js";

const App: Component = () => {
  const supported = isNotificationSupported();
  const [body, setBody] = createSignal("Hello from Solid Primitives!");
  const { permission, requestPermission } = createNotificationPermission();
  const { show, close, notification } = createNotification(
    () => "Solid Primitives Notification",
    () => ({ body: body() }),
  );

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Notification Primitive</h4>

        <Show
          when={supported}
          fallback={<p class="caption">Notifications API is not supported in this browser.</p>}
        >
          <p class="caption">
            Permission: <strong>{permission()}</strong>
          </p>
          <p class="caption">
            Active notification: <strong>{notification() ? "visible" : "none"}</strong>
          </p>

          <label class="caption">
            Body text:
            <input
              type="text"
              value={body()}
              onInput={e => setBody(e.currentTarget.value)}
              class="ml-2 rounded bg-gray-700 px-2 py-1 text-white"
            />
          </label>

          <div class="flex gap-2">
            <Show when={permission() !== "granted"}>
              <button class="btn" onClick={requestPermission}>
                Request permission
              </button>
            </Show>
            <button class="btn" onClick={() => show()}>
              Show notification
            </button>
            <button class="btn" onClick={close}>
              Close notification
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default App;
