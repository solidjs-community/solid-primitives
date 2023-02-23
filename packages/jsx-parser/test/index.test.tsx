import { children, createRoot, createSignal, Show } from "solid-js";
import { describe, expect, it } from "vitest";
import {
  createJSXParser,
  createToken,
  isToken,
  JSXParserData,
  resolveTokens,
  TokenElement
} from "../src";

describe("jsx-parser", () => {
  const parser1 = createJSXParser<{
    type: "my-token";
    props: { text: string };
  }>();

  const MyToken1 = createToken(parser1, (props: { text: string }) => ({
    type: "my-token",
    props
  }));

  it("should resolve tokens", () => {
    createRoot(() => {
      const tokens = resolveTokens(
        parser1,
        () => (
          <>
            <div />
            <MyToken1 text="foo" />
            <MyToken1 text="bar" />
          </>
        ),
        true
      );

      expect(tokens()).toHaveLength(3);

      expect(tokens()[0]).toBeInstanceOf(HTMLDivElement);
      expect(isToken(parser1, tokens()[0])).toBe(false);
      expect(
        (tokens()[1] as unknown as TokenElement<JSXParserData<typeof parser1>>).data.props.text
      ).toBe("foo");
      expect(isToken(parser1, tokens()[1])).toBe(true);
      expect(
        (tokens()[2] as unknown as TokenElement<JSXParserData<typeof parser1>>).data.props.text
      ).toBe("bar");
      expect(isToken(parser1, tokens()[2])).toBe(true);

      // shouldn't throw
      <>{tokens()}</>;
    });
  });

  it("should resolve data", () => {
    createRoot(() => {
      const tokens = resolveTokens(parser1, () => (
        <>
          <div />
          <MyToken1 text="foo" />
          <MyToken1 text="bar" />
        </>
      ));

      expect(tokens()).toHaveLength(2);
      tokens().forEach(data => expect(data.type).toBe("my-token"));
      expect(tokens()[0]!.props.text).toBe("foo");
      expect(tokens()[1]!.props.text).toBe("bar");
    });
  });

  it("handled reactive children", () => {
    createRoot(() => {
      const [show, setShow] = createSignal(true);

      const tokens = resolveTokens(parser1, () => (
        <>
          <Show when={show()}>
            <MyToken1 text="foo" />
          </Show>
          <MyToken1 text="bar" />
        </>
      ));

      expect(tokens()).toHaveLength(2);

      setShow(false);

      expect(tokens()).toHaveLength(1);
    });
  });

  it("should render tokens", () => {
    createRoot(() => {
      const parser = createJSXParser();

      const MyToken = createToken(
        parser,
        () => ({}),
        (props: { text: string }) => <div>{props.text}</div>
      );

      const rendered1 = children(() => <MyToken text="foo" />);
      const rendered2 = children(() => <MyToken text="bar" />);

      expect((rendered1() as HTMLElement).outerHTML).toBe("<div>foo</div>");
      expect((rendered2() as HTMLElement).outerHTML).toBe("<div>bar</div>");
    });
  });

  it("uses props as data if no data function is provided", () => {
    createRoot(() => {
      const parser = createJSXParser<{ text: string }>();
      const MyToken = createToken(parser);

      const tokens = resolveTokens(parser, () => (
        <>
          <MyToken text="foo" />
          <MyToken text="bar" />
        </>
      ));

      expect(tokens()).toHaveLength(2);
      expect(tokens()[0]!.text).toBe("foo");
      expect(tokens()[1]!.text).toBe("bar");
    });
  });

  it("data object can have getters", () => {
    createRoot(() => {
      let count = 0;
      const parser = createJSXParser<{ n: number }>();
      const MyToken = createToken(parser, () => ({
        get n() {
          return count++;
        }
      }));

      const tokens = resolveTokens(parser, () => <MyToken text="foo" />);

      expect(tokens()[0]!.n).toBe(0);
      expect(tokens()[0]!.n).toBe(1);
    });
  });
});
