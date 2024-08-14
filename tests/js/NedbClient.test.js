const {SuperCamo, CollectionListEntry} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");


describe("NedbClient class...", () => {

	let newClient = SuperCamo.clientConnect(
		"NedbClientClassTestDb",
		"./.testing/NedbClientClassTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

	test("instances can exist in SuperCamo static class.", () => {
		
		expect(SuperCamo.clientList.length).toBe(1);

	});

});