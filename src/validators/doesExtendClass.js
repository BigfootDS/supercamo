import BaseDocument from "../BaseDocument.js";
import Document from "../Document.js";
import EmbeddedDocument from "../EmbeddedDocument.js";
import NedbClient from "../NedbClient.js";


export const doesExtendBaseDocument = (childClass) => {
	return BaseDocument.isPrototypeOf(childClass);
}

export const doesExtendDocument = (childClass) => {
	return Document.isPrototypeOf(childClass);
}

export const doesExtendEmbeddedDocument = (childClass) => {
	return EmbeddedDocument.isPrototypeOf(childClass);
}


export const doesExtendNedbClient = (childClass) => {
	return NedbClient.isPrototypeOf(childClass);
}