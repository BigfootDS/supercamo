const BaseDocument = require("./NedbBaseDocument.js");


module.exports = class NedbEmbeddedDocument extends BaseDocument {
	constructor(incomingData){
		super(incomingData);
		
	}
}