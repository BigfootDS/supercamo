const {SuperCamo, CollectionListEntry, NedbClient, NedbBaseDocumentErrors} = require("../../dist/index.js");
// const {} = require("../../dist/structures/NedbClient.js");

const {describe, test, expect} = require("@jest/globals");
const { UserWithPassword } = require("./helpers/TestDocumentDefs.js");

const firstUserData = {
	email: "test@email.com",
	password: "Password1",
	bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}
};

const secondUserData = {
	email: "test2@email.com",
	password: "Password2",
	bio: {tagline: "Test user, the second.", blurb: "Another super cool test user with a long, descriptive blurb."}
};

const thirdUserData = {
	email: "test3@email.com",
	password: "Password3",
	bio: {tagline: "Test user, the third.", blurb: "Another super cool test user with a long, descriptive blurb."}
};

const invalidUserOne = {
	email: "a.com",
	password: "no",
	bio: {}
}

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbClientClassCreateTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbClientClassCreateTestDb",
		"./.testing/NedbClientClassCreateTestDb/",
		[
			new CollectionListEntry("Users", UserWithPassword)
		]
	);

})

describe("Database can perform CREATE operations", () => {
	describe("insertOne (object) operations", () => {
		test("returns an appropriate object when given valid data for database insertion.", async () => {
			let result = await newClient.insertOne("Users", firstUserData);
			console.log(result);
			expect(result.email).toBe(firstUserData.email);
		});
	});

	describe.skip("insertMany (objects) operations", () => {

	});

	describe("createOne (document) operations", () => {
		test("returns an appropriate object when given valid data for database insertion.", async () => {
			let result = await newClient.createOne("Users", secondUserData);
			console.log(result.data);
			expect(result.data.email).toBe(secondUserData.email);
		});

		test("throws an error when attempting to make a document with invalid data.", async () => {
			expect(async () => {
				let result = await newClient.createOne("Users", invalidUserOne);
				console.log(result.data);
			}).rejects.toThrowError(NedbBaseDocumentErrors.ValidationFailureMissingValueForProperty);
		})
	});

	describe.skip("createMany (documents) operations", () => {

	});
});