---
title: Quick Start
group: Quick Start
category: Guides

---

This is a NoSQL "ODM" built for usage with NeDB. You can define schemas for the data that you want to store in a NeDB database, and the objects that get used within NeDB will obey the rules and functionalities defined by your schemas.

It's like how MongooseJS is for MongoDB - SuperCamo is for NeDB.

## Installation

Install this package as a production dependency using this command:

```bash
npm install @bigfootds/supercamo
```

## Define Your Documents

Import SuperCamo's various bits and pieces, and use them to define your document structures.

```js
const { NedbEmbeddedDocument, NedbDocument, SuperCamo } = require("@bigfootds/supercamo");

class Bio extends NedbEmbeddedDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			tagline: {
				type: String,
				required: true,
				unique: false
			},
			blurb: {
				type: String,
				required: true,
				unique: false
			}
		}
	}
}

class User extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			email: {
				type: String,
				required: true,
				unique: true
			},
			bio: {
				type: Bio,
				required: false
			}
		}		
	}
}
```

The above code example shows a definition of two types of documents: a document, and an embedded document.

Embedded documents are like definitions for nested objects of data. These allow a Document to contain nested, complex data, and provide schema enforcement at every step of that nesting.

Documents are the "thing" that gets stored within a NeDB database. You'll typically create _collections_ of documents, and those documents may have properties of whatever type you define within them.

A Document is converted into an object when stored in NeDB databases, so quirks may occur if you go and use NeDB directly or do direct modifications to a NeDB datastore file.

Once your Documents are defined, you can start using them.

## Using Your Documents

There are two main ways to use Documents in SuperCamo:

- via a database client that either SuperCamo defined (eg. `NedbClient`) or that you defined (eg. `SomeClientThatInheritsFromNedbClient`)
- via the document class that you've defined

If you work with your documents directly via your defined document classes, the data **does not** exist in a database. Things like `unique` constraints in your document's rules will not work. The flipside to this is that you can quickly validate or manipulate objects of data against the document definition, without any concerns of impacting your database and its data. It looks like this:

```js

let newUserInstance = new User({
	email: "contact@bigfootds.com",
	bio: {
		blurb: "Some cool blurb goes here.",
		tagline: "Some cool tagline goes here."
	}
});

await newUserInstance.validate().catch(error => {
	console.log("Validation failed.");
	throw error;
});

console.log("Validation passed!");

```

If you work with your documents via a database client, the documents have full functionality and can persist via the connected database. This is what most people will be doing - this is the way that you connect to a database and perform database operations.

```js
/**
 * @type {NedbClient}
 */
let newClient = SuperCamo.clientConnect(
	"QuickstartDatabase",
	"./QuickstartDatabase/",
	[
		new CollectionListEntry("Users", User),
	]
);

let newUser = await newClient.createOne("Users", {
	email: "contact@bigfootds.com",
	bio: {
		blurb: "Some cool blurb goes here.",
		tagline: "Some cool tagline goes here."
	}
});

console.log(newUser.data);
```

Creating documents or objects via the database client instance allows that data to persist in the database. 

You'll wanna lean on the database client instance a lot in your own code!

## Using Database Clients In Multiple Files

The idea with SuperCamo is that one singleton ("SuperCamo", the import) handles all the faffing around with multiple database connections and clients.

So, you can connect to a database in one chunk of your code, and then use another chunk of your code to retrieve that connection. You don't need to export any of your database client instances, basically.

```js
let quickstartDbRetrieved = SuperCamo.clientGet("QuickstartDatabase");
let foundUser = await quickstartDbRetrieved.findOneDocument("Users", {email: "contact@bigfootds.com"});

console.log(foundUser.data);
```

If no client is found via `SuperCamo.clientGet()`, you'll want some error-handling or conditional code in place in your project. But other than that, using the SuperCamo singleton to retrieve database connections and then using methods on a database connection - that is the main way to work with data in this package.

## All The Code Together

The above code snippets were built as a singular file, so things like the imported modules may get mixed up in the reading. So, here - this is what the full code from this page looks like.

This code does have some minor changes to the above snippets:

- It imports `path` from `node:path`, and uses it in the database client connection.

```js
const { 
	// Used for document definitions
	NedbEmbeddedDocument,
	// Used for document definitions
	NedbDocument,
	// Used for most package functionality, especially database interactions
	SuperCamo,
	// Used for database client initial connections
	CollectionListEntry,
	// Handy for JSDoc typing or other intellisense, in this code example
	NedbClient
} = require("@bigfootds/supercamo");

// Realistically, you'll wanna use `path` to figure out a good, relative, cross-platform path for your database storage.
const path = require("node:path");


class Bio extends NedbEmbeddedDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			tagline: {
				type: String,
				required: true,
				unique: false
			},
			blurb: {
				type: String,
				required: true,
				unique: false
			}
		}
	}
}

class User extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			email: {
				type: String,
				required: true,
				unique: true
			},
			bio: {
				type: Bio,
				required: false
			}
		}		
	}
}


async function databaselessExample(){
	let newUserInstance = new User({
		email: "contact@bigfootds.com",
		bio: {
			blurb: "Some cool blurb goes here.",
			tagline: "Some cool tagline goes here."
		}
	});

	await newUserInstance.validate().catch(error => {
		console.log("Validation failed.");
		throw error;
	});

	console.log("Validation passed!");
	console.log(newUserInstance.data);
}

async function databaseConnectedExample(){

	/**
	 * @type {NedbClient}
	 */
	let newClient = SuperCamo.clientConnect(
		"QuickstartDatabase",
		path.join(process.cwd(), "databases", "QuickStartDatabase"),
		[
			new CollectionListEntry("Users", User),
		]
	);

	let newUser = await newClient.createOne("Users", {
		email: "contact@bigfootds.com",
		bio: {
			blurb: "Some cool blurb goes here.",
			tagline: "Some cool tagline goes here."
		}
	});

	console.log(newUser.data);

	// In other files, you can retrieve that connected database client through SuperCamo too.
	// So you wanna connect to a specific database once, and retrieve that connection throughout your project.
	let quickstartDbRetrieved = SuperCamo.clientGet("QuickstartDatabase");
	let foundUser = await quickstartDbRetrieved.findOneDocument("Users", {email: "contact@bigfootds.com"});

	console.log(foundUser.data);

}

// Use one or the other to see the code in action.
// databaselessExample();
// databaseConnectedExample();

```