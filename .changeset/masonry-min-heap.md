---
"@solid-primitives/masonry": minor
---

Optimize shortest-column allocation using a zero-allocation `ColumnMinHeap` (reducing column searches from $O(N \cdot K)$ to $O(N \log K)$) with strict zero-`any` types.
