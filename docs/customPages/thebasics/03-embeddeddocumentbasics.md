---
title: 03 - Embedded Document Basics

---

Subdocuments or embedded documents are a way of structuring complex data nested within documents. While a document can have objects as its properties/fields, it's typically more straightforward to create embedded documents to represent objects instead. 

## Declaring Embedded Documents

Embedded documents have their own validation step, so you can configure validation rules in a declared embedded document and they will run when the document that contains the embedded document runs. Might sound hard to keep track of, but basically: embedded documents are identical to regular documents, except you cannot use embedded documents as standalone documents. They can only exist as properties within documents.

For example:

```js
const {NedbEmbeddedDocument} = require('@bigfootds/supercamo');
const ISO6391 = require('iso-639-1');
let allowedLanguageCodes = ISO6391.getAllCodes();

class LocalizedContent extends NedbEmbeddedDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		/**
		 * A two-letter language code that matches the language of this subdocument's name and content.
		 * Examples: "EN", "FR", "DE"
		 * Refer to the ISO-639-1 standard online for the full list of usable codes.
		 */
		this.language = {
			type: String,
			choices: allowedLanguageCodes,
			unique: false,
			required: true
		}

		/**
		 * Content written in the language assigned to this.language.
		 */
		this.content = {
			type: String,
			required: true,
			unique: false
		}
	}

}


module.exports = { LocalizedContent };
```

## Usage

The embedded document above provides a way to structure localized content. So, an Article document would then use the LocalizedContent embedded document like this - an array of localized content to represent article translations:

```js
const {NedbDocument} = require("@bigfootds/supercamo");
const { LocalizedContent } = require("../subdocuments/LocalizedContent");

class Article extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);
		
		this.title = {
			type: [LocalizedContent],
			required: true
		}

		this.body = {
			type: [LocalizedContent],
			required: true
		}

	}
}

module.exports = {Article}
```


## Querying Embedded Documents

It may become a little bit trickier to conceptualize or visualize the queries you would then need to work with the Article documents, but you can use dot notation to reach down into the embedded document when querying. Like this:

```js
let foundSpecificArticle = await databaseInstance.findOneObject(
	"Articles", 
	{ 
		"title.content":"Some Imaginary Article"
	}, 
	true
);
```

Embedded documents are not impacted by any document population settings - a query to a document will return all of its embedded document data.

This is because embedded documents are stored as objects within the containing document, and only convert back into Embedded Document instances during validation steps.