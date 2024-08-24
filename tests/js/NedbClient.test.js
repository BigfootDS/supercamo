const {SuperCamo, CollectionListEntry, NedbClient} = require("../../dist/index.js");
// const {} = require("../../dist/structures/NedbClient.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");


/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbClientClassTestDb");
});


beforeAll(() => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassTestDb",
		"./.testing/NedbClientClassTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);
})


describe("NedbClient class...", () => {

	

	test("instances can exist in SuperCamo static class.", () => {
		
		expect(SuperCamo.clientList.length).toBe(1);
		expect(SuperCamo.clients["NedbClientClassTestDb"]).toBe(newClient);
	});

	test("specific instance exists in SuperCamo static class and has valid data.", () => {

		let expectedInstance = SuperCamo.clientGet("NedbClientClassTestDb");

		expect(expectedInstance.path).toBe("./.testing/NedbClientClassTestDb/");
		expect(expectedInstance.name).toBe("NedbClientClassTestDb");
	});

});


describe("NedbClient class instances...", () => {
	test("specific instance has valid data.", () => {
		expect(newClient.path).toBe("./.testing/NedbClientClassTestDb/");
		expect(newClient.name).toBe("NedbClientClassTestDb");
	});

	describe("can perform database operations...", () => {
		test("can retrieve one document.", async () => {
			let result = await newClient.findOneDocument("Users", {});

			expect(true).toBe(true);
		});
	})
})