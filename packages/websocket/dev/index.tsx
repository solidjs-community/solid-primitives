import { Component, For, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { type WSMessage, createReconnectingWS } from "../src";

const App: Component = () => {
  const [textArea, setTextArea] = createSignal<HTMLTextAreaElement>();
  const [messageBox, setMessageBox] = createSignal<HTMLDivElement>();
  const ws = createReconnectingWS("wss://socketsbay.com/wss/v2/1/demo/");
  const [messages, setMessages] = createStore<WSMessage[]>([]);
  const addMessage = (msg: WSMessage) => {
    setMessages(messages.length, msg);
    setTimeout(() => messageBox()?.lastElementChild?.scrollIntoView(), 50);
  };
  ws.addEventListener("message", msg => msg && addMessage(`RECEIVED: ${msg}`));

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Chat demo</h4>
        <style>{`.chat-messages { max-height: 50vh; overflow-y: auto; }`}</style>
        <div class="chat-messages" ref={setMessageBox}>
          <For each={messages} fallback="no messages yet">
            {message => (
              <div>
                {message instanceof Blob && message.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(message)} />
                ) : (
                  message.toString()
                )}
              </div>
            )}
          </For>
        </div>
        <form
          class="flex flex-row"
          onSubmit={e => {
            e.preventDefault();
            const field = textArea();
            const text = field?.value;
            if (text) {
              ws.send(text);
              text && addMessage(`SENT: ${text}`);
              field.value = "";
            }
          }}
        >
          <textarea ref={setTextArea} placeholder="enter your message" />
          <button class="px-2" type="submit">
            Send
          </button>
        </form>
        <p class="fontsize-11">
          This demo chat is using a free testing service from{" "}
          <a href="https://socketsbay.com" target="_blank" rel="noreferrer,noopener">
            SocketsBay
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default App;
