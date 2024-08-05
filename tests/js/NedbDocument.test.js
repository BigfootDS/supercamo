

const {NedbDocument} = require("../../dist/index.js");

const {describe, test, expect, beforeAll} = require("@jest/globals");

class User extends NedbDocument{
	constructor(newData, newParentDatabaseName, newCollectionName){
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