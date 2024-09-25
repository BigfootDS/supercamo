---
title: 02 - Document Basics

---

NeDB is a NoSQL database. That means that instead of tables and rows to represent entities of data, we use collections of documents.

Traditionally, one NeDB datastore is one collection. SuperCamo manages that for you, so you just have to assign a document and a collection name to a database client to make that work the same way you'd expect from popular NoSQL systems like MongoDB and MongooseJS.


### Declaring Documents 

Declaring a document is how you can define a schema or structure for your data.

Like so:

```js
const NedbDocument = require("@bigfootds/supercamo/NedbDocument");

class User extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);
		
		this.username = {
			type: String,
			required: true,
			unique: true
		}

	}
}

module.exports = {User}
```

In the document declaration above, a `User` document is configured to have one field: a username. It would look like this object:

```js
{
	username: ""
}
```

Everything else that's going on in that declaration is to enable and configure document validation. So, a username must be provided when creating a new User in the database, and that username must be unique.

The parameters in the constructor are managed by the NeDB database client - this means you should rarely (ideally never) work with documents directly, but instead through your NeDB database client instance. (The thing that you can retrieve from the SuperCamo singleton described in the previous section!)

### Using Documents With The Database

After you've declared your document, you can pass it and a desired collection name into SuperCamo when connecting to a database.

```js

const { User } = require("./path/to/document/declaration.js");

async function connect(){
	databaseInstance = await SuperCamo.connect(
		"BasicExampleDatabase", 
		path.join(process.cwd(), ".sandbox" , "databases"),
		[
			{
				name:"Users", 
				model:User
			},
			{
				name: "Admins", 
				model: User
			}
		]
	);
}
```

As you can see, you can reuse documents across multiple collections in a database.

You can then work with that collection via the database client instance.

```js
let foundUsers = await databaseInstance.findManyObjects("Users", {}, true);
let foundAdmins = await databaseInstance.findManyObjects("Admins", {}, true);
```

The above example retrieves arrays of objects, where the objects are all structured based on the document's declaration. That's handy for API responses - just make the query, and the result is your plain JSON-friendly data ready to manipulate and send.

If you want to work with a document directly, you can do so:

```js
let foundUser = await databaseInstance.findOneDocument("Users", {username: "Bigfoot"}, true);
let foundUserData = await foundUser.getData();
```

The above example queries for a user with a username that exactly matches `"Bigfoot"`, and returns an instance of the User document with the data of that matching user. However, to actually retrieve its values, you must call `.getData()` on the instance.

Documents can refer to other documents, specify minimum and maximum values of properties, restrict property values to a set of choices, and more.
You can read more about Document usage and functionalities in other pages - this is just a brief intro for now! 😉