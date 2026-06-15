import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createMutable, modifyMutable } from "@solid-primitives/mutable";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Badge,
  Card,
  Container,
  Section,
  Separator,
  StatRow,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Mutable",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const EditFields = meta.story({
  name: "createMutable — edit nested fields",
  parameters: {
    docs: {
      description: {
        story:
          "A mutable proxy tracks deep property reads as dependencies. Assigning to any property — even on a nested object — notifies only the computations that read that specific path.",
      },
    },
  },
  render: () => {
    const profile = createMutable({
      user: { firstName: "Alice", lastName: "Smith" },
      score: 0,
      active: true,
    });

    return (
      <Container>
        <Card>
          <StatRow label="firstName" value={profile.user.firstName} />
          <StatRow label="lastName" value={profile.user.lastName} />
          <StatRow label="score" value={profile.score} />
          <StatRow label="active" value={String(profile.active)} />
        </Card>
        <Section title="Mutations">
          <ButtonRow>
            <Button onClick={() => profile.score++}>+ score</Button>
            <Button variant="secondary" onClick={() => (profile.active = !profile.active)}>
              toggle active
            </Button>
          </ButtonRow>
          <ButtonRow>
            <Button
              variant="outline"
              onClick={() =>
                (profile.user.firstName = profile.user.firstName === "Alice" ? "Bob" : "Alice")
              }
            >
              swap firstName
            </Button>
            <Button variant="outline" onClick={() => (profile.user.lastName = "Jones")}>
              rename lastName
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const ArrayMutations = meta.story({
  name: "createMutable — array push & splice",
  parameters: {
    docs: {
      description: {
        story:
          "Native array methods (`push`, `splice`, direct index assignment) all go through the proxy and trigger reactive updates. `Array.isArray` and the spread operator work as expected.",
      },
    },
  },
  render: () => {
    const words = ["signal", "effect", "memo", "owner", "context", "resource", "store"];
    let wordIdx = 0;

    const tags = createMutable(["solid", "reactive", "proxy"]);

    return (
      <Container>
        <Card>
          <StatRow label="length" value={tags.length} />
          <div
            style={{
              display: "flex",
              "flex-wrap": "wrap",
              gap: "0.4rem",
              "min-height": "2rem",
            }}
          >
            <For each={tags} fallback={<span style={{ color: "#94a3b8", "font-size": "0.82rem" }}>empty</span>}>
              {tag => <Badge>{tag}</Badge>}
            </For>
          </div>
        </Card>
        <Section title="Mutations">
          <ButtonRow>
            <Button onClick={() => tags.push(words[wordIdx++ % words.length]!)}>push</Button>
            <Button
              variant="secondary"
              onClick={() => tags.length > 0 && tags.splice(tags.length - 1, 1)}
            >
              pop
            </Button>
            <Button variant="outline" onClick={() => tags.splice(0, tags.length)}>
              clear
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const GetterSetter = meta.story({
  name: "createMutable — getter / setter",
  parameters: {
    docs: {
      description: {
        story:
          "Getters defined on the initial object are re-bound to the proxy so `this` refers to the reactive proxy. Writing through a setter splits back to individual tracked properties.",
      },
    },
  },
  render: () => {
    const user = createMutable({
      firstName: "John",
      lastName: "Smith",
      get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
      },
      set fullName(value: string) {
        const [first = "", ...rest] = value.split(" ");
        this.firstName = first;
        this.lastName = rest.join(" ");
      },
    });

    const [draft, setDraft] = createSignal(user.fullName);

    return (
      <Container>
        <Card>
          <StatRow label="firstName" value={user.firstName} />
          <StatRow label="lastName" value={user.lastName} />
          <Separator />
          <StatRow label="fullName (get)" value={user.fullName} />
        </Card>
        <Section title="Write via setter">
          <TextField
            value={draft()}
            onChange={setDraft}
            placeholder="First Last"
          />
          <Button onClick={() => (user.fullName = draft())}>Apply</Button>
        </Section>
      </Container>
    );
  },
});

export const ModifyBatch = meta.story({
  name: "modifyMutable — grouped update",
  parameters: {
    docs: {
      description: {
        story:
          "`modifyMutable` passes the mutable proxy to a modifier function so multiple fields can be updated in one named call. Because all signal writes in Solid are auto-batched, dependent computations update once after the modifier returns.",
      },
    },
  },
  render: () => {
    type Address = { street: string; city: string; zip: string };
    const addresses: Address[] = [
      { street: "742 Evergreen Terrace", city: "Springfield", zip: "62701" },
      { street: "1600 Pennsylvania Ave", city: "Washington", zip: "20500" },
      { street: "221B Baker Street", city: "London", zip: "NW1 6XE" },
    ];
    let addrIdx = 1;

    const addr = createMutable<Address>({ ...addresses[0]! });
    const [updateCount, setUpdateCount] = createSignal(0);

    const apply = (next: Address) => {
      modifyMutable(addr, s => {
        s.street = next.street;
        s.city = next.city;
        s.zip = next.zip;
      });
      setUpdateCount(c => c + 1);
    };

    return (
      <Container>
        <Card>
          <StatRow label="street" value={addr.street} />
          <StatRow label="city" value={addr.city} />
          <StatRow label="zip" value={addr.zip} />
          <Separator />
          <StatRow label="updates applied" value={updateCount()} />
        </Card>
        <Section title="Apply preset">
          <ButtonRow>
            <Button onClick={() => apply(addresses[addrIdx++ % addresses.length]!)}>
              Next address
            </Button>
            <Button variant="secondary" onClick={() => apply(addresses[0]!)}>
              Reset
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
