import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFloating, makeAutoUpdate, type Placement } from "../src/index.js";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  ButtonRow,
  Container,
  StatRow,
  popoverStyle,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "UI Patterns/Floating",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

const PLACEMENTS: Placement[] = ["top", "right", "bottom", "left"];

export const Popover = meta.story({
  name: "Popover with flip and shift",
  parameters: {
    docs: {
      description: {
        story:
          "The popover starts on the chosen side, flips when it would leave the viewport and shifts to stay inside it. Resize the window or scroll to watch it follow the button.",
      },
    },
  },
  render: () => {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const [placement, setPlacement] = createSignal<Placement>("bottom");
    const f = createFloating({
      reference,
      floating,
      placement,
      offset: 8,
      flip: true,
      shift: { padding: 8 },
      whileElementsMounted: makeAutoUpdate,
    });

    return (
      <Container width={320}>
        <StatRow label="placement" value={f.placement()} />
        <BoolRow label="flipped" value={f.middlewareData()?.flipped ?? false} />
        <BoolRow label="shifted" value={f.middlewareData()?.shifted ?? false} />
        <ButtonRow>
          {PLACEMENTS.map(p => (
            <Button
              onClick={() => setPlacement(p)}
              variant={placement() === p ? "primary" : "secondary"}
            >
              {p}
            </Button>
          ))}
        </ButtonRow>
        <div style={{ padding: "4rem 0", display: "flex", "justify-content": "center" }}>
          <button ref={setReference}>Anchor</button>
        </div>
        <div ref={setFloating} style={{ ...f.styles(), ...popoverStyle, width: "max-content" }}>
          Floating content
        </div>
      </Container>
    );
  },
});
