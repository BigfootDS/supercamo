const {SuperCamo, CollectionListEntry, NedbClient} = require("../../dist/index.js");
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
	SuperCamo.clientDelete("NedbClientClassTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassTestDb",
		"./.testing/NedbClientClassTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

	await newClient.insertOne("Users", firstUserData);

	await newClient.insertOne("Users", secondUserData);
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

		describe("CREATE operations", () => {

		});

		describe("READ operations", () => {

			describe("findOneDocument operations", () => {
				test("can retrieve one document.", async () => {
					let result = await newClient.findOneDocument("Users", {});
					expect(result).toBeTruthy();
				});
				test("can retrieve a random document when given an empty query object.", async () => {
					let result = await newClient.findOneDocument("Users", {});
					expect(result.data.email).toBeTruthy();
					expect(result.data.bio.tagline).toBeTruthy();
				});
				test("can retrieve the correct document when given a query object containing top-level data keys.", async () => {
					let result = await newClient.findOneDocument("Users", {email: firstUserData.email});
					expect(result.data.email).toBe(firstUserData.email);
					expect(result.data.bio.tagline).toBe(firstUserData.bio.tagline);
				});
				test("can retrieve the correct document when given a query object containing nested-level data keys.", async () => {
					let result = await newClient.findOneDocument("Users", {'bio.tagline': secondUserData.bio.tagline});
					expect(result.data.email).toBe(secondUserData.email);
					expect(result.data.bio.tagline).toBe(secondUserData.bio.tagline);
				});
				test("returns null when the query does not match anything", async () => {
					let result = await newClient.findOneDocument("Users", {bananas: "yay"});
					expect(result).toBeNull();
				});
			});
			describe("findManyDocuments operations", () => {
				test("can retrieve ALL documents.", async () => {
					let result = await newClient.findManyDocuments("Users", {});
					expect(Array.isArray(result)).toBeTruthy();
				});
				test("can retrieve the correct documents when given a query object containing top-level data keys.", async () => {
					let result = await newClient.findManyDocuments("Users", {email: firstUserData.email});
					expect(result[0].data.email).toBe(firstUserData.email);
					expect(result[0].data.bio.tagline).toBe(firstUserData.bio.tagline);
				});
				test("can retrieve the correct document when given a query object containing nested-level data keys.", async () => {
					let result = await newClient.findManyDocuments("Users", {'bio.tagline': secondUserData.bio.tagline});
					expect(result[0].data.email).toBe(secondUserData.email);
					expect(result[0].data.bio.tagline).toBe(secondUserData.bio.tagline);
				});
				test("returns null when the query does not match anything", async () => {
					let result = await newClient.findManyDocuments("Users", {bananas: "yay"});
					expect(result.length).toBe(0);
				});
				test("can retrieve documents and limit the number of documents returned.", async () => {
					let result = await newClient.findManyDocuments("Users", {}, {limit: 1});
					expect(Array.isArray(result)).toBeTruthy();
					expect(result.length).toBe(1);
				});
			});
		});

		describe("UPDATE operations", () => {

		});

		describe("DELETE operations", () => {

		});

		

		
	});
});