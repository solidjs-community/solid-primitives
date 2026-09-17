import { action, createSignal, latest, Loading, refresh } from "solid-js";
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

export function OptimisticSet() {
  const server = new Set<string>();
  const favorites = createReactiveSet(
    async () => {
      await wait();
      return new Set(server);
    },
    { optimistic: true },
  );
  const [saving, setSaving] = createSignal(false);
  const [message, setMessage] = createSignal(
    "Choose whether the simulated server accepts the next toggle.",
  );
  const save = action(function* (accept: boolean) {
    const add = !favorites.has("Apple");
    if (add) favorites.add("Apple");
    else favorites.delete("Apple");
    yield wait(900);
    if (accept) {
      if (add) server.add("Apple");
      else server.delete("Apple");
    }
    yield refresh(favorites);
  });
  const submit = async (accept: boolean) => {
    setSaving(true);
    setMessage("Saving… the favorite changes immediately.");
    try {
      await save(accept);
      setMessage(accept ? "Accepted: favorite saved." : "Rejected: restored the server selection.");
    } catch (error) {
      setMessage(`Save failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Container>
      <Loading fallback={<Card>Fetching favorites…</Card>}>
        <Card>
          <BoolRow label="Apple is a favorite" value={favorites.has("Apple")} />
          <StatRow label="Favorites" value={favorites.size} />
        </Card>
        <ButtonRow>
          <Button disabled={latest(saving)} onClick={() => void submit(true)}>
            Accept toggle
          </Button>
          <Button disabled={latest(saving)} variant="outline" onClick={() => void submit(false)}>
            Reject toggle
          </Button>
        </ButtonRow>
      </Loading>
      {/* Pending UI reads the latest state while the action holds committed reads. */}
      <p role="status">{latest(message)}</p>
    </Container>
  );
}
