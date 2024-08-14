

const {SuperCamo, CollectionListEntry} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");

describe("SuperCamo static class...", () => {

	let newClient = SuperCamo.clientConnect(
		"SuperCamoClassTestDb",
		"./.testing/SuperCamoClassTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

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