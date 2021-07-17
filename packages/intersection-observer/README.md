# @solid-primitives/intersection-observer

Creates a helper to manage IntersectionObserver.

`createIntersectionObserver` - Creates a basic intersection observer exposing methods to manage the observable.
`createViewportObserver` - More advanced tracker that creates a store of element signals.

## How to use it

```ts
const [ add, remove, start, stop ] = createIntersectionObserver(el);
add(el, (entry) => console.log(entry.isIntersecting);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-intersection-observer-h22it?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Committing first version of primitive.

</details>
