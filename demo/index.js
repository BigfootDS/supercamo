import Document from "../src/Document.js";
import NedbClient from "../src/NedbClient.js";
import * as path from "node:path";

class User extends Document {
	constructor(){
		super();
	}

	
}

class Profile extends Document {
	constructor(){
		super();
	}
}

class Settings extends Document {
	constructor(){
		super();
	}
}






const settingsDb = new NedbClient(
	path.join(process.cwd(), ".sandbox", "Settings"), 
	[
		{name: "Users", model: User}, 
		{name: "Admins", model: User}, 
		{name: "Config", model: Settings}
	]
);

let result1 = await settingsDb.findOne("Users", {});
let result2 = await settingsDb.findOne("Admins", {});
// console.log(settingsDb);
console.log(result1, result2);
console.log(settingsDb);
await settingsDb.dropDatabase();
console.log(settingsDb);

