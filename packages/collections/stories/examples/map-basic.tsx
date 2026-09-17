import { For } from "solid-js";
import { createReactiveMap } from "@solid-primitives/collections";
import { Button, ButtonRow, Card, Container, StatRow } from "../../../../.storybook/ui/index.js";

export function BasicMap() {
  const players = ["Alice", "Bob", "Carol"];
  const scores = createReactiveMap<string, number>(players.map(name => [name, 0] as const));
  return (
    <Container>
      <For each={players}>
        {name => (
          <Card>
            <StatRow label={name} value={scores.get(name) ?? "Not playing"} />
            <ButtonRow>
              <Button onClick={() => scores.set(name, (scores.get(name) ?? 0) + 1)}>
                Add point to {name}
              </Button>
              <Button variant="outline" onClick={() => scores.delete(name)}>
                Remove {name}
              </Button>
            </ButtonRow>
          </Card>
        )}
      </For>
      <StatRow label="Players in map" value={scores.size} />
      <Button variant="outline" onClick={() => scores.clear()}>
        Clear scores
      </Button>
    </Container>
  );
}
