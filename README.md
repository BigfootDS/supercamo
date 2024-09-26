# @bigfootds/supercamo

SuperCamo is a Camo-inspired object data modeller (ODM) for NeDB, built specifically for BigfootDS' needs.

This package was inspired by Scott Robinson's [Camo](https://github.com/scottwrobinson/camo) ODM - but BigfootDS had some specific needs and an urge to try out TypeScript. We greatly appreciate what Camo is and does!

## The URLs

- [NPM package](https://www.npmjs.com/package/@bigfootds/supercamo)
- [GitHub repository](https://github.com/BigfootDS/supercamo)
- [Documentation website](https://bigfootds.github.io/supercamo/)

We've dumped a bunch of info into this readme here for the sake of NPM and GitHub repo "quickly glance at packages to see if they sound cool"-type developers, but we strongly recommend digging into the documentation website. It's nicer!


## The what

- NeDB compatibility
- Treat multiple NeDB datastores as a singular database
- Allow concurrent connections to multiple databases
- ODM-style wrapping around NeDB datastores
- Modern JavaScript implementations
- Leaning on standard NodeJS functions and APIs more than ever before to minimize production dependencies

## The nitty-gritty

- Built using NodeJS version 20, looking _forward_ only.
- Built to depend on this particular flavour of NeDB:
	- [@seald-io/nedb](https://github.com/seald/nedb)

## The installation

Run this command:

```bash
npm install @bigfootds/supercamo
```

## The usage

This package is intended for usage in back-end JavaScript systems - anything that is built with _and runs on_ NodeJS, not the browser. Might work in the browser - we haven't tested it in the browser ourselves - we only have a need for NodeJS compatibility at this time. We're specifically after ExpressJS server usage and ElectronJS "main" process usage.

### Concepts

SuperCamo is an object document manager (ODM) for NeDB. This means it's essentially a NoSQL database wrapper.

Since SuperCamo facilitates concurrent connections of multiple databases, it's got some fundamental differences in how it works compared to ye olde Camo and other NeDB-compatible ODMs.

Essentially:

- This library lets you create custom NedbClients.
- Each custom NedbClient that you create must include a list of Documents allowed to exist in that database client's database. 
	- EmbeddedDocuments do not need specifying, as they can only be used within Documents anyway.
- When performing queries on Documents, you must instead perform queries on a specific database client's reference to the Document. eg. no more `Document.findOne();`, but instead `SomeClient.findOneDocument("CollectionName", query);`.

### Declare Your Models

First, you should create some models or documents.

```js
const {NedbDocument} = require("@bigfootds/supercamo");

module.exports = class User extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.rules = {
			name: {
				type: String,
				required: true
			},
			email: {
				type: String,
				required: true,
				unique: true
			},
			company: {
				type: String,
				required: true,
				default: "BigfootDS"
			},
			luckyNumber: {
				type: Number,
				required: false,
				default: () => {
					return Math.floor(Math.random() * 100) 
				}
			},
			assignedPokemonOne: {
				type: String,
				required: true,
				default: async () => {
					let pokemonNumber = Math.floor(Math.random() * 1025);
					let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
					let data = await response.json();
					return data.name;
				}
			},
			assignedPokemonTwo: {
				type: String,
				required: false,
				default: new Promise((resolve, reject) => {
					let pokemonNumber = Math.floor(Math.random() * 1025);
					fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`).then(response => response.json()).then((data) => {
						resolve(data.name);
					}).catch((error) => {
						// No reject() since we want this fallback data to be accepted if the fetch fails.
						resolve("pikachu");
					})
				})
			}
		};
	}
}
```

Some points of difference here, compared to the original Camo library:

- We do allow a document property to be both required **and** have a default value. So if no value is provided for `company` when making instances of the model shown above, it will not throw an error - it will just set the value to `"BigfootDS"` and move on.
- Whatever value `default` has must evaluate into a supported data type. This means that `default` can be a value, a function, an async function, or promise. 



### Instantiating a Database Client

Once you have a model created, you can create an instance of a database client.

Essentially, we must tell each database client instance which models they're allowed to use. We do this by specifying a key-value pair list of collections and their models.

```js
const {SuperCamo, CollectionListEntry} = require("@bigfootds/supercamo");

let exampleDb = await SuperCamo.connect(
	"SomeDatabaseName", 
	path.join(process.cwd(), "databases", "SomeDatabaseName"),
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Profiles", model: Profile},
		{name: "Config", model: Settings}
	]
);
```

As you can see in the code above, we can use a model in multiple collections in a single database.

Since these database client instances are entirely self contained, we can create more and more of them.

```js
const {SuperCamo, CollectionListEntry} = require("@bigfootds/supercamo");

let exampleDb = await SuperCamo.connect(
	"SomeDatabaseName", 
	path.join(process.cwd(), "databases"),
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Profiles", model: Profile},
		{name: "Config", model: Settings}
	]
);

let anotherDb = await SuperCamo.connect(
	"SomeOtherDatabaseName", 
	path.join(process.cwd(), "databases"),
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Profiles", model: Profile},
		{name: "Config", model: Settings}
	]
);
```

### Using a Database Client

Each database client has its own set of data, so any queries run from that client instance will only find its data. No crossover between database clients!

```js
let newUser = await exampleDb.insertOne("Users", {name:"Alex", email:"test@email.com"})
console.log(newUser.toString());

