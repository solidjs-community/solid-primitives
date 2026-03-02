import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "60vh",
        gap: "1.5rem",
        "text-align": "center",
        padding: "2rem",
      }}
    >
      <Title>404 — Not Found</Title>
      <HttpStatusCode code={404} />
      <h1 style={{ "font-size": "4rem", "font-weight": "700", "line-height": "1" }}>404</h1>
      <p style={{ "font-size": "1.25rem", color: "var(--sb-decoration-color)" }}>
        Page not found.
      </p>
      <A
        href="/"
        style={{
          color: "var(--sb-active-link-color)",
          "text-decoration": "none",
          "font-weight": "500",
        }}
      >
        ← Back to Home
      </A>
    </main>
  );
}
