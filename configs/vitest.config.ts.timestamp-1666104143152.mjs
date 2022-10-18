// ../../configs/vitest.config.ts
import path from "path";
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
var cwd = process.cwd();
var vitest_config_default = defineConfig(({ mode }) => {
  const testSSR = mode === "test:ssr" || mode === "ssr";
  return {
    plugins: [solidPlugin()],
    test: {
      watch: false,
      env: {
        NODE_ENV: testSSR ? "production" : "development",
        DEV: testSSR ? "" : "1",
        SSR: testSSR ? "1" : "",
        PROD: testSSR ? "1" : ""
      },
      globals: true,
      clearMocks: true,
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx?$/]
      },
      ...testSSR && { include: ["server.test.{ts,tsx}"] },
      ...!testSSR && { exclude: ["server.test.{ts,tsx}"] },
      dir: path.resolve(cwd, "test")
    },
    resolve: {
      ...testSSR ? {
        alias: {
          "solid-js/web": path.resolve(cwd, "node_modules/solid-js/web/dist/server.js"),
          "solid-js/store": path.resolve(cwd, "node_modules/solid-js/store/dist/server.js"),
          "solid-js": path.resolve(cwd, "node_modules/solid-js/dist/server.js")
        }
      } : {
        conditions: ["browser", "development"]
      }
    }
  };
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY29uZmlncy92aXRlc3QuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZ3RoZXRcXFxcUmVwb3NpdG9yaWVzXFxcXHNvbGlkLXByaW1pdGl2ZXNcXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZ3RoZXRcXFxcUmVwb3NpdG9yaWVzXFxcXHNvbGlkLXByaW1pdGl2ZXNcXFxcY29uZmlnc1xcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ndGhldC9SZXBvc2l0b3JpZXMvc29saWQtcHJpbWl0aXZlcy9jb25maWdzL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcbmltcG9ydCBzb2xpZFBsdWdpbiBmcm9tIFwidml0ZS1wbHVnaW4tc29saWRcIjtcblxuY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAvLyB0ZXN0IGluIHNlcnZlciBlbnZpcm9ubWVudFxuICAvLyBsb2FkcyBvbmx5IHNlcnZlci50ZXN0LnRzIGZpbGVcbiAgY29uc3QgdGVzdFNTUiA9IG1vZGUgPT09IFwidGVzdDpzc3JcIiB8fCBtb2RlID09PSBcInNzclwiO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3NvbGlkUGx1Z2luKCldLFxuICAgIHRlc3Q6IHtcbiAgICAgIHdhdGNoOiBmYWxzZSxcbiAgICAgIGVudjoge1xuICAgICAgICBOT0RFX0VOVjogdGVzdFNTUiA/IFwicHJvZHVjdGlvblwiIDogXCJkZXZlbG9wbWVudFwiLFxuICAgICAgICBERVY6IHRlc3RTU1IgPyBcIlwiIDogXCIxXCIsXG4gICAgICAgIFNTUjogdGVzdFNTUiA/IFwiMVwiIDogXCJcIixcbiAgICAgICAgUFJPRDogdGVzdFNTUiA/IFwiMVwiIDogXCJcIlxuICAgICAgfSxcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICBjbGVhck1vY2tzOiB0cnVlLFxuICAgICAgcGFzc1dpdGhOb1Rlc3RzOiB0cnVlLFxuICAgICAgZW52aXJvbm1lbnQ6IHRlc3RTU1IgPyBcIm5vZGVcIiA6IFwianNkb21cIixcbiAgICAgIHRyYW5zZm9ybU1vZGU6IHtcbiAgICAgICAgd2ViOiBbL1xcLltqdF1zeD8kL11cbiAgICAgIH0sXG4gICAgICAuLi4odGVzdFNTUiAmJiB7IGluY2x1ZGU6IFtcInNlcnZlci50ZXN0Lnt0cyx0c3h9XCJdIH0pLFxuICAgICAgLi4uKCF0ZXN0U1NSICYmIHsgZXhjbHVkZTogW1wic2VydmVyLnRlc3Que3RzLHRzeH1cIl0gfSksXG4gICAgICBkaXI6IHBhdGgucmVzb2x2ZShjd2QsIFwidGVzdFwiKVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgLi4uKHRlc3RTU1JcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICBcInNvbGlkLWpzL3dlYlwiOiBwYXRoLnJlc29sdmUoY3dkLCBcIm5vZGVfbW9kdWxlcy9zb2xpZC1qcy93ZWIvZGlzdC9zZXJ2ZXIuanNcIiksXG4gICAgICAgICAgICAgIFwic29saWQtanMvc3RvcmVcIjogcGF0aC5yZXNvbHZlKGN3ZCwgXCJub2RlX21vZHVsZXMvc29saWQtanMvc3RvcmUvZGlzdC9zZXJ2ZXIuanNcIiksXG4gICAgICAgICAgICAgIFwic29saWQtanNcIjogcGF0aC5yZXNvbHZlKGN3ZCwgXCJub2RlX21vZHVsZXMvc29saWQtanMvZGlzdC9zZXJ2ZXIuanNcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIDoge1xuICAgICAgICAgICAgY29uZGl0aW9uczogW1wiYnJvd3NlclwiLCBcImRldmVsb3BtZW50XCJdXG4gICAgICAgICAgfSlcbiAgICB9XG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFYsT0FBTyxVQUFVO0FBQy9XLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8saUJBQWlCO0FBRXhCLElBQU0sTUFBTSxRQUFRLElBQUk7QUFFeEIsSUFBTyx3QkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFHeEMsUUFBTSxVQUFVLFNBQVMsY0FBYyxTQUFTO0FBRWhELFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFBQSxJQUN2QixNQUFNO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsUUFDSCxVQUFVLFVBQVUsZUFBZTtBQUFBLFFBQ25DLEtBQUssVUFBVSxLQUFLO0FBQUEsUUFDcEIsS0FBSyxVQUFVLE1BQU07QUFBQSxRQUNyQixNQUFNLFVBQVUsTUFBTTtBQUFBLE1BQ3hCO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsTUFDWixpQkFBaUI7QUFBQSxNQUNqQixhQUFhLFVBQVUsU0FBUztBQUFBLE1BQ2hDLGVBQWU7QUFBQSxRQUNiLEtBQUssQ0FBQyxZQUFZO0FBQUEsTUFDcEI7QUFBQSxNQUNBLEdBQUksV0FBVyxFQUFFLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRTtBQUFBLE1BQ25ELEdBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLHNCQUFzQixFQUFFO0FBQUEsTUFDcEQsS0FBSyxLQUFLLFFBQVEsS0FBSyxNQUFNO0FBQUEsSUFDL0I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLEdBQUksVUFDQTtBQUFBLFFBQ0UsT0FBTztBQUFBLFVBQ0wsZ0JBQWdCLEtBQUssUUFBUSxLQUFLLDBDQUEwQztBQUFBLFVBQzVFLGtCQUFrQixLQUFLLFFBQVEsS0FBSyw0Q0FBNEM7QUFBQSxVQUNoRixZQUFZLEtBQUssUUFBUSxLQUFLLHNDQUFzQztBQUFBLFFBQ3RFO0FBQUEsTUFDRixJQUNBO0FBQUEsUUFDRSxZQUFZLENBQUMsV0FBVyxhQUFhO0FBQUEsTUFDdkM7QUFBQSxJQUNOO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
