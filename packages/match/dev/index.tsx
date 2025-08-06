import { Component, createSignal } from "solid-js";
import { MatchTag, MatchValue } from "../src/index.js";

type AnimalDog = { type: "dog"; breed: string };
type AnimalCat = { type: "cat"; lives: number };
type AnimalBird = { type: "bird"; canFly: boolean };

type Animal = AnimalDog | AnimalCat | AnimalBird;

const DogDisplay: Component<{ animal: AnimalDog }> = props => (
  <div class="text-center">
    <div class="mb-2 text-2xl">🐕</div>
    <div class="text-sm">Breed: {props.animal.breed}</div>
  </div>
);

const CatDisplay: Component<{ animal: AnimalCat }> = props => (
  <div class="text-center">
    <div class="mb-2 text-2xl">🐱</div>
    <div class="text-sm">Lives: {props.animal.lives}</div>
  </div>
);

const BirdDisplay: Component<{ animal: AnimalBird }> = props => (
  <div class="text-center">
    <div class="mb-2 text-2xl">🐦</div>
    <div class="text-sm">{props.animal.canFly ? "Can fly" : "Cannot fly"}</div>
  </div>
);

const FallbackDisplay: Component = () => (
  <div class="text-center">
    <div class="mb-2 text-2xl">❓</div>
    <div>Fallback content</div>
  </div>
);

const App: Component = () => {
  const [animal, setAnimal] = createSignal<Animal | null>(null);

  const animals: (Animal | null)[] = [
    null,
    { type: "dog", breed: "Golden Retriever" },
    { type: "cat", lives: 9 },
    { type: "bird", canFly: true },
  ];

  return (
    <div class="min-h-screen p-8">
      <div class="mx-auto max-w-4xl space-y-8">
        <div class="text-center">
          <h1 class="mb-2 text-3xl font-bold">Match Component Demo</h1>
          <p>Control-flow component for matching discriminated union members</p>
        </div>

        <div class="rounded-lg border border-2 border-gray-500 p-6">
          <label class="mb-2 block text-sm font-medium">Select an animal:</label>
          <select
            class="w-full rounded-md border border-2 border-gray-500 p-2"
            onChange={e => {
              setAnimal(animals[parseInt(e.target.value)]!);
            }}
          >
            <option value="0">None (null)</option>
            <option value="1">Dog</option>
            <option value="2">Cat</option>
            <option value="3">Bird</option>
          </select>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div class="rounded-lg border border-2 border-gray-500 p-6">
            <h2 class="mb-1 text-xl font-semibold">Complete Match</h2>
            <p class="mb-4 text-sm">Handles all union members with fallback</p>
            <div class="flex min-h-[100px] items-center justify-center rounded border border-2 border-gray-500 p-4">
              <MatchTag
                on={animal()}
                case={{
                  dog: v => <DogDisplay animal={v()} />,
                  cat: v => <CatDisplay animal={v()} />,
                  bird: v => <BirdDisplay animal={v()} />,
                }}
                fallback={<FallbackDisplay />}
              />
            </div>
          </div>

          <div class="rounded-lg border border-2 border-gray-500 p-6">
            <h2 class="mb-1 text-xl font-semibold">Partial Match</h2>
            <p class="mb-4 text-sm">Only handles dogs and cats</p>
            <div class="flex min-h-[100px] items-center justify-center rounded border border-2 border-gray-500 p-4">
              <MatchTag
                partial
                on={animal()}
                case={{
                  dog: v => <DogDisplay animal={v()} />,
                  cat: v => <CatDisplay animal={v()} />,
                }}
                fallback={<FallbackDisplay />}
              />
            </div>
          </div>
        </div>

        <div class="mt-8 rounded-lg border border-2 border-gray-500 p-6">
          <h2 class="mb-1 text-xl font-semibold">Value Match</h2>
          <p class="mb-4 text-sm">Match on union literals</p>
          <div class="flex min-h-[100px] items-center justify-center rounded border border-2 border-gray-500 p-4">
            <MatchValue
              on={animal()?.type}
              case={{
                dog: () => <p>🐕</p>,
                cat: () => <p>🐱</p>,
                bird: () => <p>🐦</p>,
              }}
              fallback={<FallbackDisplay />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
