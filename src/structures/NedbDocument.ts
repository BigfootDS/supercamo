import { NedbBaseDocument } from "./NedbBaseDocument";

/**
 * This is the class that you should use when making schemas or models for your own database documents.
 *
 * Inherit (extend) this class and add your properties to it, and that becomes your document.
 *
 * @author BigfootDS
 * @class
 * @extends {NedbBaseDocument}
 */
export class NedbDocument extends NedbBaseDocument {
	constructor(
		newData: object,
		newParentDatabaseName: string | null,
		newCollectionName: string | null
	) {
		super(newData, newParentDatabaseName, newCollectionName);
	}
}
