// import SuperCamo from "../src/index.js";

import NedbClient from "../src/NedbClient.js";
import SuperCamo from "../src/index.js";

class CustomClient extends NedbClient{
	constructor(url){
		super(url);
		this.url = this._url;
	}

	someFunction = () => {
		console.log("blah");
	}
}

class GrandchildClient extends CustomClient {
	constructor(url){
		super(url);
	}

	someFunction = () => {
		console.log("grandchild!");
	}
}

async function testo(){
	
	/**
	 * @type CustomClient
	 */
	let customClientInstance = await SuperCamo.connect(GrandchildClient, "someName", "./elephants");
	// console.log(customClientInstance);
	// console.log(SuperCamo.connect(CustomClient, "someName", "./elephants"));
	console.log(SuperCamo.activeClients.someName);
	customClientInstance.someFunction();
}

testo();