const {NedbBaseDocument, NedbDocument, NedbEmbeddedDocument} = require("../../structures/index.js");


const doesExtendBaseDocument = (childClass) => {
	return NedbBaseDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendDocument = (childClass) => {
	console.log("Checking NedbDocument require...")
	console.log(NedbDocument);
	return NedbDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendEmbeddedDocument = (childClass) => {
	return NedbEmbeddedDocument.prototype.isPrototypeOf(childClass);
}




module.exports = {
	doesExtendBaseDocument, doesExtendDocument, doesExtendEmbeddedDocument,
	
}