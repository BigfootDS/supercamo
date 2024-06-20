The database client is the main way that you should be interacting with the database in this package.

### Instantiating a Database Client

To work with data based on the documents that you've defined, you must create an instance of a database client.

Essentially, we must tell each database client instance which documents (a.k.a models) they're allowed to use. We do this by specifying a key-value pair list of collections and their models.

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
	{name:"Definitely Not Alex", email:"test2@email.com"},
	{name:"Could be Alex, but probably not", email:"test3@email.com"},
]);
console.log(newUsers.toString());

```