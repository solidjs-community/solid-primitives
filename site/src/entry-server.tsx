// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => <StartServer document={(props) => props.children}/>, { mode: "async" });
