import { createSignal, onSettled, Show, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import type { ProjectStats as Stats } from "../lib/project-stats";
import { getProjectStats } from "../lib/stats.server";

/**
 * Homepage stats block (npm downloads, open issues, open PRs).
 *
 * Renders `initial` (the build-time copy from src/generated/stats.ts) so the prerendered page and
 * hydration agree, then asks `/_server` for the live, day-cached copy and swaps it in. If that
 * request fails (no server behind the static site, GitHub down), the build-time numbers stay.
 */
export function ProjectStats(props: { initial: Stats | null }) {
  const [stats, setStats] = createSignal<Stats | null>(untrack(() => props.initial));

  onSettled(() => {
    if (isServer) return;
    let active = true;
    getProjectStats().then(
      fresh => {
        if (active) setStats(fresh);
      },
      () => {},
    );
    return () => {
      active = false;
    };
  });

  return (
    <Show when={stats()}>
      {s => (
        <div class="pl-stats">
          <a
            class="pl-stat"
            href="https://www.npmjs.com/org/solid-primitives"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="pl-stat-value">{s().npmDownloadsLastMonthFormatted}</div>
            <div class="pl-stat-label">npm downloads / month</div>
          </a>
          <a
            class="pl-stat"
            href="https://github.com/solidjs-community/solid-primitives/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="pl-stat-value">{s().openIssues}</div>
            <div class="pl-stat-label">open issues</div>
          </a>
          <a
            class="pl-stat"
            href="https://github.com/solidjs-community/solid-primitives/pulls"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="pl-stat-value">{s().openPullRequests}</div>
            <div class="pl-stat-label">open pull requests</div>
          </a>
          <div class="pl-stats-updated">Last updated {s().generatedAt}</div>
        </div>
      )}
    </Show>
  );
}
