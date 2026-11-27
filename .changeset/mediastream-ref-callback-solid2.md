---
"@solid-primitives/mediastream": patch
---

Fix the README `createStream` and `createScreen` examples, which created an effect inside a JSX `ref` callback and threw `PRIMITIVE_IN_EFFECT_CALLBACK` in Solid 2 (#1143). They now keep the element in a signal via `ref={setVideo}` and assign `srcObject` from an effect in the component body. Documentation only, no source change.
