# @solid-primitives/destructure

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/destructure?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/destructure)
[![version](https://img.shields.io/npm/v/@solid-primitives/destructure?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/destructure)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitives for destructuring a reactive object _(like component props or a store)_ or signal returning one into a map of accessors.

- **[`spread`](#spread)** - Spread an reactive object **eagerely**.
- **[`destructure`](#destructure)** - Destructure an reactive object **lazily**.

## `spread`

Spreads an reactive object _(store or props)_ or a reactive object signal into a tuple/map of signals for each object key. **(source object needs to have static keys – all the keys are eagerly spread)**

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release of the destructure package.

</details>
