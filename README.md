# @bigfootds/supercamo

Camo-inspired object data modeller (ODM) for NeDB, built specifically for BigfootDS' needs.

## The what

- NeDB compatibility
- Treat multiple NeDB datastores as a singular database
- Allow concurrent connections to multiple databases
- ODM-style wrapping around NeDB datastores
- Modern JavaScript implementations
- Leaning on standard NodeJS functions and APIs more than ever before

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

This package is intended for usage in back-end JavaScript systems - anything that is built with _and runs on_ NodeJS, not the browser. Might work in the browser, but it is not supported by BigfootDS at all. We're more after ExpressJS server usage and ElectronJS "main" process usage.

### Concepts

SuperCamo is an object document manager (ODM) for NeDB. This means it's essentially a NoSQL database wrapper.

Since SuperCamo facilitates concurrent connections of multiple databases, it's got some fundamental differences in how it works compared to ye olde Camo and other NeDB-compatible ODMs.

Essentially:

- This library lets you create custom NedbClients.
- Each custom NedbClient that you create must include a list of Documents allowed to exist in that database client's database. 
	- EmbeddedDocuments do not need specifying, as they can only be used within Documents anyway.
- When performing queries on Documents, you must instead perform queries on a specific database client's reference to the Document. eg. no more `Document.findOne();`, but instead `SomeClient.findOne("CollectionName", query);`.

### Declare Your Models

First, you should create some models or documents.

```js
const {NedbDocument} = require("@bigfootds/supercamo");

module.exports = class User extends NedbDocument {
	constructor(data, databaseName, collectionName){
		super(data, databaseName, collectionName);

		this.name = {
			type: String,
			required: true
		}

		this.email = {
			type: String,
			required: true
		}

		this.company = {
			type: String,
			required: true,
			default: "BigfootDS"
		}

		this.luckyNumber = {
			type: Number,
			required: false,
			default: () => {
				return Math.floor(Math.random() * 100) 
			}
		}

		this.assignedPokemonOne = {
			type: String,
			required: true,
			default: async () => {
				let pokemonNumber = Math.floor(Math.random() * 1025);
				let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
				let data = await response.json();
				return data.name;
			}
		}

		this.assignedPokemonTwo = {
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
	}
}
```

Some points of difference here, compared to the original Camo library:

- We do allow a document property to be both required **and** have a default value. So if no value is provided for `company` when making instances of the model shown above, it will not throw an error - it will just set the value to `"BigfootDS"` and move on.
- Whatever value `default` has must evaluate into a supported data type. This means that `default` can be a value, a function, an async function, or promise. 

```
HEY!

We're still working on this package. Pretty sure Document references and EmbeddedDocuments do nothing right now, as we haven't touched those yet. This package will actively change a lot in 2024!
```


### Instantiating a Database Client

Once you have a model created, you can create an instance of a database client.

Essentially, we must tell each database client instance which models they're allowed to use. We do this by specifying a key-value pair list of collections and their models.

```js
const SuperCamo = require("@bigfootds/supercamo");

let exampleDb = await SuperCamo.connect(
	"SomeDatabaseName", 
	path.join(process.cwd(), "databases"),
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Profiles", model: Profile},
		{name: "Config", model: Settings}
	],
	[
		// Any embedded documents that your database client's documents use must be listed here
		// eg. if an embedded document exists that is declared as "class LocalizedContent extends NedbEmbeddedDocument {}",
		// then this array should include:
		// LocalizedContent
	]
);
```

As you can see in the code above, we can use a model in multiple collections in a single database.

Since these database client instances are entirely self contained, we can create more and more of them.

```js
const SuperCamo = require("@bigfootds/supercamo");

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

const SuperCamo = require("@bigfootds/supercamo");

console.log(SuperCamo.getClientList());

let dbInstance = SuperCamo.getClientByName("SomeDatabaseName");

let foundUsers = await dbInstance.findManyDocuments("Users", {});
console.log(foundUsers);

```

### Document References

Documents can reference other documents. You would do this by definind a property in one document using the other document as a data type, like so:

```js
class Profile extends SuperCamo.NedbDocument {
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
let existingUserData = await existingUser.getData();
let existingUserId = existingUserData._id;
let newProfile = await exampleDb.insertOne("Profiles", {
	username: "thebestalex", 
	user: existingUserId,
});
```

When retrieving data, the query will populate all referenced documents by default.

```js
let existingProfile = await blogDb.findOneDocument("Profiles", {username: "thebestalex"});
console.log(await existingProfile.getData());
```

```bash
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

You can prevent document population by passing `false` to the `getData()` method:

```js
let existingProfile = await blogDb.findOneDocument("Profiles", {username: "thebestalex"});
console.log(await existingProfile.getData(false));
```

```bash
{
  _id: 'UE5t6EzCDTB1f6Ss',
  username: 'thebestalex',
  user: 'lX2uQosLgGPdHpbU',
}
```


### Embedded Documents

Embedded documents (a.k.a "subdocuments") are a way to give a schema and validation to a set of properties. They're like Documents, but cannot exist on their own.

Create them like so:

```js
class ProfileFlags extends SuperCamo.NedbEmbeddedDocument {
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
class Profile extends SuperCamo.NedbDocument {
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

You need to use the `create()` method of an Embedded Document when inserting or modifying data in a parent document:

```js
let newProfile = await blogDb.insertOne("Profiles", {
	username: "thebestalex", 
	user: existingUserId,
	profileFlags: await ProfileFlags.create({banned: false, premium: true})
});
```

Embedded documents are converted to objects internally most of the time - this is still WIP, but basically:
- when validating, the data for a property that uses an Embedded Document should be an Embedded Document instance, so that it can run its own hooks & validations & so on.
- in all other situations, the data for a property that uses an Embedded Document should be a JavaScript object.
The package may or may not work this way right now, this part is still under development.

Embedded documents are not impacted by populate settings.

```bash
{
  _id: 'UE5t6EzCDTB1f6Ss',
  username: 'thebestalex',
  user: 'lX2uQosLgGPdHpbU',
  profileFlags: { banned: false, premium: true }
}
```

```bash
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

- Simple ExpressJS server - NOT YET IMPLEMENTED
- Simple ElectronJS app - NOT YET IMPLEMENTED



