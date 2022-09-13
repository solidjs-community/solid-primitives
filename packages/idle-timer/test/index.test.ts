import { makeIdleTimer } from "../src";
import { createRoot, createSignal, ErrorBoundary, onMount } from "solid-js";
import { render } from "solid-js/web";
import { describe, test, expect, JSDOMOptions } from "vitest";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('makeIdleTimer', () => {
  test(
    'signals when the user is prompted and idle according to the configuration timeouts',
    async () => await createRoot(async dispose => {
      const { isIdle, isPrompted, stop } = makeIdleTimer({
        idleTimeout: 5,
        promptTimeout: 5,
      })

      await new Promise(resolve => onMount(() => {
        resolve(true)
      }))

      await sleep(2)
      expect(isPrompted(), 'user is not prompted yet').toBe(false)
      expect(isIdle(), 'user is not idle yet').toBe(false)

      await sleep(5)
      expect(isPrompted(), 'user has been prompted').toBe(true)
      expect(isIdle(), 'user is not idle yet').toBe(false)

      await sleep(5)
      expect(isPrompted(), 'user is not in the prompted phase anymore').toBe(false)
      expect(isIdle(), 'user is idle').toBe(true)

      stop()
      dispose()
    })
  )

  test(
    'start and stop should successfully bind, unbind the event listeners, reset should clean and restart the timers',
    async () => await createRoot(async dispose => {
      const { isIdle, reset,start, stop } = makeIdleTimer({
        idleTimeout: 5,
        startManually: true,
      })

      await new Promise(resolve => onMount(() => {
        resolve(true)
      }))

      await sleep(0)
      expect(isIdle(), 'user is not idle yet, events are not bound yet').toBe(false)

      start()

      await sleep(10)
      expect(isIdle(), 'user is idle').toBe(true)

      reset()

      await sleep(4)
      expect(isIdle(), 'user is not idle yet, timers have restarted').toBe(false)
      await sleep(10)
      expect(isIdle(), 'user is idle').toBe(true)


      stop()
      await sleep(1)
      expect(isIdle(), 'user is not idle anymore, timers have been cleaned up').toBe(false)
      await sleep(10)
      expect(isIdle(), 'user is idle, event listeners are unbound, timers have not restarted').toBe(false)

      dispose()
    })
  )

  test(
    'configuration options shall work',
    async () => await createRoot(async dispose => {
      let currStatus =  'initial'

      const { start, stop } = makeIdleTimer({
        promptTimeout: 15,
        idleTimeout: 15,
        startManually: true,
        onActive: () => currStatus = 'active',
        onIdle: () => currStatus = 'idle',
        onPrompt: () => currStatus = 'prompted',
      })

      await new Promise(resolve => onMount(() => {
        resolve(true)
      }))

      await sleep(10)
      expect(currStatus, 'events are not bound yet, the status has not cahnged').toBe('initial')

      start()

      await sleep(20)
      expect(currStatus, 'timers started, user should be in the prompt phase, onPrompt should have been called by now').toBe('prompted')

      await sleep(20)
      expect(currStatus, 'prompt timer has expired, onIdle should have been called by now').toBe('idle')

      stop()

      dispose()
    })
  )
})