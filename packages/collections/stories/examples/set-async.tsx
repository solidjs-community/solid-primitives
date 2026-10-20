import { createSignal, For, isPending, Loading } from "solid-js";
import { createReactiveSet } from "@solid-primitives/collections";
import {
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  StatRow,
} from "../../../../.storybook/ui/index.js";
import { wait } from "./shared.ts";

export function AsyncSet() {
  const [role, setRole] = createSignal("Reader");
  const permissions = createReactiveSet<string>(async () => {
    const selected = role();
    await wait();
    return new Set(selected === "Reader" ? ["Read"] : ["Read", "Write", "Publish"]);
  });
  return (
    <Container>
      <ButtonRow>
        <For each={["Reader", "Editor"]}>
          {name => (
            <Button variant={role() === name ? "primary" : "outline"} onClick={() => setRole(name)}>
              {name}
            </Button>
          )}
        </For>
      </ButtonRow>
      <Loading fallback={<Card>Fetching permissions…</Card>}>
        <p role="status">
          {isPending(() => permissions.size)
            ? "Loading permissions…"
            : `${role()} permissions ready`}
        </p>
        <Card>
          <For each={["Read", "Write", "Publish"]}>
            {name => <BoolRow label={name} value={permissions.has(name)} />}
          </For>
        </Card>
        <StatRow label="Permissions" value={permissions.size} />
      </Loading>
    </Container>
  );
}
