import { Component } from "solid-js";
import { render } from "solid-js/web";
import { z } from "zod";
import { createForm } from "../src";

const registerSchema = z.object({
  password: z.string().min(8),
  emergencyContact: z.array(z.object({ firstName: z.string() })).min(2),
  favoriteNumber: z.number(),
  user: z.object({
    lastName: z.string(),
    email: z.object({
      random: z.array(
        z.object({
          keys: z.object({
            email: z.string().email()
          })
        })
      )
    })
  })
});

const App: Component = () => {
  const { handleSubmit } = createForm({
    schema: registerSchema,
    onError(errors) {
      console.log(errors);
    },
    onSubmit(data) {
      console.log(data);
    }
  });
  return (
    <form onSubmit={handleSubmit}>
      <label>1st Emergency Contact First Name</label>
      <input name="emergencyContact[0].firstName" required type="text" />
      <br />
      <label>2nd Emergency Contact First Name</label>
      <input name="emergencyContact[1].firstName" required type="text" />
      <br />
      <label>Your Favorite Number</label>
      <input name="favoriteNumber" required type="number" />
      <br />
      <label>Your Last Name</label>
      <input name="user.lastName" required type="text" />
      <br />
      <label>Crazy Set Path Email</label>
      <input name="user.email.random[0].keys.email" required type="email" />
      <br />
      <label>Password</label>
      <input name="password" required type="password" />
      <br />
      <button type="submit">Test</button>
    </form>
  );
};

render(() => <App />, document.getElementById("root")!);
