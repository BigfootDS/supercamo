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

const thirdUserData = {
	email: "test3@email.com",
	bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}
};

const fourthUserData = {
	email: "test4@email.com",
	bio: {tagline: "Test user, the fourth.", blurb: "Another super cool test user with a long, descriptive blurb."}
};

const fifthUserData = {
	email: "test5@email.com",
	bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}
};

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {

	// let count = await newClient.count("Users", {});
	// console.log(`${newClient.name} Users collection contains ${count} documents.`);

	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbClientClassDeleteTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassDeleteTestDb",
		"./.testing/NedbClientClassDeleteTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

	await newClient.insertOne("Users", firstUserData);

	await newClient.insertOne("Users", secondUserData);

	await newClient.insertMany("Users", [thirdUserData, fourthUserData, fifthUserData]);

	// let count = await newClient.count("Users", {});
	// console.log(`${newClient.name} Users collection contains ${count} documents.`);
})

describe("Database can perform DELETE operations", () => {
	describe("findAndDeleteOne operations", () => {
		test("returns 0 when no documents match the given query, and no deletions occur.", async () => {
			let numDeleted = await newClient.findAndDeleteOne("Users", {bananas: "yay!"});
			expect(numDeleted).toBe(0);
		});
		test("returns a positive number when at least one document does match the given query, and deletions do occur.", async () => {
			let numDeleted = await newClient.findAndDeleteOne("Users", {email: secondUserData.email});
			expect(numDeleted).toBe(1);
		});
	});
	describe("findAndDeleteMany operations", () => {
		test("returns 0 when no documents match the given query, and no deletions occur.", async () => {
			let numDeleted = await newClient.findAndDeleteMany("Users", {bananas: "yay!"});
			expect(numDeleted).toBe(0);
		});
		test("returns a positive number when at least one document does match the given query, and deletions do occur.", async () => {
			let numDeleted = await newClient.findAndDeleteMany("Users", {'bio.tagline': firstUserData.bio.tagline});
			expect(numDeleted).toBe(3);
		});
		
	});
});