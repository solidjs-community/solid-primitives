import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { createTokenizer, createToken, resolveTokens } from "../src/index.js";

describe("jsx-tokenizer", () => {
  const parser1 = createTokenizer<{
    type: "my-token";
    props: { text: string };
  }>();

  const MyToken1 = createToken(parser1, (props: { text: string }) => ({
    type: "my-token",
    props,
  }));

  it("should work", () => {
    const tokens = resolveTokens(parser1, () => (
      <>
        <MyToken1 text="foo" />
        <MyToken1 text="bar" />
      </>
    ));

    expect(tokens()).toHaveLength(2);
    tokens().forEach(token => expect(token.data.type).toBe("my-token"));
    expect(tokens()[0]!.data.props.text).toBe("foo");
    expect(tokens()[1]!.data.props.text).toBe("bar");

    // shouldn't throw
    <>{tokens()}</>;
  });

  it("should render tokens", () => {
    const parser2 = createTokenizer();

    const MyToken2 = createToken(
      parser2,
      () => ({}),
      (props: { text: string }) => <div>{props.text}</div>,
    );

    const rendered1 = renderToString(() => <MyToken2 text="foo" />);
    const rendered2 = renderToString(() => <MyToken2 text="bar" />);

    expect(rendered1).toBe("<div>foo</div>");
    expect(rendered2).toBe("<div>bar</div>");
  });
});
