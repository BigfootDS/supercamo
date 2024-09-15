const {SuperCamo, CollectionListEntry} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User } = require("./helpers/TestDocumentDefs.js");

/**
 * @type {NedbClient}
 */
let newClient;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbDocumentValidationsTestDb");
});


beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbDocumentValidationsTestDb",
		"./.testing/NedbDocumentValidationsTestDb/",
		[
			new CollectionListEntry("Users", User)
		]
	);

});

describe("NedbDocument class...", () => {

	test("documents inherit from NedbDocument.", () => {
		expect(Object.getPrototypeOf(User).toString().includes("NedbDocument")).toBe(true);
	})

	describe("databaseless instances...", () => {
		test("can be created outside of a database.", () => {
		
			let newUser = new User({email: "testuser1@email.com", bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}});
	
			expect(newUser.collectionName).toBeFalsy();
			expect(newUser.parentDatabaseName).toBeFalsy();
	
		});
	
		test("can validate themselves.", () => {
			
			let newUser = new User({email: "testuser1@email.com", bio: {tagline: "Test user.", blurb: "Super cool test user with a long, descriptive blurb."}});
	
			expect(newUser.collectionName).toBeFalsy();
			expect(newUser.parentDatabaseName).toBeFalsy();
	
		});
	});


	describe("database-stored instances...", () => {
		test("can be created via a database client.", async () => {
		
			let newUser = await newClient.createOne(
				"Users",
				{
					email: "testuser1@email.com", 
					bio: {
						tagline: "Test user.", 
						blurb: "Super cool test user with a long, descriptive blurb."
					}
				}
			);
	
			expect(newUser.collectionName).toBe("Users");
			expect(newUser.parentDatabaseName).toBe("NedbDocumentValidationsTestDb");
			expect(newUser.data.email).toBe("testuser1@email.com");
			expect(newUser.data.bio.tagline).toBe("Test user.");
			expect(newUser.data.bio.blurb).toBe("Super cool test user with a long, descriptive blurb.");
	
		});
	
		
	});

});