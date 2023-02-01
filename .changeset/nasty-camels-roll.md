---
"@solid-primitives/script-loader": major
---

Change `createScriptLoader` API to not return the remove script function - should be done with disposing the owner. React to src changes with createRenderEffect. Apply all passed props using solid's `spread` funcion to the script element.
