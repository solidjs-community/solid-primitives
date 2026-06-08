import preview from "../../../.storybook/preview.js";
import { createControlledProp, createControlledProps } from "@solid-primitives/controlled-props";
import readme from "../README.md?raw";
import { Badge, Code, Container, Card, Section, Separator, StatRow, ProgressBar } from "../../../.storybook/ui/index.js";
import { colors, font, radii } from "../../../.storybook/ui/tokens.js";

const meta = preview.meta({
  title: "Utilities/Controlled Props",
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

/* ── 1. Bool · number · string ───────────────────────────────────────────────── */

export const ScalarControls = meta.story({
  name: "Bool · number · string",
  parameters: {
    docs: {
      description: {
        story:
          "`createControlledProp` infers the control type from the initial value: a `boolean` renders a checkbox, a `number` renders a number input, and a `string` renders a text input. Each returns a reactive `[value, setValue, field]` triple — `field({})` renders the HTML control and keeps the signal in sync.",
      },
    },
  },
  render: () => {
    const [enabled, , EnabledField] = createControlledProp("enabled", false);
    const [count, , CountField] = createControlledProp("count", { initialValue: 3, min: 0, max: 10 });
    const [label, , LabelField] = createControlledProp("label", "Submit");

    const row = {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      gap: "1rem",
      padding: "0.4rem 0.6rem",
      background: colors.surface,
      "border-radius": radii.md,
      border: `1px solid ${colors.border}`,
      "font-size": font.sizeBase,
      "font-family": font.system,
    } as const;

    return (
      <Container width={340}>
        <div style={row}>
          {EnabledField({})}
          <Code>{String(enabled())}</Code>
        </div>
        <div style={row}>
          {CountField({})}
          <Code>{String(count())}</Code>
        </div>
        <div style={row}>
          {LabelField({})}
          <Code>"{label()}"</Code>
        </div>
      </Container>
    );
  },
});

/* ── 2. Array & enum select ──────────────────────────────────────────────────── */

export const SelectControls = meta.story({
  name: "Array & enum select",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `options` to get a `<select>` control. Arrays of values map directly to options; TypeScript enums are detected automatically — numeric reverse-mappings are filtered so only the named keys appear.",
      },
    },
  },
  render: () => {
    enum Direction {
      North,
      East,
      South,
      West,
    }

    const languages = ["en", "de", "fr", "it", "jp"] as const;

    const [lang, , LangField] = createControlledProp("language", {
      initialValue: "en" as (typeof languages)[number],
      options: languages,
    });

    const [dir, , DirField] = createControlledProp("direction", {
      initialValue: Direction.East,
      options: Direction,
    });

    const row = {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      gap: "1rem",
      padding: "0.4rem 0.6rem",
      background: colors.surface,
      "border-radius": radii.md,
      border: `1px solid ${colors.border}`,
      "font-size": font.sizeBase,
      "font-family": font.system,
    } as const;

    return (
      <Container width={360}>
        <div style={row}>
          {LangField({})}
          <Code>{lang()}</Code>
        </div>
        <div style={row}>
          {DirField({})}
          <Code>{Direction[dir()]}</Code>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            "flex-wrap": "wrap",
            "padding-top": "0.25rem",
          }}
        >
          <Badge variant="info">options: array</Badge>
          <Badge variant="info">options: enum</Badge>
        </div>
      </Container>
    );
  },
});

/* ── 3. Range slider with step ──────────────────────────────────────────────── */

export const RangeControls = meta.story({
  name: "Range slider with step",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `type: \"range\"` to render a slider. The optional `step` option snaps values to discrete increments. `RangeProp` also exports the underlying component directly so you can assemble custom layouts.",
      },
    },
  },
  render: () => {
    const [opacity, , OpacityField] = createControlledProp("opacity", {
      initialValue: 60,
      min: 0,
      max: 100,
      type: "range",
    });

    const [volume, , VolumeField] = createControlledProp("volume", {
      initialValue: 40,
      min: 0,
      max: 100,
      step: 10,
      type: "range",
    });

    const row = {
      display: "flex",
      "flex-direction": "column",
      gap: "0.3rem",
      padding: "0.5rem 0.6rem",
      background: colors.surface,
      "border-radius": radii.md,
      border: `1px solid ${colors.border}`,
      "font-size": font.sizeBase,
      "font-family": font.system,
    } as const;

    return (
      <Container width={320}>
        <div style={row}>
          {OpacityField({})}
          <ProgressBar value={opacity()} min={0} max={100} label={`opacity: ${opacity()}%`} />
        </div>
        <div style={row}>
          {VolumeField({})}
          <ProgressBar
            value={volume()}
            min={0}
            max={100}
            label={`volume: ${volume()} (step 10)`}
            color={colors.primary}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            "flex-wrap": "wrap",
            "padding-top": "0.25rem",
          }}
        >
          <Badge variant="info">type: "range"</Badge>
          <Badge variant="info">step: 10</Badge>
        </div>
      </Container>
    );
  },
});

/* ── 4. Live component preview ───────────────────────────────────────────────── */

export const ComponentPropPanel = meta.story({
  name: "Live component preview",
  parameters: {
    docs: {
      description: {
        story:
          "`createControlledProps` builds the full set of controls in a single call, returning a `[props, fields]` pair. The `props` object exposes reactive accessor/setter pairs per prop name; `fields` is an array of rendered HTML controls ready to drop into any demo layout.",
      },
    },
  },
  render: () => {
    const VARIANTS = ["primary", "secondary", "outline"] as const;
    const SIZES = ["sm", "md", "lg"] as const;
    type Variant = (typeof VARIANTS)[number];
    type Size = (typeof SIZES)[number];

    const [props, fields] = createControlledProps({
      label: "Save changes",
      variant: { initialValue: "primary" as Variant, options: VARIANTS },
      size: { initialValue: "md" as Size, options: SIZES },
      disabled: false,
    });

    const variantStyle = (): Record<string, string> => {
      const v = props.variant() as Variant;
      if (v === "primary") return { background: colors.primary, color: colors.primaryFg, border: "none" };
      if (v === "secondary") return { background: colors.secondary, color: colors.secondaryFg, border: "none" };
      return { background: "transparent", color: colors.secondaryFg, border: `1px solid ${colors.border}` };
    };

    const sizeStyle = (): Record<string, string> => {
      const s = props.size() as Size;
      if (s === "sm") return { padding: "0.25rem 0.65rem", "font-size": font.sizeSm };
      if (s === "lg") return { padding: "0.65rem 1.5rem", "font-size": font.sizeMd };
      return { padding: "0.45rem 1.1rem", "font-size": font.sizeBase };
    };

    return (
      <Container width={360}>
        <Card>
          <div
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "min-height": "64px",
            }}
          >
            <button
              disabled={props.disabled()}
              style={{
                ...variantStyle(),
                ...sizeStyle(),
                "border-radius": radii.md,
                "font-family": font.system,
                "font-weight": "500",
                cursor: props.disabled() ? "not-allowed" : "pointer",
                opacity: props.disabled() ? "0.5" : "1",
                transition: "opacity 0.15s",
              }}
            >
              {props.label()}
            </button>
          </div>
        </Card>
        <Separator />
        <Section title="Controls">
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "0.4rem",
              "font-size": font.sizeBase,
              "font-family": font.system,
            }}
          >
            {fields}
          </div>
        </Section>
        <StatRow label="variant" value={props.variant() as string} />
        <StatRow label="size" value={props.size() as string} />
        <StatRow label="disabled" value={String(props.disabled())} />
      </Container>
    );
  },
});
