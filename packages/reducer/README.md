# @solid-primitives/reducer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/reducer?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/reducer)
[![version](https://img.shields.io/npm/v/@solid-primitives/reducer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/reducer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

SolidJS equavalent of React [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer).

## Installation

```bash
npm install @solid-primitives/reducer
# or
yarn add @solid-primitives/reducer
```

## How to use it

```ts
const [acessor, dispatch] = createReducer(reducer, initialValue);
```

For example:
```tsx
function Counter() {
	const [count, double] = createReducer(c => c * 2, 1);

	return <button onClick={double}>{count()}</button>;
}
```

The reducer also can receive other arguments:
```tsx
const dispatcher = (c: number, type: "double" | "increment") => {
	if (type == "double") {
		return c * 2;
	} else {
		return c + 1;
	}
}

function Counter() {
	const [count, handleClick] = createReducer(dispatcher, 1);

	return <div>
		<span>{count()}</span>

		<button onClick={() => handleClick("double")}>Double</button>
		<button onClick={() => handleClick("increment")}>Increment</button>
	</div>;
}
```

React allows a 3rd argument:
```ts
const fib = (n: number) => n < 2 ? n : fib(n-1) + fib(n-2);
const nextFib = (n: number) => Math.round(n * (1 + sqrt(5)) / 2);

const [fibonacci, nextFibonacci] = useReducer(nextFib, 1, fib);
```
You need to convert that to the following format:
```ts
const [fibonacci, nextFibonacci] = createReducer(nextFib, fib(1));
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
