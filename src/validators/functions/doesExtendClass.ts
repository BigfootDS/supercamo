/** @module Internal */





import { NedbBaseDocument } from "../../structures/types/NedbBaseDocument";
import { NedbDocument } from "../../structures/types/NedbDocument";
import { NedbEmbeddedDocument } from "../../structures/types/NedbEmbeddedDocument";
import { SuperCamoLogger } from "../../utils/logging";


const doesExtendBaseDocument = (childClass: any) => {
	return NedbBaseDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendDocument = (childClass: any) => {
	SuperCamoLogger("Checking NedbDocument require...", "Validators")
	SuperCamoLogger(childClass, "Validators");
	return NedbDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendEmbeddedDocument = (childClass: any) => {
	return NedbEmbeddedDocument.prototype.isPrototypeOf(childClass);
}




module.exports = {
	doesExtendBaseDocument, doesExtendDocument, doesExtendEmbeddedDocument,
	
}