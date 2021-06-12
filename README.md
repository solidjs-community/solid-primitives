<p align="center">
  <img width="75px" src="https://raw.githubusercontent.com/solidjs/solid-site/dev/src/assets/logo.png" alt="Solid logo">
</p>

# Solid Primitives

This is a monorepo containing high-quality, community contributed Solid primitives. All primitives include well tested and continuously updated and managed primitive types. Every contribution to the repository is checked for quality and maintained by the highest degree of excellence.

## Quality Design Rules

All Solid Primitive packages follow a single consistency and promise. We guarentee that each is created with the utmost care, providing primitivates that are:

1. Documented and follow a consistent style guide
2. Are well tested
3. As small, concise and practical as possible
4. A single primitive for a single purpose
5. As few, if none, dependencies as possible
6. SSR safe entries provided

## Composable vs. Segmented Primitives

Each primitive is designed with composition or segmentation in mind. To align with the goal of being small and concise a major rule to designing our primitives is deciding if the interface for primitives should be: composable or segmented. For this reason every API is intricately studied and considered to be composed (stacked with features) or composed into smaller units.

Designing our primitives in this manner allows for better tree shaking. Why ship a createStorage primitive with a storage listener when you can easily augment the base storage mechanic with listener rider.

## Current Primitives

- createStorage
- createIntersectionObserver
- createTimer
- createGeolocation
- createWorker
