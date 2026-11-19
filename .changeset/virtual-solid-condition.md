---
"@solid-primitives/virtual": patch
---

Fix the package failing to resolve under the `solid` export condition. The `exports` map pointed that condition at `./dist/index.jsx`, which is never built, so bundlers using it (vite-plugin-solid, Solid Start) failed with `ERR_MODULE_NOT_FOUND`. The condition is removed so resolution falls through to `./dist/index.js`.
