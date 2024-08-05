

import {SuperCamo} from "../../src/index";

import {describe, test, expect} from "@jest/globals";

describe("SuperCamo initialization", () => {
	test("Begins with 0 database clients.", () => {
		expect(SuperCamo.clientList.length).toBe(0);
	})
});