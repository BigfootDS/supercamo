const {SuperCamo, CollectionListEntry} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbDocumentValidationsTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbDocumentValidationsTestDb",
		"./.testing/NedbDocumentValidationsTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

});

describe.skip("NedbDocument validation tests...", () => {

	test("documents inherit from NedbDocument.", () => {
		expect(Object.getPrototypeOf(User).toString().includes("NedbDocument")).toBe(true);
	})

	
	

});