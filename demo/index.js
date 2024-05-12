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

async function testo(){
	
	/**
	 * @type CustomClient
	 */
	let customClientInstance = await SuperCamo.connect(CustomClient, "someName", "./elephants");
	// console.log(customClientInstance);
	// console.log(SuperCamo.connect(CustomClient, "someName", "./elephants"));
	console.log(SuperCamo.activeClients.someName);
	customClientInstance.someFunction();
}

testo();