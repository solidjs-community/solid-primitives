import { makeIdleTimer } from "../src";
import { createRoot } from "solid-js";
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
})