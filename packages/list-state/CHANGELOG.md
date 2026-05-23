# @solid-primitives/list-state

## 0.1.0

### Initial Release

- Added `createListState` - Single-select list with keyboard navigation
- Added `createMultiSelectListState` - Multi-select list with cursor-based navigation and range selection
- Full keyboard support: Arrow keys, Vim bindings (hjkl), Home/End, Tab
- Configurable orientation: Vertical or horizontal lists
- Bidirectional text: RTL and LTR support
- List looping: Optional looping at list boundaries
- Range selection: Shift+Arrow for multi-select range expansion
- Type-safe: Full TypeScript support with generic item types
- SSR-safe: Works in both browser and server environments
- Zero dependencies: Relies only on Solid.js primitives

### Credits

Adapted from [corvu's solid-list](https://github.com/corvudev/corvu/tree/main/packages/solid-list) by [Jasmin Noetzli](https://github.com/GiyoMoon) and migrated to Solid Primitives for Solid 2.0. Used under the MIT License.
