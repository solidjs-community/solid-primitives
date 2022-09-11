import { makeIdleTimer } from "../src";
import { createRoot, onMount } from "solid-js";
import { describe, test, expect } from "vitest";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('makeIdleTimer', () => {
    test(
        'signals when the user is prompted and idle according to the configuration timeouts',
        async () => await createRoot(async dispose => {
            const { isIdle, isPrompted, stop } = makeIdleTimer({
                idleTimeout: 5,
                promptTimeout: 5,
            })

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
})