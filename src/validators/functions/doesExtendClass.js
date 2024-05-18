import {NedbBaseDocument, NedbClient, NedbDocument, NedbEmbeddedDocument} from "../../structures/index.js";


export const doesExtendBaseDocument = (childClass) => {
	return NedbDocument.isPrototypeOf(childClass);
}

export const doesExtendDocument = (childClass) => {
	return NedbBaseDocument.isPrototypeOf(childClass);
}

export const doesExtendEmbeddedDocument = (childClass) => {
	return NedbEmbeddedDocument.isPrototypeOf(childClass);
}


export const doesExtendNedbClient = (childClass) => {
	return NedbClient.isPrototypeOf(childClass);
}