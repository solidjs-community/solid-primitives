import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test"!</div>
}
