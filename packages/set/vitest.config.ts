import { UserConfig } from "vite";

const config: UserConfig = {
  test: {
    environment: "jsdom",
    transformMode: {
      web: [/\.[jt]sx$/]
    },
    // solid needs to be inline to work around
    // a resolution issue in vitest:
    deps: {
      inline: [/solid-js/]
    }
    // if you have few tests, try commenting one
    // or both out to improve performance:
    // threads: false,
    // isolate: false
  },
  resolve: {
    conditions: ["development", "browser"]
  }
};
export default config;
