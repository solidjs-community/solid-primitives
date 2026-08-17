---
"@solid-primitives/interaction": patch
---

fix: `makeInteractOutside`/`createInteractOutside` firing outside-interaction callbacks from an orphaned instance whose watched element was removed from the document before its reactive owner disposed (a common race when a dismissable layer closes and a new one opens in quick succession)
