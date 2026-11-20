import { createSignal, For } from "solid-js";
import { createReactiveWeakMap } from "@solid-primitives/collections";
import {
  Button,
  ButtonRow,
  Card,
  Container,
  Section,
  StatRow,
} from "../../../../.storybook/ui/index.js";

export function WeakMapExample() {
  const [people, setPeople] = createSignal([{ name: "Alice" }, { name: "Bob" }]);
  const notes = createReactiveWeakMap<object, string>();
  return (
    <Container>
      <p>Notes belong to an object, not its name. Replacing a person creates a new key.</p>
      <For each={people()}>
        {person => (
          <Card>
            <StatRow label={person.name} value={notes.get(person) ?? "No note"} />
            <ButtonRow>
              <Button onClick={() => notes.set(person, "Ready to review")}>
                Annotate {person.name}
              </Button>
              <Button variant="outline" onClick={() => notes.delete(person)}>
                Forget {person.name}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setPeople(list =>
                    list.map(item => (item === person ? { name: person.name } : item)),
                  )
                }
              >
                Replace {person.name}
              </Button>
            </ButtonRow>
          </Card>
        )}
      </For>
      <Section title="Weak keys">
        <p>
          The separate people list supplies the rows. WeakMap has no size or iterator and does not
          keep discarded keys alive. Garbage collection timing is not observable here.
        </p>
      </Section>
    </Container>
  );
}
