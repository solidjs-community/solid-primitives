import { Component, createEffect, createSignal, For, on, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { createBroadcastChannel, makeBroadcastChannel } from "../src";
import { TPage, useTrackPages } from "./hooks/useTrackPages";

const Content = (props: { page: TPage; channelName: string }) => {
  const hasMultiplePages = () => props.page.count > 1;
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);
  const [list, setList] = createStore<{ id: string; count: number }[]>([]);

  const { message, postMessage } = createBroadcastChannel<{ id: string; count: number }>(
    props.channelName,
  );

  //   const { onMessage } = makeBroadcastChannel(props.channelName);
  //
  //   onMessage(({ data }) => {
  //     setList(
  //       produce(prev => {
  //         prev.push(data);
  //       })
  //     );
  //   });

  createEffect(
    on(
      message,
      data => {
        setList(
          produce(prev => {
            prev.push(data!);
          }),
        );
      },
      { defer: true },
    ),
  );

  const onBtnClick = () => {
    increment();
    postMessage({ id: props.page.id, count: count() });
  };

  return (
    <div class="" classList={{ ["opacity-50"]: !hasMultiplePages() }}>
      <div class="wrapper-v">
        <h3>
          <span class="font-normal opacity-90">BroadcastChannel name:</span> {props.channelName}
        </h3>
        <button
          class="btn flex gap-2 "
          classList={{
            ["cursor-default"]: !hasMultiplePages(),
            ["hover:bg-teal-600"]: !hasMultiplePages(),
          }}
          disabled={!hasMultiplePages()}
          onClick={onBtnClick}
        >
          <span>Post Message</span>
          <span>{count()}</span>
        </button>
        <ul>
          <For each={list}>
            {item => {
              return (
                <li class="flex gap-2">
                  <span class="font-mono">{item.count}</span>
                  <span>-</span>
                  <span class="font-mono opacity-50">{item.id}</span>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
};

const MessageContainer = (props: { page: TPage; channelName: string }) => {
  const [showContent, setShowContent] = createSignal(true);
  return (
    <div class="w-full">
      <button class="btn block" onClick={() => setShowContent(!showContent())}>
        {showContent() ? "Destroy" : "Add"} Content
      </button>

      <div class="">
        <Show when={showContent()}>
          <Content page={props.page} channelName={props.channelName}></Content>
        </Show>
      </div>
    </div>
  );
};

const App: Component = () => {
  const page = useTrackPages();

  return (
    <div class="flex min-h-screen justify-between gap-4 bg-gray-800 p-5 pt-[80px] text-white">
      <header class="fixed left-0 top-0 z-10 flex h-[60px] w-full items-center gap-8 bg-gray-800 px-5">
        <h1>
          Page Id: <span class="font-mono">{page.id}</span>
        </h1>
      </header>
      <div>
        <div class="sticky top-[80px]">
          <div class="text-2xl">
            Pages: <span class="font-mono">{page.count}</span>
          </div>
          <ul class="pl-[14px]">
            <For each={Object.keys(page.pages)}>
              {item => (
                <li
                  class="whitespace-nowrap font-mono"
                  classList={{ "color-blue-400": page.id === item }}
                >
                  id: {item}
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
      <div class="flex-grow-1 flex flex-col gap-4 [@media(min-width:825px)]:flex-row">
        <MessageContainer page={page} channelName="the_matrix" />
        {/* Example of using same channel name where it uses same instance instead of creating new one */}
        <MessageContainer page={page} channelName="sc2" />
        <MessageContainer page={page} channelName="sc2" />
      </div>
    </div>
  );
};

export default App;
