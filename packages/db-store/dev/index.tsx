import { Component, createSignal, For, Show } from "solid-js";
import { createDbStore, supabaseAdapter, DbRow, DbStoreError } from "../src/index.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { reconcile } from "solid-js/store";

const TodoList = (props: { client: SupabaseClient }) => {
  const [error, setError] = createSignal<DbStoreError<DbRow>>();
  const [todos, setTodos] = createDbStore({
    adapter: supabaseAdapter({ client: props.client, table: "todos" }),
    onError: setError,
  });
  const [edit, setEdit] = createSignal<DbRow>();
  const done = (task: DbRow) => setTodos(reconcile(todos.filter(todo => todo !== task)));
  const add = (task: string) => setTodos(todos.length, { task });
  return (
    <>
    <Show when={error()} keyed>
      {(err) => <p class="text-red-600">{`Error: ${err.message} Cause: ${err.cause} Action: ${err.action} Data: ${JSON.stringify(err.data)}`} ${err.server ? 'server' : 'client'} <button onClick={() => setError()}>ok</button></p>}
    </Show>
    <ul>
      <For
        each={Array.from(todos).toSorted((a, b) => Number(a.id) - Number(b.id))}
        fallback={<li>No to-dos yet</li>}
      >
        {item => (
          <li class="flex flex-row items-center" data-id={item.id}>
            <Show when={item === edit()} fallback={<span onClick={() => setEdit(item)}>{item.task}</span>}>
              <input name="update" value={item.task} /><button onClick={() => {
                const updated = (document.querySelector('[name="update"]') as HTMLInputElement).value;
                const index = todos.indexOf(item);
                if (updated && index > -1) setTodos(index, 'task', updated);
                setEdit(undefined);
              }}>update</button><button onClick={() => setEdit(undefined)}>cancel</button>
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
    </>
  );
};

const App: Component = () => {
  const [client, setClient] = createSignal<SupabaseClient<any, "public", any>>();
  const connect = () => {
    const url = (document.querySelector('[type="url"]') as HTMLInputElement | null)?.value;
    const key = (document.querySelector('[type="password"]') as HTMLInputElement | null)?.value;
    url && key && setClient(createClient(url, key));
  };

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>db-store-backed to-do list</h4>
        <Show
          when={client()}
          keyed
          fallback={
            <>
              <details>
                <summary>To configure your own database,</summary>
                <ul class="list-disc">
                  <li>
                    Register with <a href="https://supabase.com">Supabase</a>.
                  </li>
                  <li>
                    Create a new database and note down the url and the key (that usually go into an
                    environment)
                  </li>
                  <li>Within the database, create a table and configure it to be public, promote changes in realtime and has no row protection:

                    <pre><code>{
`-- Create table
create table todos (
  id serial primary key,
  task text
);
-- Turn off row-level security
alter table "todos"
disable row level security;
-- Allow anonymous access
create policy "Allow anonymous access"
on todos
for select
to anon
using (true);`
          }</code></pre>
                  </li>
                  <li>Fill in the url and key in the fields below and press "connect".</li>
                </ul>
              </details>
              <p>
                <label>
                  DB
                  <select>
                    <option value="supabase">SupaBase</option>
                  </select>
                </label>
              </p>
              <p>
                <label>
                  Client URL <input type="url" />
                </label>
              </p>
              <p>
                <label>
                  Client Key <input type="password" />
                </label>
              </p>
              <button class="btn" onClick={connect}>
                Connect
              </button>
            </>
          }
        >
          {(client: SupabaseClient) => <TodoList client={client} />}
        </Show>
      </div>
    </div>
  );
};

export default App;
