<p align="center">
  <img width="75px" src="https://raw.githubusercontent.com/solidjs/solid-site/dev/src/assets/logo.png" alt="Solid logo">
</p>

# Solid Primitives

A project that strives to develop high-quality, community contributed Solid primitives. All utilities are well tested and continuously maintained. Every contribution to the repository is checked for quality and maintained by the highest degree of excellence. The ultimate goal is to extend Solid's primary and secondary primitives with a set of tertiary primitives.

## Philosophy

The goal of Solid Primitives is to wrap client and server side functionality to provide a fully reactive API layer. Ultimately the more rooted our tertiary primitives are, the more they act as foundation within Solid's base ecosystem. With well built and re-used foundations, the smaller (aggregate tree-shaking benefits), more concise (readability) and stable (consistent and managed testing + maintenance) applications can be overall.

## A Rallying Call

Other frameworks have large and extremely well established ecosystems. Notably React which has a vast array of component and hooks. The amount of choice within the ecosystem is great but often these tools are built as one-offs resulting in often un-tested logic or are designed with narrow needs. Over time the less concise these building blocks are the more they tend to repeat themselves. Our goal with Primitives is to bring the community together to contribute, evolve and utilize a powerful centralize primitive foundation.

## Design Maxims

All our primitives are meant to be consistent and sustain a level of quality. We guarentee that each is created with the utmost care. Our primitivates are:

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

Each primitive is designed with composition in mind. To align with the goal of being small and concise a major rule to designing our primitives is deciding if the interface for primitives should be: composable or segmented. For this reason every API is intricately studied and considered to be composed (stacked with features) or composed into smaller units.

Designing our primitives in this manner allows for better tree shaking and very layering complexity as needed. Only ship what you have to by picking from existing primitives as your foundational building blocks.

## Primitives

### Display & Media

- [x] [createAudio](https://github.com/davedbase/solid-primitives/tree/main/packages/audio)
- [x] [createMediaQuery](https://github.com/davedbase/solid-primitives/tree/main/packages/media)
- [x] [createRAF](https://github.com/davedbase/solid-primitives/tree/main/packages/raf)
- [x] [createResizeObserver](https://github.com/davedbase/solid-primitives/tree/main/packages/resize-observer)
- [x] [createIntersectionObserver](https://github.com/davedbase/solid-primitives/tree/main/packages/intersection-observer)
- [x] [createStream](https://github.com/davedbase/solid-primitives/tree/main/packages/stream)
- [x] [createDevices](https://github.com/davedbase/solid-primitives/tree/main/packages/devices)
- [x] [createMicrophones](https://github.com/davedbase/solid-primitives/tree/main/packages/devices)
- [x] [createCameras](https://github.com/davedbase/solid-primitives/tree/main/packages/devices)
- [x] [createSpeakers](https://github.com/davedbase/solid-primitives/tree/main/packages/devices)
- [x] [createAmplitudeStream](https://github.com/davedbase/solid-primitives/tree/main/packages/stream)
- [x] [createMediaPermissionRequest](https://github.com/davedbase/solid-primitives/tree/main/packages/stream)
- [ ] [createPermission](https://github.com/davedbase/solid-primitives/tree/main/packages/permission)
- [ ] createDragAndDrop
- [ ] createPageVisibilityObserver

### Device

- [x] [createFullscreen](https://github.com/davedbase/solid-primitives/tree/main/packages/fullscreen)
- [ ] createBattery
- [ ] createAccelerometer
- [ ] createGyroscope

### Browser

- [x] [createStorage](https://github.com/davedbase/solid-primitives/tree/main/packages/storage)
- [x] [createLocalStorage](https://github.com/davedbase/solid-primitives/tree/main/packages/storage)
- [x] [createCookieStorage](https://github.com/davedbase/solid-primitives/tree/main/packages/storage)
- [x] [createSessionStorage](https://github.com/davedbase/solid-primitives/tree/main/packages/storage)
- [x] [createGeolocation](https://github.com/davedbase/solid-primitives/tree/main/packages/geolocation)
- [x] [createEventListener](https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener)
- [x] [createClipboard](https://github.com/davedbase/solid-primitives/tree/main/packages/clipboard)
- [ ] createURL
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
- [ ] createInput
- [ ] createTouch
- [ ] createMouse

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
