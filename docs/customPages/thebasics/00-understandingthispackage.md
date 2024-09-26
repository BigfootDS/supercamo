---
title: 00 - Understanding This Package

---

SuperCamo is a package built as a wrapper around NeDB. It contains several key parts that you need to understand to really make good use of this package, and you would benefit from also digging around in NeDB package documentation - but we'll point that out when it's necessary in the other documentation pages.

This page will walk you through the key components of this package and briefly explain what they are, as well as when you need to use them.

There are a lot of moving pieces in this system. In a nutshell:

## The SuperCamo singleton

This package is all about making it easier to manage multiple NeDB database connections within a single app's lifetime. The SuperCamo singleton is how that happens.

Essentially, you should connect to a database via the SuperCamo singleton. The `SuperCamo.connect()` function returns a reference to the database client instance, and that same instance can be retrieved again in any file that uses the SuperCamo singleton too. 

A singleton is an essentially-global value - wherever you import the SuperCamo singleton, you will have access to the data stored in that singleton - even if the changes to that data happen in other files.

It means that one file can setup and connect to the database like this:

```js
async function connect(){
	// Connect to the database
	databaseInstance = await SuperCamo.connect(
		"BasicExampleDatabase", 
		path.join(process.cwd(), "databases", "BasicExampleDatabase"),
		[
			{name:"Users", model:User},
			{name: "Articles", model: Article}
		]
	);
	console.log("Database instance:");
	console.log(databaseInstance);
}
connect();
```

And then other files can refer to the database with code like this:

```js
const express = require("express");
const router = express.Router();

const SuperCamo = require("@bigfootds/supercamo");
const databaseInstance = SuperCamo.clientGet("BasicExampleDatabase");

router.get("/all", async (request, response) => {
	let availableArticles = await databaseInstance.findManyObjects("Articles", {});

	response.json(availableArticles);
});
```

Read more about the SuperCamo singleton on [its tutorial page](./01-thesupercamosingleton.md).



## Documents

Declaring a document is how you can define a schema or structure for your data.

Like so:

```js
const {NedbDocument} = require("@bigfootds/supercamo");

class User extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);
		
		this.rules = {
			username: {
				type: String,
				required: true,
				unique: true
			}
		}

	}
}

module.exports = {User}
```

In the document declaration above, a `User` document is configured to have one field: a username. Its document data would look like this object in the NeDB datastore:

```js
{
	_id: "",
	username: ""
}
```

Everything else that's going on in that declaration is to enable and configure document validation. So, a username must be provided when creating a new User in the database, and that username must be unique.

The parameters in the constructor are managed by the NeDB database client - this means you should rarely (ideally never) work with documents directly, but instead through your NeDB database client instance. 

Documents have support for document referencing and population, as well as validation and other operation event hooks.

Read more about the SuperCamo document on [its tutorial page](./02-documentbasics.md).


## Subdocuments or Embedded Documents

Subdocuments or embedded documents are a way of structuring complex data nested within documents. While a document can have objects as its properties/fields, it's typically more straightforward to create embedded documents to represent objects instead. 

Embedded documents have their own validation step, so you can configure validation rules in a declared embedded document and they will run when the document that contains the embedded document runs. Might sound hard to keep track of, but basically: embedded documents are identical to regular documents, except you cannot use embedded documents as standalone documents. They can only exist as properties within documents.

For example:

```js
const {NedbEmbeddedDocument} = require('@bigfootds/supercamo');
const ISO6391 = require('iso-639-1');
let allowedLanguageCodes = ISO6391.getAllCodes();

class LocalizedContent extends NedbEmbeddedDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.rules = {
			/**
			 * A two-letter language code that matches the language of this subdocument's name and content.
			 * Examples: "EN", "FR", "DE"
			 * Refer to the ISO-639-1 standard online for the full list of usable codes.
			 */
			language: {
				type: String,
				choices: allowedLanguageCodes,
				unique: false,
				required: true
			},
			/**
			 * Content written in the language assigned to this.language.
			 */
			content: {
				type: String,
				required: true,
				unique: false
			}
		}
	}
}


module.exports = { LocalizedContent };
```

The embedded document above provides a way to structure localized content. A document that uses this embedded document would be able to store translated and localized data by declaring a property that uses an array of LocalizedContent as its `type`.

Read more about embedded documents on [its tutorial page](./03-embeddeddocumentbasics.md).


## Database Client

As we've seen in the snippets of code so far, we use SuperCamo to create a connection to a database and work with the database instance that SuperCamo returns to us. We can retrieve this database instance again and again in any file by using the SuperCamo singleton, and then any database operations we want to do should be performed on that database client instance.

The database client is built with a focus on `async` functionality. Database operations take time. Beyond that, the database client provides a variety of methods to allow you to carry out typical database operations.

Read more about the SuperCamo database client on [its tutorial page](./04-dbclientbasics.md).

## Summary

So, those are the four main components to SuperCamo. If that sounds interesting to you, keep digging into this documentation and start coding! 

Go and [get started!](../00%20-%20QuickStart.md)