# Steps to reproduce:

1. `pnpm install`, `pnpm build`, `cd site`, `pnpm deploy`, `pnpm start`.
2. open site at `http://localhost:3000/`, open console tab to see logs.
3. click main top navbar hamburger menu button.

# Actual Result from logs:

After clicking hamburger menu button.

```
Header-DRV-Z9It.js:2 createTween invoke
Header-DRV-Z9It.js:2 createTween effect on target:  0
Header-DRV-Z9It.js:2 setFrom {navMenuHeight: 302}
```

# Expected Result from logs:

After clicking hamburger menu button.

```
index.ts:34 createTween invoke
index.ts:61 createTween effect on target:  0
Header.tsx:118 setFrom {navMenuHeight: 302}
createTween effect on target:  302
index.ts:69 createTween deferred effect
index.ts:46 createTween tick 5548.5
index.ts:46 createTween tick 5556.5
index.ts:46 createTween tick 5565.2
index.ts:46 createTween tick 5573.5
index.ts:46 createTween tick 5581.9
...
```
