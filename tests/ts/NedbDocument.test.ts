

import {NedbDocument} from "../../src/index";

import {describe, test, expect, beforeAll} from "@jest/globals";

class User extends NedbDocument{
	username: object = {};

	constructor(newData: object, newParentDatabaseName: string, newCollectionName: string){
		super(newData, newParentDatabaseName, newCollectionName);

		this.username = {
			type: String,
			required: true,
			unique: true
		}
	}
}

describe("NedbDocument declaration", () => {
	test("Documents inherit from NedbDocument.", () => {
		expect(Object.getPrototypeOf(User).toString().includes("NedbDocument")).toBe(true);
	})
});