import { createSignal, For, Loading } from "solid-js";
import { createReactiveMap } from "@solid-primitives/collections";
import { Button, Card, Container, StatRow } from "../../../../.storybook/ui/index.js";
import { wait } from "./shared.ts";

export function StreamingMap() {
  const [round, setRound] = createSignal(1);
  const scores = createReactiveMap<string, number>(async function* (draft) {
    const currentRound = round();
    draft.clear();
    yield;
    for (const [index, name] of ["Alice", "Bob", "Carol"].entries()) {
      await wait(500);
      draft.set(name, currentRound * 10 + index);
      yield;
    }
  });
  return (
    <Container>
      <StatRow label="Round" value={round()} />
      <Button onClick={() => setRound(value => value + 1)}>Start next round</Button>
      <Loading fallback={<Card>Opening score stream…</Card>}>
        <Card>
          <For each={[...scores]} fallback={<span>Waiting for the first score…</span>}>
            {([name, score]) => <StatRow label={name} value={score} />}
          </For>
        </Card>
        <p role="status">
          {scores.size === 3 ? "All scores received" : `Received ${scores.size} of 3 scores`}
        </p>
      </Loading>
    </Container>
  );
}
