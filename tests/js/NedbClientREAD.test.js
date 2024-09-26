const {SuperCamo, CollectionListEntry, NedbClient, NedbClientErrors} = require("../../dist/index.js");
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
	SuperCamo.clientDelete("NedbClientClassReadTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassReadTestDb",
		"./.testing/NedbClientClassReadTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

	await newClient.insertOne("Users", firstUserData);

	await newClient.insertOne("Users", secondUserData);
})


describe("Database can perform READ operations", () => {

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
		test("throws an error if attempting to query a collection not found in the database.", async () => {
			expect.assertions(1);
			return newClient.findOneDocument("Bananas", {email: firstUserData.email}).catch(error => {
				expect(error).toBeInstanceOf(NedbClientErrors.CollectionAccessError)
			});
		})
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
		test("can retrieve the correct documents when given a query object containing nested-level data keys.", async () => {
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
		test("throws an error if attempting to query a collection not found in the database.", async () => {
			expect.assertions(1);
			return newClient.findManyDocuments("Bananas", {email: firstUserData.email}).catch(error => {
				expect(error).toBeInstanceOf(NedbClientErrors.CollectionAccessError)
			});
		})
	});


	describe("findOneObject operations", () => {
		test("can retrieve one object.", async () => {
			let result = await newClient.findOneObject("Users", {});
			expect(result).toBeTruthy();
		});
		test("can retrieve a random object when given an empty query object.", async () => {
			let result = await newClient.findOneObject("Users", {});
			expect(result.email).toBeTruthy();
			expect(result.bio.tagline).toBeTruthy();
		});
		test("can retrieve the correct object when given a query object containing top-level data keys.", async () => {
			let result = await newClient.findOneObject("Users", {email: firstUserData.email});
			expect(result.email).toBe(firstUserData.email);
			expect(result.bio.tagline).toBe(firstUserData.bio.tagline);
		});
		test("can retrieve the correct object when given a query object containing nested-level data keys.", async () => {
			let result = await newClient.findOneObject("Users", {'bio.tagline': secondUserData.bio.tagline});
			expect(result.email).toBe(secondUserData.email);
			expect(result.bio.tagline).toBe(secondUserData.bio.tagline);
		});
		test("returns null when the query does not match anything", async () => {
			let result = await newClient.findOneObject("Users", {bananas: "yay"});
			expect(result).toBeNull();
		});
		test("throws an error if attempting to query a collection not found in the database.", async () => {
			expect.assertions(1);
			return newClient.findOneObject("Bananas", {email: firstUserData.email}).catch(error => {
				expect(error).toBeInstanceOf(NedbClientErrors.CollectionAccessError)
			});
		});
		test("returns an object containing specific keys if a projection option is provided for a valid query.", async () => {
			let result = await newClient.findOneObject(
				"Users", 
				{
					email: firstUserData.email
				}, 
				{ 
					projection: { 
						email: 1
					}
				}
			);
			expect(result.email).toBe(firstUserData.email);
			expect(result.bio).toBeUndefined();

			let result2 = await newClient.findOneObject(
				"Users", 
				{
					email: secondUserData.email
				}, 
				{ 
					projection: { 
						email: 0,
						"bio.blurb": 0
					}
				}
			);
			expect(result2.email).toBeUndefined();
			expect(result2.bio.tagline).toBe(secondUserData.bio.tagline);
			expect(result2.bio.blurb).toBeUndefined();
		});
	});
	describe("findManyObjects operations", () => {
		test("can retrieve ALL objects.", async () => {
			let result = await newClient.findManyObjects("Users", {});
			expect(Array.isArray(result)).toBeTruthy();
		});
		test("can retrieve the correct objects when given a query object containing top-level data keys.", async () => {
			let result = await newClient.findManyObjects("Users", {email: firstUserData.email});
			expect(result[0].email).toBe(firstUserData.email);
			expect(result[0].bio.tagline).toBe(firstUserData.bio.tagline);
		});
		test("can retrieve the correct objects when given a query object containing nested-level data keys.", async () => {
			let result = await newClient.findManyObjects("Users", {'bio.tagline': secondUserData.bio.tagline});
			expect(result[0].email).toBe(secondUserData.email);
			expect(result[0].bio.tagline).toBe(secondUserData.bio.tagline);
		});
		test("returns null when the query does not match anything", async () => {
			let result = await newClient.findManyObjects("Users", {bananas: "yay"});
			expect(result.length).toBe(0);
		});
		test("can retrieve objects and limit the number of objects returned.", async () => {
			let result = await newClient.findManyObjects("Users", {}, {limit: 1});
			expect(Array.isArray(result)).toBeTruthy();
			expect(result.length).toBe(1);
		});
		test("throws an error if attempting to query a collection not found in the database.", async () => {
			expect.assertions(1);
			return newClient.findManyObjects("Bananas", {email: firstUserData.email}).catch(error => {
				expect(error).toBeInstanceOf(NedbClientErrors.CollectionAccessError)
			});
		});
		test("returns an array of object containing specific keys if a projection option is provided for a valid query.", async () => {
			let result = await newClient.findManyObjects(
				"Users", 
				{}, 
				{ 
					projection: { 
						email: 1
					}
				}
			);
			
			let foundDocsOnlyContainEmail = false;
			result.forEach(item => {
				if (item.email && (item.bio == undefined)){
					foundDocsOnlyContainEmail = true;
				} else {
					foundDocsOnlyContainEmail = false;
				}
			});
			expect(foundDocsOnlyContainEmail).toBe(true);

			let result2 = await newClient.findManyObjects(
				"Users", 
				{
					email: secondUserData.email
				}, 
				{ 
					projection: { 
						email: 0,
						"bio.blurb": 0
					}
				}
			);
			expect(result2[0].email).toBeUndefined();
			expect(result2[0].bio.tagline).toBe(secondUserData.bio.tagline);
			expect(result2[0].bio.blurb).toBeUndefined();
		});
	});


});