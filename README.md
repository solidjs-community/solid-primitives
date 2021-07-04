<p align="center">
  <img width="75px" src="https://raw.githubusercontent.com/solidjs/solid-site/dev/src/assets/logo.png" alt="Solid logo">
</p>

# Solid Primitives

This is a monorepo containing high-quality, community contributed Solid primitives. All primitives are well tested and continuously updated and managed. Every contribution to the repository is checked for quality and maintained by the highest degree of excellence. The ultimate goal is to provide a properly reactive layer for browser APIs and common helpers.

## Philosophy

The goal of Solid Primitive is to be an official aggregation of primitive utilities. Each primitive is designed to act as a building block or keystone, the goal being to DRY up logic so that apps built within the Solid ecosystem don't have to depend on dispersed and highly decentralised logic.

ie. Consider covalent bonds that share electron pairs between atoms. Primitives are similar in the sense that there's an optimal and natural orchestration of structure that create increasingly complex compounded logic. Our philosophy is to define a base set of atoms that naturally create covalent properties and efficiencies in systemic logic.

Ultimately the more rooted these primitives are within Solid's the smaller (aggregate tree-shaking benefits), more concise (readability) and stable (consistent and managed testing + maintenance) applications can be.

## Design Maxims

All Solid Primitive packages follow a single consistency and promise. We guarentee that each is created with the utmost care, providing primitivates that are:

1. Documented and follow a consistent style guide
2. Are well tested
3. As small, concise and practical as possible
4. A single primitive for a single purpose
5. As few, if none, dependencies as possible
6. SSR safe entries provided

## Compound vs. Isolated Primitives

Each primitive is designed with composition or segmentation in mind. To align with the goal of being small and concise a major rule to designing our primitives is deciding if the interface for primitives should be: composable or segmented. For this reason every API is intricately studied and considered to be composed (stacked with features) or composed into smaller units.

Designing our primitives in this manner allows for better tree shaking. Why ship a createStorage primitive with a storage listener when you can easily augment the base storage mechanic with listener rider.

## Current Primitives

-   createAudio
-   createStorage
-   createIntersectionObserver
-   createResizeObserver
-   createWebsocket
-   createTimer
-   createGeolocation
-   createWorker
-   createListener

## Upcoming Primitives

-   createMediaQuery
-   createRAF
-   createThrottle
-   createHistory
