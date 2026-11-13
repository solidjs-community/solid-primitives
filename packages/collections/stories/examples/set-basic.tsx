import { For } from "solid-js";
import { createReactiveSet } from "@solid-primitives/collections";
import { BoolRow, Button, Card, Container, StatRow } from "../../../../.storybook/ui/index.js";

export function BasicSet() {
  const fruits = ["Apple", "Pear", "Plum"];
  const selected = createReactiveSet(["Apple"]);
  return (
    <Container>
      <For each={fruits}>
        {fruit => (
          <Card>
            <BoolRow label={`has(${fruit})`} value={selected.has(fruit)} />
            <Button
              variant={selected.has(fruit) ? "primary" : "outline"}
              onClick={() => (selected.has(fruit) ? selected.delete(fruit) : selected.add(fruit))}
            >
              Toggle {fruit}
            </Button>
          </Card>
        )}
      </For>
      <StatRow label="Selected" value={selected.size} />
      <StatRow label="Insertion order" value={[...selected].join(", ") || "Empty"} />
      <Button variant="outline" onClick={() => selected.clear()}>
        Clear selection
      </Button>
    </Container>
  );
}
