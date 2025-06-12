import { Component, createSignal } from "solid-js";
import { Match } from "../src/index.js"

type AnimalDog = {kind: 'dog', breed: string};
type AnimalCat = {kind: 'cat', lives: number};
type AnimalBird = {kind: 'bird', canFly: boolean};

type Animal = AnimalDog | AnimalCat | AnimalBird;

const DogDisplay: Component<{ animal: AnimalDog }> = (props) => (
  <div class="text-center">
    <div class="text-2xl mb-2">🐕</div>
    <div class="text-sm">Breed: {props.animal.breed}</div>
  </div>
);

const CatDisplay: Component<{ animal: AnimalCat }> = (props) => (
  <div class="text-center">
    <div class="text-2xl mb-2">🐱</div>
    <div class="text-sm">Lives: {props.animal.lives}</div>
  </div>
);

const BirdDisplay: Component<{ animal: AnimalBird }> = (props) => (
  <div class="text-center">
    <div class="text-2xl mb-2">🐦</div>
    <div class="text-sm">
      {props.animal.canFly ? 'Can fly' : 'Cannot fly'}
    </div>
  </div>
);

const FallbackDisplay: Component = () => (
  <div class="text-center">
    <div class="text-2xl mb-2">❓</div>
    <div>Fallback content</div>
  </div>
);

const App: Component = () => {
  const [animal, setAnimal] = createSignal<Animal | null>(null);

  const animals: (Animal | null)[] = [
    null,
    { kind: 'dog', breed: 'Golden Retriever' },
    { kind: 'cat', lives: 9 },
    { kind: 'bird', canFly: true },
  ];

  return (
    <div class="min-h-screen p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">Match Component Demo</h1>
          <p>Control-flow component for matching discriminated union members</p>
        </div>

        <div class="border border-gray-500 border-2 rounded-lg p-6">
          <label class="block text-sm font-medium mb-2">
            Select an animal:
          </label>
          <select 
            class="w-full p-2 border border-gray-500 border-2 rounded-md"
            onChange={e => {setAnimal(animals[parseInt(e.target.value)]!)}}
          >
            <option value="0">None (null)</option>
            <option value="1">Dog</option>
            <option value="2">Cat</option>
            <option value="3">Bird</option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="border border-gray-500 border-2 rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-1">Complete Match</h2>
            <p class="text-sm mb-4">Handles all union members with fallback</p>
            <div class="border border-gray-500 border-2 rounded p-4 min-h-[100px] flex items-center justify-center">
              <Match on={animal()} case={{
                dog: v => <DogDisplay animal={v()} />,
                cat: v => <CatDisplay animal={v()} />,
                bird: v => <BirdDisplay animal={v()} />,
              }} fallback={<FallbackDisplay />} />
            </div>
          </div>

          <div class="border border-gray-500 border-2 rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-1">Partial Match</h2>
            <p class="text-sm mb-4">Only handles dogs and cats</p>
            <div class="border border-gray-500 border-2 rounded p-4 min-h-[100px] flex items-center justify-center">
              <Match partial on={animal()} case={{
                dog: v => <DogDisplay animal={v()} />,
                cat: v => <CatDisplay animal={v()} />,
              }} fallback={<FallbackDisplay />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
