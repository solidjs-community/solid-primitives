import { makeRetrying } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import { createMemo, isPending, Errored } from "solid-js";
import { Alert, Badge, Button, Container, Section } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const Retrying = meta.story({
  name: "Retrying a flaky request",
  parameters: {
    docs: {
      description: {
        story:
          "`makeRetrying` wraps a fetcher and retries it after a delay when it rejects. Both services below reject twice before succeeding — only the retrying one recovers.",
      },
    },
  },
  render: () => {
    class FlakyService {
      #calls = 0;
      get(): Promise<string> {
        return this.#calls++ < 2
          ? Promise.reject(new Error("rejected"))
          : Promise.resolve("it works!");
      }
    }
    const retryingService = new FlakyService();
    const plainService = new FlakyService();
    const retrying = createMemo(makeRetrying(() => retryingService.get(), { delay: 400 }));
    const plain = createMemo(() => plainService.get());

    const errorFallback = (err: () => unknown, reset: () => void) => (
      <Alert variant="error">
        Failed: {err() instanceof Error ? (err() as Error).message : "unknown error"}{" "}
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </Alert>
    );

    return (
      <Container width={320}>
        <Section title="With makeRetrying">
          <Errored fallback={errorFallback}>
            {isPending(retrying) ? (
              <Badge variant="warning">retrying…</Badge>
            ) : (
              <Badge variant="success">{retrying()}</Badge>
            )}
          </Errored>
        </Section>
        <Section title="Without retrying">
          <Errored fallback={errorFallback}>
            {isPending(plain) ? (
              <Badge variant="default">loading…</Badge>
            ) : (
              <Badge variant="success">{plain()}</Badge>
            )}
          </Errored>
        </Section>
      </Container>
    );
  },
});
