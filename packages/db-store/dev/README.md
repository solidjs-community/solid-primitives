# Database setup

To create and set up the database for your own version of the todo list, use the following SQL statements in your supabase SQL editor:

```sql
create table todos (
  id serial primary key,
  task text,
  user_id uuid references auth.users default auth.uid()
);

alter publication supabase_realtime add table todos;

create policy "realtime updates only for authenticated users"
on "realtime"."messages"
for select
to authenticated
using (true);

alter table "public"."todos" enable row level security;

create policy "Select only own tasks" on "public"."todos"
for select
to authenticated
using (((SELECT auth.uid() AS uid) = user_id));

create policy "Insert only own tasks" on "public"."todos"
for insert
to authenticated
with check (((SELECT auth.uid() AS uid) = user_id));

create policy "Delete only own tasks" on "public"."todos"
for delete
to authenticated
using (((SELECT auth.uid() AS uid) = user_id));

create policy "Update only own tasks" on "public"."todos"
for update
to authenticated
using (((SELECT auth.uid() AS uid) = user_id))
with check (((SELECT auth.uid() AS uid) = user_id));
```
