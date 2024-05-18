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

- Built using NodeJS version 22, looking _forward_ only.
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
	constructor(data){
		super(data);

		this.name = {
			type: String,
			required: true
		}

		this.email = {
			type: String,
			required: true
		}
	}
}
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

## Example Projects

Dig through these to see what else can be done with this library, and learn about how it's used in specific types of projects:

- Simple ExpressJS server - NOT YET IMPLEMENTED
- Simple ElectronJS app - NOT YET IMPLEMENTED



