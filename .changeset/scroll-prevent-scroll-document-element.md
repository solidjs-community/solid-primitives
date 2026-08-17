---
"@solid-primitives/scroll": patch
---

`createPreventScroll` now locks scroll on `document.documentElement` instead of `<body>`. Locking `<body>` could break `position: sticky` elements, since sticky positioning is computed relative to the nearest scrolling ancestor — when that ancestor was `<body>` instead of the viewport, sticky children would unstick while scroll was prevented. Scrollbar-width, padding/margin compensation, and scroll-position restoration are all computed against `documentElement` now as well.
