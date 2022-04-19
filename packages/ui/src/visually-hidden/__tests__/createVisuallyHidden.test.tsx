import { fireEvent, render, screen } from "solid-testing-library";

import { createVisuallyHidden } from "..";

function Example(props: any) {
  const { visuallyHiddenProps } = createVisuallyHidden(props);

  return (
    <div tabIndex={-1} {...visuallyHiddenProps} data-testid="example">
      {props.children}
    </div>
  );
}

describe("createVisuallyHidden", () => {
  it("should apply visually hidden styles", async () => {
    render(() => <Example />);

    const el = screen.getByTestId("example");

    expect(el).toHaveStyle({
      border: 0,
      clip: "rect(0 0 0 0)",
      "clip-path": "inset(50%)",
      height: 1,
      margin: "0 -1px -1px 0",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: 1,
      "white-space": "nowrap",
    });
  });

  it("should merge user defined style with visually hidden styles", async () => {
    const customStyle = { color: "red" };

    render(() => <Example style={customStyle} />);

    const el = screen.getByTestId("example");

    expect(el).toHaveStyle({
      border: 0,
      clip: "rect(0 0 0 0)",
      "clip-path": "inset(50%)",
      height: 1,
      margin: "0 -1px -1px 0",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: 1,
      "white-space": "nowrap",
      ...customStyle,
    });
  });

  it("should remove visually hidden styles if element has focus", async () => {
    render(() => <Example isFocusable />);

    const el = screen.getByTestId("example");

    fireEvent.focus(el);
    await Promise.resolve();

    expect(el).not.toHaveStyle({
      border: 0,
      clip: "rect(0 0 0 0)",
      "clip-path": "inset(50%)",
      height: 1,
      margin: "0 -1px -1px 0",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: 1,
      "white-space": "nowrap",
    });
  });
});
