import { createSignal, For, isPending, Loading } from "solid-js";
import { createReactiveMap } from "@solid-primitives/collections";
import { Button, ButtonRow, Card, Container, StatRow } from "../../../../.storybook/ui/index.js";
import { wait } from "./shared.ts";

export function AsyncMap() {
  const [warehouse, setWarehouse] = createSignal("North");
  const stock = createReactiveMap<string, number>(async () => {
    // Read dependencies before awaiting so changing the warehouse recomputes the map.
    const selected = warehouse();
    await wait();
    return new Map(
      selected === "North"
        ? [
            ["Apples", 12],
            ["Pears", 5],
          ]
        : [
            ["Apples", 3],
            ["Plums", 8],
          ],
    );
  });
  return (
    <Container>
      <ButtonRow>
        <For each={["North", "South"]}>
          {name => (
            <Button
              variant={warehouse() === name ? "primary" : "outline"}
              onClick={() => setWarehouse(name)}
            >
              {name} warehouse
            </Button>
          )}
        </For>
      </ButtonRow>
      <Loading fallback={<Card>Fetching inventory…</Card>}>
        <p role="status">
          {isPending(() => stock.size) ? "Loading inventory…" : `${warehouse()} inventory ready`}
        </p>
        <Card>
          <For each={[...stock]}>{([name, count]) => <StatRow label={name} value={count} />}</For>
        </Card>
        <StatRow label="Products" value={stock.size} />
      </Loading>
    </Container>
  );
}
