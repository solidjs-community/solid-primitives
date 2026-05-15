import { createListState, createMultiSelectListState } from "../src/index.js";

const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

export function SingleSelectDemo() {
  const { active, onKeyDown } = createListState({
    items: items,
    initialActive: items[0],
  });

  return (
    <div>
      <h2>Single-Select List</h2>
      <p>Active: {active()}</p>
      <ul
        role="listbox"
        onKeyDown={onKeyDown}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          "list-style": "none",
        }}
      >
        {items.map((item) => (
          <li
            class={{
              active: active() === item,
            }}
            style={{
              padding: "0.5rem",
              background: active() === item ? "#0066cc" : "transparent",
              color: active() === item ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MultiSelectDemo() {
  const { cursor, active, selected, setCursorActive, toggleSelected, onKeyDown } =
    createMultiSelectListState({
      items: items,
      initialCursor: items[0],
    });

  return (
    <div>
      <h2>Multi-Select List</h2>
      <p>Cursor: {cursor()}</p>
      <p>Selected: {selected().join(", ") || "None"}</p>
      <ul
        role="listbox"
        onKeyDown={onKeyDown}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          "list-style": "none",
        }}
      >
        {items.map((item) => (
          <li
            class={{
              cursor: cursor() === item,
              selected: selected().includes(item),
            }}
            onClick={() => setCursorActive(item)}
            onDoubleClick={() => toggleSelected(item)}
            style={{
              padding: "0.5rem",
              background: cursor() === item ? "#0066cc" : selected().includes(item) ? "#cce5ff" : "transparent",
              color: cursor() === item ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
      <p style={{ "font-size": "0.85em", color: "#666" }}>
        Double-click to toggle selection
      </p>
    </div>
  );
}
