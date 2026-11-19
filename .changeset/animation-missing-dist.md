---
"@solid-primitives/animation": patch
---

Fix the published package missing `dist/`. The package had no `tsdown` entry, so the workspace build skipped it and every release so far shipped only `LICENSE`, `README.md` and `package.json`, failing to import with `ERR_MODULE_NOT_FOUND`.
