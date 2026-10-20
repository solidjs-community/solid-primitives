import { createSignal, For, Loading } from "solid-js";
import { createReactiveSet } from "@solid-primitives/collections";
import { Button, ButtonRow, Card, Container } from "../../../../.storybook/ui/index.js";
import { wait } from "./shared.ts";

export function StreamingSet() {
  const [region, setRegion] = createSignal("Europe");
  const cities = createReactiveSet<string>(async function* (draft) {
    const names =
      region() === "Europe" ? ["Paris", "Berlin", "Oslo"] : ["Tokyo", "Seoul", "Taipei"];
    draft.clear();
    yield;
    for (const name of names) {
      await wait(500);
      draft.add(name);
      yield;
    }
  });
  return (
    <Container>
      <ButtonRow>
        <For each={["Europe", "Asia"]}>
          {name => (
            <Button
              variant={region() === name ? "primary" : "outline"}
              onClick={() => setRegion(name)}
            >
              {name}
            </Button>
          )}
        </For>
      </ButtonRow>
      <Loading fallback={<Card>Opening city stream…</Card>}>
        <Card>
          <For each={[...cities]} fallback={<span>Waiting for the first city…</span>}>
            {city => <div>{city}</div>}
          </For>
        </Card>
        <p role="status">
          {cities.size === 3 ? "All cities received" : `Received ${cities.size} of 3 cities`}
        </p>
      </Loading>
    </Container>
  );
}
