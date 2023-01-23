<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=option" alt="Solid Primitives option">
</p>

# @solid-primitives/option

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/option?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/option)
[![version](https://img.shields.io/npm/v/@solid-primitives/option?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/option)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A set of utilities to simplify using Optional values, very much inspired by [Rust's Option](https://doc.rust-lang.org/stable/std/option/enum.Option.html)

`createOption` - Creates a reactive Option instance.

`makeOption` - Creates a non-reactive Option instance.

`Some` - Similar to `makeOption` but with a required initial value.

`None` - Similar to `makeOption` but with a default None value.

## Installation

```bash
npm install @solid-primitives/option
# or
yarn add @solid-primitives/option
# or
pnpm add @solid-primitives/option
```

# Usage with stores

```tsx
const [user, setUser] = createStore({
  role: Some(1),
  submissionValue: None()
});

return <div>{user.role.unwrap() || "Role is null"}</div>;
```

# usage with createOption

```tsx
const [errors, setErrors] = createOption<string[]>(null);

return (
  <div>
    Errors:{" "}
    {errors()
      .unwrap_or(["Default"])
      .map((error, index) => `${index + 1}. ${error}`)}
  </div>
);
```
