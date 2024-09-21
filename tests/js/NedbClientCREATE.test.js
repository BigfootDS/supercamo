const {SuperCamo, CollectionListEntry, NedbClient, NedbBaseDocumentErrors} = require("../../dist/index.js");
// const {} = require("../../dist/structures/NedbClient.js");

const {describe, test, expect} = require("@jest/globals");
const { UserWithPassword } = require("./helpers/TestDocumentDefs.js");

//#region Test data

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
};

const insertManyDataOne = [
	{
		email: "testMany1@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the many, the first.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "testMany2@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the many, the second.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "testMany3@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the many, the third.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
];

const createManyDataOne = [
	{
		email: "testCreateMany1@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the createMany, the first.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "testCreateMany2@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the createMany, the second.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "testCreateMany3@email.com",
		password: "Password1",
		bio: {tagline: "Test user of the createMany, the third.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
];

const invalidManyDataOne = [
	{
		email: "testInvalidMany1@email.com",
		password: "",
		bio: {tagline: "Test user of the invalid create/insert many operations, the first.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "",
		password: "Password1",
		bio: {tagline: "Test user of the invalid create/insert many operations, the second.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
	{
		email: "a",
		password: "a",
		bio: {tagline: "Test user of the invalid create/insert many operations, the third.", blurb: "Another super cool test user with a long, descriptive blurb."}
	},
];


//#endregion

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

});

describe("Database can perform CREATE operations", () => {
	describe("insertOne (object) operations", () => {
		test("returns an appropriate object when given valid data for database insertion.", async () => {
			let result = await newClient.insertOne("Users", firstUserData);
			// console.log(result);
			expect(result.email).toBe(firstUserData.email);
		});
	});

	describe("insertMany (objects) operations", () => {
		test("returns an appropriate array of objects when given a valid array of data for database insertion.", async ()=>{
			let result = await newClient.insertMany("Users", insertManyDataOne);
			console.log(result);
			expect(result.length).toBe(3);
			expect(result.find((entry) => entry.email == insertManyDataOne[0].email)).toBeTruthy();
			expect(result.find((entry) => entry.email == insertManyDataOne[1].email)).toBeTruthy();
			expect(result.find((entry) => entry.email == insertManyDataOne[2].email)).toBeTruthy();
		});
		test("throws an error when attempting to make a document with invalid data.", async () => {
			expect(async () => {
				let result = await newClient.insertMany("Users", invalidManyDataOne);
				// console.log(result.data);
			}).rejects.toThrowError(NedbBaseDocumentErrors.ValidationFailureMinMaxError);
		});
	});

	describe("createOne (document) operations", () => {
		test("returns an appropriate object when given valid data for database insertion.", async () => {
			let result = await newClient.createOne("Users", secondUserData);
			// console.log(result.data);
			expect(result.data.email).toBe(secondUserData.email);
		});

		test("throws an error when attempting to make a document with invalid data.", async () => {
			expect(async () => {
				let result = await newClient.createOne("Users", invalidUserOne);
				// console.log(result.data);
			}).rejects.toThrowError(NedbBaseDocumentErrors.ValidationFailureMissingValueForProperty);
		});
	});

	describe("createMany (documents) operations", () => {
		test("returns an appropriate array of document instances when given a valid array of data for database insertion.", async ()=>{
			let result = await newClient.createMany("Users", createManyDataOne);
			console.log(result);
			expect(result.length).toBe(3);
			expect(result.find((entry) => entry.data.email == createManyDataOne[0].email)).toBeTruthy();
			expect(result.find((entry) => entry.data.email == createManyDataOne[1].email)).toBeTruthy();
			expect(result.find((entry) => entry.data.email == createManyDataOne[2].email)).toBeTruthy();
		});
		test("throws an error when attempting to make a document with invalid data.", async () => {
			expect(async () => {
				let result = await newClient.createMany("Users", invalidManyDataOne);
				// console.log(result.data);
			}).rejects.toThrowError(NedbBaseDocumentErrors.ValidationFailureMinMaxError);
		});
	});
});