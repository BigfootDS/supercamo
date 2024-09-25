const {SuperCamo, CollectionListEntry, NedbClient} = require("../../dist/index.js");

const {describe, test, expect} = require("@jest/globals");
const { Adventurer, Wizard } = require("./helpers/TestDocumentDefs.js");

let goodWizardData = {
	name: "Gandalf the Beige-ish Grey",
	spells: ["Wish"],
	bio: {
		tagline: "Fly, you silly lads!",
		blurb: "Eagles? Never heard of them."
	},
	maxHealth: 100,
	currentHealth: 100
}

afterAll(async () => {
	SuperCamo.clientDelete("NedbDocumentInheritanceTestDb");
});


describe("NedbDocument validation tests...", () => {

	let newClient = SuperCamo.clientConnect(
		"NedbDocumentInheritanceTestDb",
		"./.testing/NedbDocumentInheritanceTestDb/",
		[
			new CollectionListEntry("Wizards", Wizard),
		]
	);

	test("documents inherit from NedbDocument.", () => {
		expect(Object.getPrototypeOf(Wizard).toString().includes("NedbDocument")).toBe(true);
	});

	test("all rules work when valid data is supplied that obeys the rules.", async () => {
		let wizardTesto = await newClient.createOne("Wizards", goodWizardData);
		
		console.log(wizardTesto.data);
		expect(wizardTesto.data.spells).toEqual(expect.arrayContaining(["Wish"]));
		expect(wizardTesto.data.name).toBe(goodWizardData.name);
		expect(wizardTesto.data.currentHealth).toBe(goodWizardData.currentHealth);
		expect(wizardTesto.data.maxHealth).toBe(goodWizardData.maxHealth);
		expect(wizardTesto.data.bio.tagline).toBe(goodWizardData.bio.tagline);
		expect(wizardTesto.data.bio.blurb).toBe(goodWizardData.bio.blurb);
	});

});