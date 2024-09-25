---
title: 01 - The SuperCamo Singleton

---

This package is all about making it easier to manage multiple NeDB database connections within a single app's lifetime. The SuperCamo singleton is how that happens.

Essentially, you should connect to a database via the SuperCamo singleton. The `SuperCamo.connect()` function returns a reference to the database client instance, and that same instance can be retrieved again in any file that uses the SuperCamo singleton too.

This means that when your app runs, you should follow this process:

1. Your app starts running in its entry-point file, such as `index.js`. 
2. When `index.js` runs, it calls `SuperCamo.connect()` with appropriate arguments given to the function's parameters.

```js
async function connect(){
	// Connect to the database
	databaseInstance = await SuperCamo.connect(
		"BasicExampleDatabase", 
		path.join(process.cwd(), ".sandbox" , "databases"),
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

3. At some other point during the app's runtime, some other function from some other file is required and executes its code. This could be an ExpressJS route living in `./src/controllers/CoolRouter.js`, as an example. This code would import SuperCamo and call a function like `SuperCamo.getClientList()` or `SuperCamo.getClientByName()` with appropriate arguments and store the result: a NeDB database client instance.

```js
const SuperCamo = require("@bigfootds/supercamo");
const databaseInstance = SuperCamo.getClientByName("BasicExampleDatabase");
```

4. Continuing with the ExpressJS example, the file would then use its local reference to the NeDB database client instance to perform any database operations.


```js
const SuperCamo = require("@bigfootds/supercamo");
const databaseInstance = SuperCamo.getClientByName("BasicExampleDatabase");

router.get("/all", async (request, response) => {
	let availableArticles = await databaseInstance.findManyObjects("Articles", {});

	response.json(availableArticles);
});
```
