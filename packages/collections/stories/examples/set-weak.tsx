import { createSignal, For } from "solid-js";
import { createReactiveWeakSet } from "@solid-primitives/collections";
import {
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  Section,
} from "../../../../.storybook/ui/index.js";

export function WeakSetExample() {
  const [documents, setDocuments] = createSignal([{ name: "Proposal" }, { name: "Notes" }]);
  const reviewed = createReactiveWeakSet<object>();
  return (
    <Container>
      <p>
        Review status belongs to each document object. A replacement needs a new review, even with
        the same name.
      </p>
      <For each={documents()}>
        {document => (
          <Card>
            <BoolRow label={`${document.name} reviewed`} value={reviewed.has(document)} />
            <ButtonRow>
              <Button onClick={() => reviewed.add(document)}>Review {document.name}</Button>
              <Button variant="outline" onClick={() => reviewed.delete(document)}>
                Unreview {document.name}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setDocuments(list =>
                    list.map(item => (item === document ? { name: document.name } : item)),
                  )
                }
              >
                Replace {document.name}
              </Button>
            </ButtonRow>
          </Card>
        )}
      </For>
      <Section title="Weak membership">
        <p>
          The document list supplies the rows; WeakSet cannot be enumerated. Discarded document
          objects can be collected when nothing else retains them.
        </p>
      </Section>
    </Container>
  );
}
