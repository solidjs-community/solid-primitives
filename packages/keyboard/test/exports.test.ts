import { describe, it, expect } from "vitest"
import * as API from "../src/index"
import * as noopAPI from "../src/server"

describe("server have to exports match client exports", () => {
	it("matches exports", () => {
		;(Object.keys(API) as (keyof typeof API)[]).forEach(name => {
			expect(typeof noopAPI[name]).toBe(typeof API[name])
		})
	})
})
