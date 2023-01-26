import { children, createRoot, createSignal, Show } from "solid-js";
import { describe, expect, it } from "vitest";
import { createJSXParser } from "../src";

describe("jsx-parser", () => {
  const parser1 = createJSXParser<{
    type: "my-token";
    props: { text: string };
  }>();

  const MyToken1 = parser1.createToken((props: { text: string }) => ({
    type: "my-token",
    props
  }));

  it("should work", () => {
    createRoot(() => {
      const tokens = parser1.childrenTokens(() => (
        <>
          <MyToken1 text="foo" />
          <MyToken1 text="bar" />
        </>
      ));

      expect(tokens()).toHaveLength(2);
      tokens().forEach(token => expect(token.type).toBe("my-token"));
      expect(tokens()[0].props.text).toBe("foo");
      expect(tokens()[1].props.text).toBe("bar");

      // shouldn't throw
      <>{tokens()}</>;
    });
  });

  it("handled reactive children", () => {
    createRoot(() => {
      const [show, setShow] = createSignal(true);

      const tokens = parser1.childrenTokens(() => (
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
      const parser2 = createJSXParser();

      const MyToken2 = parser2.createToken(
        () => ({}),
        (props: { text: string }) => <div>{props.text}</div>
      );

      const rendered1 = children(() => <MyToken2 text="foo" />);
      const rendered2 = children(() => <MyToken2 text="bar" />);

      expect((rendered1() as HTMLElement).outerHTML).toBe("<div>foo</div>");
      expect((rendered2() as HTMLElement).outerHTML).toBe("<div>bar</div>");
    });
  });
});
