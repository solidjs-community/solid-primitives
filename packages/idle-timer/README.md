<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=idle-timer" alt="Solid Primitives idle-timer">
</p>

# @solid-primitives/idle-timer

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/idle-timer?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/idle-timer)
[![version](https://img.shields.io/npm/v/@solid-primitives/idle-timer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/idle-timer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

`makeIdleTimer` - A primitive to observe the user's idle state and react to its changes.


## Installation

```bash
npm install @solid-primitives/idle-timer
# or
yarn add @solid-primitives/idle-timer
# or
pnpm add @solid-primitives/idle-timer
```

## How to use it
`makeIdleTimer` provide several accessors and methods to monitor changes in the user idle status, as well as
### Simple example
```ts
const App: Component = () => {
  const { isIdle, isPrompted, reset } = makeUserIdleTimer({
    onIdle: logout,
    idleTimeout: 300_000,
    promptTimeout: 60_000,
  });
  return (
    <Switch
      fallback={<ClientPage />}
    >
      <Match when={isIdle()}>
        <LoggedOut />
      </Match>
      <Match when={isPrompted()}>
        <PromptPopup onConfirm={reset /*or stop*/}/>
      </Match>
    </Switch>
  );
};
```
### Configuation options
`makeIdleTimer` takes as optional argument an object with the timer's configuration options. Each key has a default value.
The options are:
- **idleTimout**: `number`, time of user's inactivity in milliseconds before the idle status changes to idle. This time is extended by the `promptTimeout` option.
- **promptTimout**: `number`, time of user's inactivity in milliseconds before the idle status changes to idle. This time is extended by the `promptTimeout` option.
- **onIdle**: `(evt: Event) => void`, callback triggered when the user status passes to idle. When invoked, the last event before going idle will be passed as parameter.
- **onPrompt**: `(evt: Event) => void`, when the idleTimer expires, promptTimeout timer startscallback triggered when the user status passes to idle. When invoked, the last event before going idle will be passed as parameter.


## Demo

You can use this template for publishing your demo on StackBlitz: https://stackblitz.com/edit/vitejs-vite-dwxlhp?file=src/App.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
