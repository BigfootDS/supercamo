const {SuperCamo, CollectionListEntry, NedbClient, CollectionAccessError} = require("../../dist/index.js");
// const {} = require("../../dist/structures/NedbClient.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");

const firstUserData = {
	email: "test@email.com",
	bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}
};

const secondUserData = {
	email: "test2@email.com",
	bio: {tagline: "Test user, the second.", blurb: "Another super cool test user with a long, descriptive blurb."}
};

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbClientClassGeneralTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassGeneralTestDb",
		"./.testing/NedbClientClassGeneralTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);
})


describe("NedbClient class...", () => {

	

	test("instances can exist in SuperCamo static class.", () => {
		
		expect(SuperCamo.clientList.length).toBe(1);
		expect(SuperCamo.clients["NedbClientClassGeneralTestDb"]).toBe(newClient);
	});

	test("specific instance exists in SuperCamo static class and has valid data.", () => {

		let expectedInstance = SuperCamo.clientGet("NedbClientClassGeneralTestDb");

		expect(expectedInstance.path).toBe("./.testing/NedbClientClassGeneralTestDb/");
		expect(expectedInstance.name).toBe("NedbClientClassGeneralTestDb");
	});

});


describe("NedbClient class instances...", () => {
	test("specific instance has valid data.", () => {
		expect(newClient.path).toBe("./.testing/NedbClientClassGeneralTestDb/");
		expect(newClient.name).toBe("NedbClientClassGeneralTestDb");
		expect(newClient.collections.length).toEqual(1);
		expect(newClient.collections[0].name).toBe("Users");
	});

	test("can count documents in a collection that match a given query.", async () => {
		
		let countBeforeAnyDocs = await newClient.count("Users", {});
		expect(countBeforeAnyDocs).toBe(0);

		await newClient.insertOne("Users", firstUserData);
		let countAfterOneDoc = await newClient.count("Users", {});
		expect(countAfterOneDoc).toBe(1);

		await newClient.insertOne("Users", secondUserData);
		let countAfterTwoDocs = await newClient.count("Users", {});
		expect(countAfterTwoDocs).toBe(2);

		let countWithQuery = await newClient.count("Users", {email: firstUserData.email});
		expect(countWithQuery).toBe(1);

		let countWithNestedQuery = await newClient.count("Users", {"bio.tagline": secondUserData.bio.tagline});
		expect(countWithNestedQuery).toBe(1);
	})
});