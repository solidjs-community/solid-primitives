import { createStore, produce } from "solid-js/store";
import { makeBroadcastChannel } from "../../src/index.js";

const getSmallId = () => {
  const date = new Date();
  const time = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
  return parseInt(time).toString(16);
};

export type TPage = {
  id: string;
  count: number;
  pages: { [key: string]: boolean };
};

export function useTrackPages(id?: string) {
  const name = id || "track-pages-same-origin";
  const pageId = getSmallId();
  const { onMessage, postMessage } = makeBroadcastChannel<{
    id: string;
    ids?: typeof tabsMap;
    state: "close" | "open" | "open::success";
  }>(name);
  const [store, setStore] = createStore<TPage>({
    id: pageId,
    count: 1,
    pages: { [pageId]: true },
  });

  let intervalId: number = 0;
  let tabsMap: { [key: string]: boolean } = { [pageId]: true };

  onMessage(({ data }) => {
    const { id, ids, state } = data;
    window.clearInterval(intervalId);

    setStore(
      produce(prev => {
        if (state === "close") {
          delete prev.pages[id];
        } else {
          prev.pages = { ...prev.pages, ...ids, [id]: true };
        }
        prev.count = Object.keys(prev.pages).length;
      }),
    );

    if (state === "open") {
      postMessage({
        id: pageId,
        state: "open::success",
        ids: JSON.parse(JSON.stringify(store.pages)),
      });
    }
    if (state === "open::success") {
      // console.log("open::success", tabsMap);
    }
    if (state === "close") {
      delete tabsMap[id];
    }
  });

  intervalId = window.setInterval(() => {
    postMessage({ id: pageId, ids: tabsMap, state: "open" });
    console.log("postMessage poll");
  }, 200);

  window.addEventListener(
    "beforeunload",
    e => {
      postMessage({ id: pageId, state: "close" });
    },
    false,
  );

  return store;
}
