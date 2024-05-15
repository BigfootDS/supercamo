import {NedbDocument, NedbClient} from "../src/structures/index.js";
import * as path from "node:path";

class User extends NedbDocument {
	constructor(){
		super();
	}

	
}

class Profile extends NedbDocument {
	constructor(){
		super();
	}
}

class Settings extends NedbDocument {
	constructor(){
		super();
	}
}






const settingsDb = new NedbClient(
	path.join(process.cwd(), ".sandbox", "Settings"), 
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Profiles", model: Profile},
		{name: "Config", model: Settings}
	]
);

let newUser = await settingsDb.insertOne("Users", {name: "Alex"})
let newUsers = await settingsDb.insertMany("Users", [{name: "Alex2"},{name: "Alex3"},{name: "Alex4"},])

let result1 = await settingsDb.findMany("Users", {});
console.log(result1);

let result2 = await settingsDb.removeDatabase();
console.log(result2);
console.log(settingsDb.collections.map((colObj) => colObj.name));

