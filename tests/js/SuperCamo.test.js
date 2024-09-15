

const {SuperCamo, CollectionListEntry} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");


/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("SuperCamoClassTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"SuperCamoClassTestDb",
		"./.testing/SuperCamoClassTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

});

describe("SuperCamo static class...", () => {



	test("can create a new database client.", () => {
		
		expect(SuperCamo.clientList.length).toBe(1);

	});

	test("can retrieve a client from list of clients.", () => {
		let retrievedClient = SuperCamo.clientGet("SuperCamoClassTestDb");

		expect(retrievedClient).toBeTruthy();
		expect(retrievedClient.name).toBe("SuperCamoClassTestDb");
		expect(retrievedClient.path).toBe("./.testing/SuperCamoClassTestDb/");
		expect(retrievedClient.collections.length).toBe(1);
	});

	test("cannot create another client with an existing client's name.", () => {
		expect(() => {
			let newDupeClientOne = SuperCamo.clientConnect(
				"SuperCamoClassTestDb",
				"./.testing/SuperCamoClassTestDb/",
				[
					new CollectionListEntry("Users", User)
				]
			);

			let newDupeClientTwo = SuperCamo.clientConnect(
				"SuperCamoClassTestDb",
				"./.testing/SuperCamoClassTestDb/",
				[
					new CollectionListEntry("Users", User)
				]
			);
		}).toThrow();
	})

	test("cannot delete a database client or its data if that database does not exist.", () => {

		let result = SuperCamo.clientDelete("NonexistentDatabase");

		expect(result).toBe(0);
	})

	test("can disconnect from a database client.", () => {
		expect(SuperCamo.clientList.length).toBe(1);

		let numDisconnected = SuperCamo.clientDisconnect("SuperCamoClassTestDb");

		expect(SuperCamo.clientList.length).toBe(0);

		expect(numDisconnected).toBe(1);

	});

	test("returns 0 if attempting to disconnect from a database that is not connected.", () => {
		let numDisconnected = SuperCamo.clientDisconnect("NonexistentDatabase");
		expect(numDisconnected).toBe(0);
	});
});