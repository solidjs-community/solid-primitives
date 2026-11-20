import { action, createSignal, latest, Loading, refresh } from "solid-js";
import { createReactiveMap } from "@solid-primitives/collections";
import { Button, ButtonRow, Card, Container, StatRow } from "../../../../.storybook/ui/index.js";
import { wait } from "./shared.ts";

export function OptimisticMap() {
  // This ordinary object stands in for server state; refresh() asks for it again.
  const server = new Map([["Alice", 0]]);
  const scores = createReactiveMap(
    async () => {
      await wait();
      return new Map(server);
    },
    { optimistic: true },
  );
  const [saving, setSaving] = createSignal(false);
  const [message, setMessage] = createSignal(
    "Choose whether the simulated server accepts the next point.",
  );
  const save = action(function* (accept: boolean) {
    const next = (scores.get("Alice") ?? 0) + 1;
    scores.set("Alice", next);
    yield wait(900);
    if (accept) server.set("Alice", next);
    // Keep the optimistic write visible while the authoritative result is fetched.
    yield refresh(scores);
  });
  const submit = async (accept: boolean) => {
    setSaving(true);
    setMessage("Saving… the point is visible immediately.");
    try {
      await save(accept);
      setMessage(accept ? "Accepted: point saved." : "Rejected: restored the server score.");
    } catch (error) {
      setMessage(`Save failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Container>
      <Loading fallback={<Card>Fetching score…</Card>}>
        <Card>
          <StatRow label="Alice" value={scores.get("Alice") ?? 0} />
        </Card>
        <ButtonRow>
          <Button disabled={latest(saving)} onClick={() => void submit(true)}>
            Accept +1
          </Button>
          <Button disabled={latest(saving)} variant="outline" onClick={() => void submit(false)}>
            Reject +1
          </Button>
        </ButtonRow>
      </Loading>
      {/* Pending UI reads the latest state while the action holds committed reads. */}
      <p role="status">{latest(message)}</p>
    </Container>
  );
}
