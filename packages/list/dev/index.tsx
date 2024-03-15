import {
  type Component,
  createSignal,
  createEffect,
  onCleanup,
  untrack,
  onMount,
  batch,
} from "solid-js";
import { List } from "../src/index.js";

const App: Component = () => {
  let currentValue = 0;
  const nextValue = () => `${currentValue++}`;

  const [signal, setSignal] = createSignal<(string | number)[]>(
    Array.from({ length: 5 }).map(() => nextValue()),
  );
  const [changes, setChanges] = createSignal("");
  const addChange = (description: string) => {
    setChanges(old => old + "\n" + description);
    console.log(description);
  };

  createEffect(() => {
    batch(() => {
      setChanges("");
      addChange("-------------------");
    });
    signal();
  });

  let customArr: HTMLInputElement;

  return (
    <div
      style={{
        margin: "2em",
      }}
    >
      <div style={{ display: "flex", "flex-direction": "column", "align-items": "center" }}>
        <List
          each={signal()}
          fallback={
            <h1
              style={{
                "font-weight": "bold",
                "font-size": "x-large",
                color: "green",
              }}
            >
              THE LIST IS EMPTY
            </h1>
          }
        >
          {(v, i) => {
            onMount(() => addChange(`create ${i()}: ${v()}`));
            createEffect(lastValue => {
              const value = v();
              if (lastValue != null) {
                addChange(`${untrack(i)}: (${lastValue} -> ${value})`);
              }
              return v();
            }, null);
            createEffect((lastIndex: number | null) => {
              const index = i();
              if (lastIndex !== null) {
                addChange(`(${lastIndex} -> ${index}): ${untrack(v)}`);
              }
              return i();
            }, null);
            onCleanup(() => setTimeout(() => addChange(`remove ${i()}: ${v()}`)));
            return (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  "font-weight": "bold",
                  color: "magenta",
                }}
              >
                <button
                  style={{ "margin-right": "2em" }}
                  onClick={() => {
                    setSignal(x => {
                      const n = [...x];
                      n.splice(i(), 0, nextValue());
                      return n;
                    });
                  }}
                >
                  Insert before
                </button>
                <span style={{ "min-width": "2em" }}>{i()}</span>
                <input
                  value={v()}
                  onInput={e => {
                    setSignal(x => {
                      const n = [...x];
                      n[i()] = e.target.value;
                      return n;
                    });
                  }}
                />
                <button
                  onClick={() => {
                    setSignal(x => x.filter((y, j) => j != i()));
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSignal(x => {
                      const n = [...x];
                      n[i()] = nextValue();
                      return n;
                    });
                  }}
                >
                  Replace
                </button>
                <button
                  style={{ "margin-left": "2em" }}
                  onClick={() => {
                    setSignal(x => {
                      const n = [...x];
                      n.splice(i() + 1, 0, nextValue());
                      return n;
                    });
                  }}
                >
                  Insert after
                </button>
              </div>
            );
          }}
        </List>

        <div style={{ display: "flex", margin: "1em" }}>
          <button
            onClick={() => {
              const x = signal();
              for (let i = x.length - 1; i >= 0; --i) {
                let j = ~~(Math.random() * i);
                const v = x[j]!;
                x[j] = x[i]!;
                x[i] = v;
              }
              setSignal([...x]);
            }}
          >
            Shuffle
          </button>
          <button
            onClick={() => {
              setSignal(x => {
                const el = x.pop();
                el !== undefined && x.unshift(el);
                return [...x];
              });
            }}
          >
            Roll
          </button>
          <button
            onClick={() => {
              setSignal(x => x.map(() => nextValue()));
            }}
          >
            Replace all
          </button>
          <button
            onClick={() => {
              setSignal(x => {
                const n = [...x];
                n.splice(~~(Math.random() * x.length), 0, nextValue());
                return n;
              });
            }}
          >
            Insert randomly
          </button>
          <button
            onClick={() => {
              setSignal(x => [...x]);
            }}
          >
            Copy signal without changes
          </button>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <input
          style={{ "flex-grow": 1 }}
          ref={x => (customArr = x)}
          value={JSON.stringify(signal())}
        />
        <button
          onClick={() => {
            try {
              const result = JSON.parse(customArr.value);
              if (
                Array.isArray(result) &&
                result.every(x => typeof x === "number" || typeof x === "string")
              )
                setSignal(result);
              else setChanges("Wrong input value");
            } catch {
              setChanges("Wrong input value");
            }
          }}
        >
          Set custom value
        </button>
      </div>
      <pre
        style={{
          "font-weight": "bold",
          color: "orange",
        }}
      >
        {changes()}
      </pre>
    </div>
  );
};

export default App;
