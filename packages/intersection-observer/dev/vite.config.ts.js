"use strict";

// ../../vite.config.ts
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";
var viteConfig = defineConfig({
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        "center-child": "flex justify-center items-center",
        caption: "text-sm font-mono leading-tight",
        btn: "bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer center-child select-none text-white font-semibold p-4 py-3 m-2",
        "wrapper-h":
          "p-6 flex justify-center items-center space-x-4 space-y-0 bg-gray-700 rounded-2xl",
        "wrapper-v": "wrapper-h flex-col space-x-0 space-y-4",
        node: "p-4 bg-orange-600 rounded m-2"
      }
    })
  ],
  optimizeDeps: {
    exclude: ["@solid-primitives/utils"]
  }
});
var vitestConfig = defineConfig({
  test: {
    clearMocks: true,
    environment: "jsdom",
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    deps: {
      inline: [/solid-js/]
    }
  },
  resolve: {
    conditions: ["development", "browser"]
  },
  optimizeDeps: {
    exclude: ["@solid-primitives/utils"]
  }
});

// dev/vite.config.ts
var vite_config_default = viteConfig;
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vdml0ZS5jb25maWcudHMiLCAiZGV2L3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHNvbGlkUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1zb2xpZFwiO1xuaW1wb3J0IFVub2NzcyBmcm9tIFwidW5vY3NzL3ZpdGVcIjtcblxuZXhwb3J0IGNvbnN0IHZpdGVDb25maWcgPSBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgc29saWRQbHVnaW4oKSxcbiAgICBVbm9jc3Moe1xuICAgICAgc2hvcnRjdXRzOiB7XG4gICAgICAgIFwiY2VudGVyLWNoaWxkXCI6IFwiZmxleCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXJcIixcbiAgICAgICAgY2FwdGlvbjogXCJ0ZXh0LXNtIGZvbnQtbW9ubyBsZWFkaW5nLXRpZ2h0XCIsXG4gICAgICAgIGJ0bjogXCJiZy10ZWFsLTYwMCBib3JkZXItMSBib3JkZXItdGVhbC01MDAgaG92ZXI6YmctdGVhbC01MDAgcm91bmRlZCBjdXJzb3ItcG9pbnRlciBjZW50ZXItY2hpbGQgc2VsZWN0LW5vbmUgdGV4dC13aGl0ZSBmb250LXNlbWlib2xkIHAtNCBweS0zIG0tMlwiLFxuICAgICAgICBcIndyYXBwZXItaFwiOlxuICAgICAgICAgIFwicC02IGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIHNwYWNlLXgtNCBzcGFjZS15LTAgYmctZ3JheS03MDAgcm91bmRlZC0yeGxcIixcbiAgICAgICAgXCJ3cmFwcGVyLXZcIjogXCJ3cmFwcGVyLWggZmxleC1jb2wgc3BhY2UteC0wIHNwYWNlLXktNFwiLFxuICAgICAgICBub2RlOiBcInAtNCBiZy1vcmFuZ2UtNjAwIHJvdW5kZWQgbS0yXCJcbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbXCJAc29saWQtcHJpbWl0aXZlcy91dGlsc1wiXVxuICB9XG59KTtcblxuZXhwb3J0IGNvbnN0IHZpdGVzdENvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gIHRlc3Q6IHtcbiAgICBjbGVhck1vY2tzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgdHJhbnNmb3JtTW9kZToge1xuICAgICAgd2ViOiBbL1xcLltqdF1zeD8kL11cbiAgICB9LFxuICAgIGRlcHM6IHtcbiAgICAgIGlubGluZTogWy9zb2xpZC1qcy9dXG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgY29uZGl0aW9uczogW1wiZGV2ZWxvcG1lbnRcIiwgXCJicm93c2VyXCJdXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFtcIkBzb2xpZC1wcmltaXRpdmVzL3V0aWxzXCJdXG4gIH1cbn0pO1xuIiwgImltcG9ydCB7IHZpdGVDb25maWcgfSBmcm9tIFwiLi4vLi4vLi4vdml0ZS5jb25maWdcIjtcbmV4cG9ydCBkZWZhdWx0IHZpdGVDb25maWc7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQTtBQUNBO0FBQ0E7QUFFTyxJQUFNLGFBQWEsYUFBYTtBQUFBLEVBQ3JDLFNBQVM7QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxRQUNULGdCQUFnQjtBQUFBLFFBQ2hCLFNBQVM7QUFBQSxRQUNULEtBQUs7QUFBQSxRQUNMLGFBQ0U7QUFBQSxRQUNGLGFBQWE7QUFBQSxRQUNiLE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHlCQUF5QjtBQUFBLEVBQ3JDO0FBQ0YsQ0FBQztBQUVNLElBQU0sZUFBZSxhQUFhO0FBQUEsRUFDdkMsTUFBTTtBQUFBLElBQ0osWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsS0FBSyxDQUFDLFlBQVk7QUFBQSxJQUNwQjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osUUFBUSxDQUFDLFVBQVU7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFlBQVksQ0FBQyxlQUFlLFNBQVM7QUFBQSxFQUN2QztBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHlCQUF5QjtBQUFBLEVBQ3JDO0FBQ0YsQ0FBQzs7O0FDeENELElBQU8sc0JBQVE7IiwKICAibmFtZXMiOiBbXQp9Cg==
