---
"@solid-primitives/filesystem": patch
---

`makeWebAccessFileSystem` now accepts a given directory handle (`webkitEntry`) in browsers without `showDirectoryPicker`, so the origin private file system (`navigator.storage.getDirectory()`) works in Firefox and Safari (`writeFile` needs `createWritable`, available in Safari 26+). Also fixes a missing quote in the `mkdir` error message.
