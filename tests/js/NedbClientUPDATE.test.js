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

const nonexistentUser = {
	email: "nonexistentemail@email.com",
	bio: {
		tagline: "Nonexistent tagline.",
		blurb: "Nonexistent blurb."
	}
}

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbClientClassUpdateTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassUpdateTestDb",
		"./.testing/NedbClientClassUpdateTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

	await newClient.insertOne("Users", firstUserData);

	await newClient.insertOne("Users", secondUserData);
})

describe("Database can perform UPDATE operations", () => {
	describe("findAndUpdateOneDocument operations", () => {
		test("returns null when no data matches the given query.", async () => {
			let result = await newClient.findAndUpdateOneDocument("Users",{email: nonexistentUser.email}, {email: "valueHereDoesntMatter@email.com"});
			expect(result).toBeNull();
		});
		test("returns a document instance when given a valid query and valid update data, specifically for top-level document data.", async () => {
			let result = await newClient.findAndUpdateOneDocument("Users",{email: firstUserData.email}, {email: "test-modified@email.com"});
			expect(result.data.email).toBe("test-modified@email.com");
			expect(result.data.bio.tagline).toBe(firstUserData.bio.tagline);
		});
		test("returns a document instance when given a valid query and valid update data, specifically for embedded document data.", async () => {
			let result = await newClient.findAndUpdateOneDocument("Users",{email: secondUserData.email}, {bio: {tagline: "Modified embedded document data."}});
			expect(result.data.email).toBe(secondUserData.email);
			expect(result.data.bio.tagline).toBe("Modified embedded document data.");
		});
		test.skip("returns a document instance when given a valid query, data, and upsert option, when no document already matches the query.", async () => {
			let result = await newClient.findAndUpdateOneDocument()
		});
		test.skip("returns a document creation error when given a valid query and upsert option but invalid data.", async () => {
			let result = await newClient.findAndUpdateOneDocument()
		});
	});


	describe("findAndUpdateOneObject operations", () => {

	});


	describe("findAndUpdateManyDocuments operations", () => {

	});


	describe("findAndUpdateManyObjects operations", () => {

	});
});