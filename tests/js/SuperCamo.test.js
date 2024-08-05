

const {SuperCamo} = require("../../dist/index.js");

const {describe, test, expect, beforeAll} = require("@jest/globals");

describe("SuperCamo initialization", () => {
	test("Begins with 0 database clients.", () => {
		expect(SuperCamo.clientList.length).toBe(0);
	})
});