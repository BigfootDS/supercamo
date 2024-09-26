const {SuperCamo, CollectionListEntry, NedbClient} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { User, ValidationRuleTester } = require("./helpers/TestDocumentDefs.js");
const BaseDocumentErrors = require("../../dist/structures/errors/NedbBaseDocumentErrors.js");

let goodValidVrtData = {
	exampleRequiredNoDefault: "Hello, world!",
	exampleRequiredWithDefault: null,
	exampleUnique: null,
	exampleMinNumber: 0,
	exampleMinNumberWithError: 10,
	exampleMaxNumber: 100,
	exampleMaxNumberWithError: 10,
	exampleStringMinLength: "b",
	exampleStringMinLengthWithError: "abcdefghij",
	exampleStringMaxLength: "abcdefghijklmnopqrstuv",
	exampleArrayMinLength: ["b"],
	exampleArrayMinLengthWithError: [
		"a", "b", "c", "d", "e", "f","g","h", "i", "j"
	],
	exampleArrayMaxLength: ["b"],
	exampleArrayMaxLengthWithError: ["a"],
	exampleValueInChoices: "squirtle",
	exampleMatchRuleRegex: "Banana",
	exampleValidateRule: "Hello, world!"
};

/**
 * @type {NedbClient}
 * @author BigfootDS
 */
let newClient = null;

afterAll(async () => {
	await newClient.dropDatabase();
	SuperCamo.clientDelete("NedbDocumentValidationsTestDb");
});

beforeAll(async () => {
	newClient = SuperCamo.clientConnect(
		"NedbDocumentValidationsTestDb",
		"./.testing/NedbDocumentValidationsTestDb/",
		[
			new CollectionListEntry("Users", User),
			new CollectionListEntry("ValidationRuleTesters", ValidationRuleTester)
		]
	);
})


