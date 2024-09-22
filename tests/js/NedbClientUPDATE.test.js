const {SuperCamo, CollectionListEntry, NedbClient, CollectionAccessError} = require("../../dist/index.js");
// const {} = require("../../dist/structures/NedbClient.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");
const { ValidationFailureMissingValueForProperty } = require("../../dist/structures/errors/NedbBaseDocumentErrors.js");

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
	bio: {tagline: "Test user, the third.", blurb: "Super cool test user with a long, descriptive blurb."}
};

const fourthUserData = {
	email: "test4@email.com",
	bio: {tagline: "Test user, the fourth.", blurb: "Another super cool test user with a long, descriptive blurb."}
};

const nonexistentUser = {
	email: "nonexistentemail@email.com",
	bio: {
		tagline: "Nonexistent tagline.",
		blurb: "Nonexistent blurb."
	}
}

const upsertUserOne = {
	email: "upseruserone@email.com",
	bio: {
		tagline: "Made via upsert.",
		blurb: "Upsert is pretty cool."
	}
}

const upsertUserTwo = {
	email: "upserusertwo@email.com",
	bio: {
		tagline: "Made via upsert.",
		blurb: "Upsert is pretty cool."
	}
}

const invalidUpsertUserOne = {
	email: null,
	bio: {
		tagline: null,
		blurb: null
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

	await newClient.insertOne("Users", thirdUserData);

	await newClient.insertOne("Users", fourthUserData);
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
		test("returns a document instance when given a valid query, data, and upsert option, when no document already matches the query.", async () => {
			let result = await newClient.findAndUpdateOneDocument("Users", {email: upsertUserOne.email}, upsertUserOne, {upsert: true});
			expect(result.data.email).toBe(upsertUserOne.email);
			expect(result.data.bio.tagline).toBe(upsertUserOne.bio.tagline);

		});
		test("returns a document creation error when given a valid query and upsert option but invalid data.", async () => {
			expect(async () => {
				let result = await newClient.findAndUpdateOneDocument("Users", {email: nonexistentUser.email}, invalidUpsertUserOne, {upsert: true});
				console.log(result.data);
			}).rejects.toThrowError(ValidationFailureMissingValueForProperty);
		});
	});


	describe("findAndUpdateOneObject operations", () => {
		test("returns null when no data matches the given query.", async () => {
			let result = await newClient.findAndUpdateOneObject("Users",{email: nonexistentUser.email}, {email: "valueHereDoesntMatter@email.com"});
			expect(result).toBeNull();
		});
		test("returns a document instance when given a valid query and valid update data, specifically for top-level document data.", async () => {
			let result = await newClient.findAndUpdateOneObject("Users",{email: thirdUserData.email}, {email: "test-modified3@email.com"});
			expect(result.email).toBe("test-modified3@email.com");
			expect(result.bio.tagline).toBe(thirdUserData.bio.tagline);
		});
		test("returns a document instance when given a valid query and valid update data, specifically for embedded document data.", async () => {
			let result = await newClient.findAndUpdateOneObject("Users",{email: fourthUserData.email}, {bio: {tagline: "Modified embedded document data."}});
			expect(result.email).toBe(fourthUserData.email);
			expect(result.bio.tagline).toBe("Modified embedded document data.");
		});
		test("returns a document instance when given a valid query, data, and upsert option, when no document already matches the query.", async () => {
			let result = await newClient.findAndUpdateOneObject("Users", {email: upsertUserTwo.email}, upsertUserTwo, {upsert: true});
			expect(result.email).toBe(upsertUserTwo.email);
			expect(result.bio.tagline).toBe(upsertUserTwo.bio.tagline);

		});
		test("returns a document creation error when given a valid query and upsert option but invalid data.", async () => {
			expect(async () => {
				let result = await newClient.findAndUpdateOneObject("Users", {email: nonexistentUser.email}, invalidUpsertUserOne, {upsert: true});
				console.log(result.data);
			}).rejects.toThrowError(ValidationFailureMissingValueForProperty);
		});
	});


	describe("findAndUpdateManyDocuments operations", () => {

	});


	describe("findAndUpdateManyObjects operations", () => {

	});
});