let newUsers = await anotherDb.insertMany("Users", [
	{name:"Not Alex", email:"test@email.com"},
	{name:"Definitely Not Alex", email:"test@email.com"},
	{name:"Could be Alex, but probably not", email:"test@email.com"},
]);
console.log(newUsers.toString());

```

We also provide a distinction between model instances and raw data objects. 
NeDB works in raw data objects.

```js
let foundUsers = await exampleDb.findManyDocuments("Users", {});
console.log(foundUsers);

let foundUsers2 = await anotherDb.findManyObjects("Users", {});
console.log(foundUsers2);
```

Raw data objects are good for simplifying API logic (eg. retrieve data, send it in the response, nothing more), but document instances make it easier to do more things with the retrieved data such as update and validate the content.

### SuperCamo static object

This package stores all database client instances on a static class. Clients exist during the code's runtime, and can be created via the `connect` static method on SuperCamo as well as disconnected or dropped too.

Basically, you should be able to create your database clients in File A and continue using them in File B solely through the `SuperCamo` import variable.

```js

const {SuperCamo} = require("@bigfootds/supercamo");

console.log(SuperCamo.clientList());

let dbInstance = SuperCamo.clientGet("SomeDatabaseName");

let foundUsers = await dbInstance.findManyDocuments("Users", {});
console.log(foundUsers);

```

### Document References

Documents can reference other documents. You would do this by defining a property in one document using the other document as a data type, like so:

```js
const {NedbDocument} = require("@bigfootds/supercamo");

class Profile extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.username = {
			type: String,
			required: true
		}

		this.user = {
			type: User,
			collection: "Users",
			required: true
		}

	}
}
```

Please note that you must specify the `collection` as well as the `type` when using a document reference.

You would then work with that data like so:

```js
let existingUser = await exampleDb.findOneDocument("Users", {email:"alex@bigfootds.com"});

let newProfile = await exampleDb.insertOne("Profiles", {
	username: "thebestalex", 
	user: existingUser._id,
});
```

When retrieving data, the query will not populate any data. Instead, you must manually call `.toPopulatedObject()` on a document instance.

```js
let existingProfile = await blogDb.findOneDocument("Profiles", {username: "thebestalex"});
let populatedData = await existingProfile.toPopulatedObject();
console.log(populatedData);
```

```js
{
  _id: 'UE5t6EzCDTB1f6Ss',
  username: 'thebestalex',
  user: {
    _id: 'lX2uQosLgGPdHpbU',
    name: 'Alex',
    email: 'alex@bigfootds.com',
    company: 'BigfootDS',
    luckyNumber: 11,
    assignedPokemonOne: 'magmortar',
    assignedPokemonTwo: 'dragonite'
  }
}
```


### Embedded Documents

Embedded documents (a.k.a "subdocuments") are a way to give a schema and validation to a set of properties. They're like Documents, but cannot exist on their own.

Create them like so:

```js
const {NedbEmbeddedDocument} = require("@bigfootds/supercamo");

class ProfileFlags extends NedbEmbeddedDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.banned = {
			type: Boolean,
			required: true,
			default: false
		}

		this.premium = {
			type: Boolean,
			required: true,
			default: false
		}
	}
}
```

You would then use them in another document's schema as if they were a data type, like so:

```js
const {NedbDocument} = require("@bigfootds/supercamo");

class Profile extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.username = {
			type: String,
			required: true
		}

		this.user = {
			type: User,
			collection: "Users",
			required: true
		}

		this.profileFlags = {
			type: ProfileFlags,
			required: false
		}
	}
}
```

When creating data where the document uses an embedded document, you should use an object matching the schema of the embedded document. Consider the code below:

```js
let newProfile = await blogDb.insertOne("Profiles", {
	username: "thebestalex", 
	user: existingUserId,
	profileFlags: {banned: false, premium: true}
});
```

Essentially, an embedded document is a validation tool. The data is still saved as an object in the database, and it's simplest to work with that data as an object in the current state of SuperCamo. But for things like `insertOne` as shown above, the validation of the ProfileFlags embedded document would run before saving the Profile document to the database.

```js
{
  _id: 'UE5t6EzCDTB1f6Ss',
  username: 'thebestalex',
  user: 'lX2uQosLgGPdHpbU',
  profileFlags: { banned: false, premium: true }
}
```


Document population is not tied to embedded document functionality at all - the above code snippet shows the embedded document data in full while the user ID is just an ID. The below code snippet shows the same profile flag data, as well as the populated user data. The embedded document data is fully present regardless of population settings.

```js
{
  _id: 'UE5t6EzCDTB1f6Ss',
  username: 'thebestalex',
  user: {
    _id: 'lX2uQosLgGPdHpbU',
    name: 'Alex',
    email: 'alex@bigfootds.com',
    company: 'BigfootDS',
    luckyNumber: 11,
    assignedPokemonOne: 'magmortar',
    assignedPokemonTwo: 'dragonite'
  },
  profileFlags: { banned: false, premium: true }
}
```

## Example Projects

Dig through these to see what else can be done with this library, and learn about how it's used in specific types of projects:

- [NodeJS terminal app](https://github.com/BigfootDS/supercamo-example-basic)
	- Uses SuperCamo v0.4.4
- ExpressJS server - NOT YET IMPLEMENTED
- ElectronJS app - NOT YET IMPLEMENTED

Those repositories are also used to dogfood this library - features needed for those projects will be prioritised. Check their readme files to see what is mapped out on each repository.


