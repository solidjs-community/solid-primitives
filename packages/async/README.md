# createAsync

An asynchronous primitive with a function that tracks similar to `createMemo`.
`createAsync` expects a promise back that is then turned into a Signal.
Reading it before it is ready causes Suspense/Transitions to trigger.

<Callout type="caution">
	Using `query` in `createResource` directly will not work since the fetcher is
	not reactive. This means that it will not invalidate properly.
</Callout>

This is light wrapper over [`createResource`](https://docs.solidjs.com/reference/basic-reactivity/create-resource) which serves as a stand-in for a future primitive being brought to Solid core in 2.0. 
It is recommended that `createAsync` be used in favor of `createResource` specially when in a **SolidStart** app because `createAsync` works better in conjunction with the [cache](https://docs.solidjs.com/solid-router/reference/data-apis/cache) helper.



```tsx title="component.tsx" {6,10}
import { createAsync } from "@solid-primitives/async";
import { Suspense } from "solid-js";
import { getUser } from "./api";

export function Component () => {
	const user = createAsync(() => getUser(params.id));

	return (
		<Suspense fallback="loading user...">
			<p>{user()}</p>
		</Suspense>
	);
```

## Options

| Name         | Type                    | Default        | Description                                                                                                                                                   |
| ------------ | ----------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name         | `string`                | `undefined`    | A name for the resource. This is used for debugging purposes.                                                                                                 |
| deferStream  | `boolean`               | `false`        | If true, Solid will wait for the resource to resolve before flushing the stream.                                                                              |
| initialValue | `any`                   | `undefined`    | The initial value of the resource.                                                                                                                            |
| onHydrated   | `function`              | `undefined`    | A callback that is called when the resource is hydrated.                                                                                                      |
| ssrLoadFrom  | `"server" \| "initial"` | `"server"`     | The source of the initial value for SSR. If set to `"initial"`, the resource will use the `initialValue` option instead of the value returned by the fetcher. |
| storage      | `function`              | `createSignal` | A function that returns a signal. This can be used to create a custom storage for the resource. This is still experimental     


# createAsyncStore

Similar to createAsync except it uses a deeply reactive store. Perfect for applying fine-grained changes to large model data that updates.

```jsx
const todos = createAsyncStore(() => getTodos());
```
