import { type Component, createSignal, onMount, For, Show } from "solid-js";
import { createDbStore, supabaseAdapter, type DbRow, type DbStoreError } from "../src/index.js";
import {
  type AuthResponse,
  createClient,
  type Session,
  SupabaseClient,
} from "@supabase/supabase-js";
import { reconcile } from "solid-js/store";

const TodoList = (props: { client: SupabaseClient; logout: () => void }) => {
  const [error, setError] = createSignal<DbStoreError<DbRow>>();
  (globalThis as any).supabaseClient = props.client;
  const [todos, setTodos] = createDbStore({
    adapter: supabaseAdapter({ client: props.client, table: "todos" }),
    defaultFields: ["id", "user_id"],
    onError: setError,
  });
  const [edit, setEdit] = createSignal<DbRow>();
  const done = (task: DbRow) => setTodos(reconcile(todos.filter(todo => todo !== task)));
  const add = (task: string) => setTodos(todos.length, { task });
  return (
    <div>
      <button onclick={props.logout}>logout</button>
      <Show when={error()} keyed>
        {err => (
          <p class="text-red-600">
            {`Error: ${err.message} Cause: ${err.cause} Action: ${err.action} Data: ${JSON.stringify(err.data)}`}{" "}
            ${err.server ? "server" : "client"} <button onClick={() => setError()}>ok</button>
          </p>
        )}
      </Show>
      <ul>
        <For
          each={Array.from(todos).toSorted((a, b) => Number(a.id) - Number(b.id))}
          fallback={<li>No to-dos yet</li>}
        >
          {item => (
            <li class="flex flex-row items-center" data-id={item.id}>
              <Show
                when={item === edit()}
                fallback={<span onClick={() => setEdit(item)}>{item.task}</span>}
              >
                <input name="update" value={item.task} />
                <button
                  onClick={() => {
                    const updated = (document.querySelector('[name="update"]') as HTMLInputElement)
                      .value;
                    const index = todos.indexOf(item);
                    if (updated && index > -1) setTodos(index, "task", updated);
                    setEdit(undefined);
                  }}
                >
                  update
                </button>
                <button onClick={() => setEdit(undefined)}>cancel</button>
              </Show>{" "}
              <span role="button" class="p-2" onClick={() => done(item)} title="Done">
                x
              </span>
            </li>
          )}
        </For>
        <li class="flex flex-row items-center">
          <label>
            new task: <input name="task" />
          </label>{" "}
          <button
            onClick={() => {
              const task = (document.querySelector('[name="task"]') as HTMLInputElement).value;
              if (task) {
                add(task);
                (document.querySelector('[name="task"]') as HTMLInputElement).value = "";
              }
            }}
          >
            do it!
          </button>
        </li>
      </ul>
    </div>
  );
};

const App: Component = () => {
  // these are public keys that will end up in the client in any case:
  const client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);
  const [session, setSession] = createSignal<Session>();
  const [error, setError] = createSignal("");
  const handleAuthPromise = ({ error, data }: AuthResponse) => {
    if (error) {
      setError(error.toString());
    } else {
      setSession(data.session ?? undefined);
    }
  };
  onMount(() => client.auth.refreshSession().then(handleAuthPromise));
  const login = () => {
    const email = (document.querySelector('[type="email"]') as HTMLInputElement | null)?.value;
    const password = (document.querySelector('[type="password"]') as HTMLInputElement | null)
      ?.value;
    if (!email || !password) {
      setError("please provide an email and password");
      return;
    }
    client.auth.signInWithPassword({ email, password }).then(handleAuthPromise);
  };
  const register = () => {
    const email = (document.querySelector('[type="email"]') as HTMLInputElement | null)?.value;
    const password = (document.querySelector('[type="password"]') as HTMLInputElement | null)
      ?.value;
    if (!email || !password) {
      setError("please provide an email and password");
      return;
    }
    client.auth.signUp({ email, password }).then(handleAuthPromise);
  };

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>db-store-backed to-do list</h4>
        <Show
          when={session()}
          fallback={
            <>
              <Show when={error()}>
                <p>{error()}</p>
              </Show>
              <p>
                <label>
                  Email <input type="email" onInput={() => setError("")} />
                </label>
              </p>
              <p>
                <label>
                  Password <input type="password" />
                </label>
              </p>
              <button class="btn" onClick={login}>
                sign in
              </button>
              <button class="btn" onClick={register}>
                sign up
              </button>
            </>
          }
        >
          <TodoList
            client={client}
            logout={() => {
              setSession(undefined);
              client.auth.signOut();
            }}
          />
        </Show>
      </div>
    </div>
  );
};

export default App;
