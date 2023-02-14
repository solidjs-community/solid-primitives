import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createForm } from "../src";

const App: Component = () => {
  const { updateForm, formData } = createForm({ name: "", food: "", email: "" });

  const onSubmit = (e: any) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form
      class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white"
      onSubmit={onSubmit}
    >
      <label>Name</label>
      <input
        name="name"
        required
        value={formData.name}
        onInput={e => updateForm("name", e.currentTarget.value)}
      />
      <label>Favorite Food</label>
      <select
        required
        name="food"
        value={formData.food}
        onInput={e => updateForm("food", e.currentTarget.value)}
      >
        <option value="" />
        <option value="apple">Apple</option>
        <option value="pear">Pear</option>
        <option value="banana">banana</option>
      </select>
      <label>Email</label>
      <input
        name="email"
        type="email"
        required
        value={formData.email}
        onInput={e => updateForm("email", e.currentTarget.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

render(() => <App />, document.getElementById("root")!);
