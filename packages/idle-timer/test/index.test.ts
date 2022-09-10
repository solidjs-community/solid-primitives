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
            expect(isPrompted()).toBe(false)
            expect(isIdle()).toBe(false)

            await sleep(5)
            expect(isPrompted()).toBe(true)
            expect(isIdle()).toBe(false)

            await sleep(5)
            expect(isPrompted()).toBe(false)
            expect(isIdle()).toBe(true)

            stop()
            dispose()
        })
    )
})