describe("NedbDocument validation tests...", () => {

	

	test("documents inherit from NedbDocument.", () => {
		expect(Object.getPrototypeOf(User).toString().includes("NedbDocument")).toBe(true);
		expect(Object.getPrototypeOf(ValidationRuleTester).toString().includes("NedbDocument")).toBe(true);
	});

	test("all rules work when valid data is supplied that obeys the rules.", async () => {
		let userToRef = await newClient.createOne("Users", {
			email: "exampleEmail@email.com",
			bio: {
				blurb: "Blah blah blurb.",
				tagline: "Blah blah tagline."
			}
		});

		let localGoodValidVrtData = {...goodValidVrtData, exampleReferenceDoc: userToRef.data._id};
		
		let vrtInstance = await newClient.createOne("ValidationRuleTesters", localGoodValidVrtData);

		// console.log(vrtInstance.data);
		expect(vrtInstance.data.exampleRequiredWithDefault).toBe(vrtInstance.rules.exampleRequiredWithDefault.default);
		expect(vrtInstance.data.exampleUnique).toBeTruthy();
		expect(vrtInstance.data.exampleMinNumber).toBe(10);
		expect(vrtInstance.data.exampleMaxNumber).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength).toBe("baaaaaaaaa");
		expect(vrtInstance.data.exampleStringMaxLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMaxLength).toBe("abcdefghij");
		expect(vrtInstance.data.exampleArrayMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleArrayMinLength).toEqual(expect.arrayContaining(["b", "a", "a", "a", "a", "a", "a", "a", "a", "a"]));
		
	});

	test("a document instance should be able to save its data to its own database record.", async () => {
		let userToRef = await newClient.createOne("Users", {
			email: "exampleEmail2@email.com",
			bio: {
				blurb: "Blah blah blurb.",
				tagline: "Blah blah tagline."
			}
		});

		let localGoodValidVrtData = {...goodValidVrtData, exampleReferenceDoc: userToRef.data._id};
		
		let vrtInstance = await newClient.createOne("ValidationRuleTesters", localGoodValidVrtData);

		// console.log(vrtInstance.data);
		expect(vrtInstance.data.exampleRequiredWithDefault).toBe(vrtInstance.rules.exampleRequiredWithDefault.default);
		expect(vrtInstance.data.exampleUnique).toBeTruthy();
		expect(vrtInstance.data.exampleMinNumber).toBe(10);
		expect(vrtInstance.data.exampleMaxNumber).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength).toBe("baaaaaaaaa");
		expect(vrtInstance.data.exampleStringMaxLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMaxLength).toBe("abcdefghij");
		expect(vrtInstance.data.exampleArrayMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleArrayMinLength).toEqual(expect.arrayContaining(["b", "a", "a", "a", "a", "a", "a", "a", "a", "a"]));
		
		vrtInstance.data.exampleValueInChoices = "charmander";
		await vrtInstance.save();

		let foundVrtInstance = await newClient.findOneDocument("ValidationRuleTesters", {exampleValueInChoices: "charmander"});
		expect(foundVrtInstance.data._id == vrtInstance.data._id).toBeTruthy();
	});

	test("a document instance can exist separate from any database and still validate successfully.", async () => {
		

		let localGoodValidVrtData = {...goodValidVrtData};
		
		let vrtInstance = new ValidationRuleTester(localGoodValidVrtData);
		await vrtInstance.validate();

		// console.log(vrtInstance.data);
		expect(vrtInstance.data.exampleRequiredWithDefault).toBe(vrtInstance.rules.exampleRequiredWithDefault.default);
		expect(vrtInstance.data.exampleUnique).toBeTruthy();
		expect(vrtInstance.data.exampleMinNumber).toBe(10);
		expect(vrtInstance.data.exampleMaxNumber).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMinLength).toBe("baaaaaaaaa");
		expect(vrtInstance.data.exampleStringMaxLength.length).toBe(10);
		expect(vrtInstance.data.exampleStringMaxLength).toBe("abcdefghij");
		expect(vrtInstance.data.exampleArrayMinLength.length).toBe(10);
		expect(vrtInstance.data.exampleArrayMinLength).toEqual(expect.arrayContaining(["b", "a", "a", "a", "a", "a", "a", "a", "a", "a"]));
		
	});
	
	test("a document can delete itself.", async () => {
		let userToRefSelfDeleter = await newClient.createOne("Users", {
			email: "exampleEmail3@email.com",
			bio: {
				blurb: "Blah blah blurb.",
				tagline: "Blah blah tagline."
			}
		});

		let localGoodValidVrtData = {...goodValidVrtData, exampleReferenceDoc: userToRefSelfDeleter.data._id};
		
		let vrtInstance = await newClient.createOne("ValidationRuleTesters", localGoodValidVrtData);
		
		let deleteCount = await vrtInstance.delete();
		expect(deleteCount).toBe(1);
		let foundUserToRef = await newClient.findOneDocument("Users", {_id: userToRefSelfDeleter.data._id});
		expect(foundUserToRef).toBeTruthy();

		let vrtInstance2 = await newClient.createOne("ValidationRuleTesters", localGoodValidVrtData);
		let deleteCount2 = await vrtInstance2.delete(true);
		expect(deleteCount2).toBe(1);
		let foundUserToRef2 = await newClient.findOneDocument("Users", {_id: userToRefSelfDeleter.data._id});
		expect(foundUserToRef2).toBeFalsy();
	});

	describe("NedbDocument error-handling tests per rule...", () => {
		test("Invalid data given for a property with a required constraint throws a required-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleRequiredNoDefault = null;
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailureMissingValueForProperty)
		});

		test("Invalid data given for a property with a unique constraint throws a unique-specific error.", async () => {
			let localGoodValidVrtData = {...goodValidVrtData};

			let someGoodDoc = await newClient.createOne("ValidationRuleTesters", localGoodValidVrtData);

			expect(async () => {
				let localBadVrtData = {...localGoodValidVrtData};
				localBadVrtData.exampleUnique = someGoodDoc.data.exampleUnique;
				let someBadDoc = await newClient.createOne("ValidationRuleTesters", localBadVrtData);
				// Tbh, this should be something more specific than just a general "SaveFailure"...
				// ...but the way uniqueness is checked is at the database level, so a better error
				// would require a better uniqueness validation technique.
			}).rejects.toThrowError(BaseDocumentErrors.SaveFailure);
		});

		test("Invalid data given for a property of a specified type throws a type-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleMinNumber = "bananas";
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailureMissingValueForProperty)
		});

		test("Invalid data given for a property with a strict min constraint throws a minmax-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleMinNumberWithError = 0;
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
				console.log(vrtInstance.data);
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailureMinMaxError)
		});

		test("Invalid data given for a property with a strict max constraint throws a minmax-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleMaxNumberWithError = 9001;
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
				console.log(vrtInstance.data);
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailureMinMaxError)
		});

		test("Invalid data given for a property with a choices constraint throws a choices-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleValueInChoices = "pikachu";
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
				console.log(vrtInstance.data);
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailureValueNotInChoices)
		});

		test("Invalid data given for a property with a choices constraint throws a choices-specific error.", async () => {
			let localVrtData = {...goodValidVrtData};
			localVrtData.exampleValidateRule = "pikachu";
			
			let vrtInstance = new ValidationRuleTester(localVrtData);
			expect(async () => {
				await vrtInstance.validate();
				console.log(vrtInstance.data);
			}).rejects.toThrowError(BaseDocumentErrors.ValidationFailure)
		});
	})
});