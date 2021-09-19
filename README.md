<p align="center">
  <img width="75px" src="https://raw.githubusercontent.com/solidjs/solid-site/dev/src/assets/logo.png" alt="Solid logo">
</p>

# Solid Primitives

A project to aggregate and develop high-quality, community contributed Solid primitives, components and directives. All utilities are well tested and continuously maintained. Every contribution to the repository is checked for quality and maintained by the highest degree of excellence. The ultimate goal is to provide a properly reactive layer for browser APIs and common helpers.

## Philosophy

The goal of Solid Primitives is to be an official aggregation of utilities that wrap core logic on the client and server. Each primitive is designed to act as a building block or keystone, the goal being to DRY up source as much as possible and fit together logic as a compact system of parts.

Ultimately the more rooted these primitives are, the better they act as foundation within Solid's base ecosystem. With well built and re-used foundations, the smaller (aggregate tree-shaking benefits), more concise (readability) and stable (consistent and managed testing + maintenance) applications can be overall.

## A Rallying Call

Other frameworks have large and extremely well established ecosystems. Notably React which has a vast array of component and hooks. The amount of choice within the ecosystem is great but often these tools are built as one-offs resulting in often un-tested logic or are designed with narrow needs. Over time the less concise these building blocks are the more they tend to repeat themselves.

Our goal with Primitives is to bring the community together to contribute, evolve and use a base set of foundations in their work. The more we work together, the stronger and richer of an ecosystem we can build and the more we all benefit.

We aren't trying to replace the ecosystem of React and other libraries with a monosolution, but merely offer a consistent and tightly defined set of tools. A community ecosystem will and should continue offering alternatives to expand a users choice. It's this fine balance we as maintainers of Primitives need to juggle.

## Design Maxims

All Primitives packages follow a single consistency and promise. We guarentee that each is created with the utmost care, providing primitivates that are:

1. Documented and follow a consistent style guide
2. Be well tested
3. Small, concise and practical as possible
4. A single primitive for a single purpose
5. As few, if none, dependencies as possible
6. SSR safe entries provided
7. Wrap base level Browser APIs
8. Should be progressively improved for future features
9. Be focused on composition vs. isolation of logic
10. Community voice and needs guide roadmap and planning
11. Strong TypeScript support
12. Performance!

## Compound vs. Isolated Primitives

Each primitive is designed with composition or segmentation in mind. To align with the goal of being small and concise a major rule to designing our primitives is deciding if the interface for primitives should be: composable or segmented. For this reason every API is intricately studied and considered to be composed (stacked with features) or composed into smaller units.

Designing our primitives in this manner allows for better tree shaking and very layering complexity as needed. Only ship what you have to by picking from existing primitives as your foundational building blocks.

## Primitives

### Display & Media

- [x] [createAudio](https://github.com/davedbase/solid-primitives/tree/main/packages/audio)
- [x] [createMediaQuery](https://github.com/davedbase/solid-primitives/tree/main/packages/media)
- [x] [createRAF](https://github.com/davedbase/solid-primitives/tree/main/packages/raf)
- [x] [createResizeObserver](https://github.com/davedbase/solid-primitives/tree/main/packages/resize-observer)
- [x] [createIntersectionObserver](https://github.com/davedbase/solid-primitives/tree/main/packages/intersection-observer)
- [ ] createDragAndDrop
- [ ] createPageVisibilityObserver

### Device

- [ ] createBattery
- [ ] createFullscreen
- [ ] createAccelerometer
- [ ] createGyroscope

### Browser

- [x] [createLocalStore](https://github.com/davedbase/solid-primitives/tree/main/packages/local-store)
- [x] [createCookieStore](https://github.com/davedbase/solid-primitives/tree/main/packages/cookie-store)
- [x] [createGeolocation](https://github.com/davedbase/solid-primitives/tree/main/packages/geolocation)
- [x] [createEventListener](https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener)
- [ ] createURL
- [ ] createClipboard
- [ ] createHistory
- [ ] createLocale

### Network

- [x] [createFetch](https://github.com/davedbase/solid-primitives/tree/main/packages/fetch)
- [x] [createWebsocket](https://github.com/davedbase/solid-primitives/tree/main/packages/websocket)
- [x] [createGraphQLClient](https://github.com/davedbase/solid-primitives/tree/main/packages/graphql)
- [ ] createNotification
- [ ] createPush
- [ ] createConnectionObserver

### Inputs

- [x] [createScrollObserver](https://github.com/davedbase/solid-primitives/tree/main/packages/scroll-observer)
- [ ] createGesture (in progress)
- [ ] createKeyboard
- [ ] createForm
- [ ] createTouch

### Utilities

- [x] [createThrottle](https://github.com/davedbase/solid-primitives/tree/main/packages/throttle)
- [x] [createDebounce](https://github.com/davedbase/solid-primitives/tree/main/packages/debounce)
- [x] [createTimer](https://github.com/davedbase/solid-primitives/tree/main/packages/timer)
- [x] [createCountdown](https://github.com/davedbase/solid-primitives/tree/main/packages/countdown)
- [x] [createTween](https://github.com/davedbase/solid-primitives/tree/main/packages/tween)
- [x] [usei18n](https://github.com/davedbase/solid-primitives/tree/main/packages/i18n)
- [ ] createWorker (in progress)
- [ ] createQueue
- [ ] createDateDifference
- [ ] createEffectWhen
