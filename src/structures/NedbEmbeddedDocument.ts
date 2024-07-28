import { NedbBaseDocument } from "./NedbBaseDocument";

/**
 * This is the class that you should use when making schemas or models for your own database subdocuments or embedded documents.
 *
 * Inherit (extend) this class and add your properties to it, and that becomes your embedded document.
 *
 * @author BigfootDS
 *
 * @class
 * @extends {NedbBaseDocument}
 */
export class NedbEmbeddedDocument extends NedbBaseDocument {
	constructor(
		newData: object,
		newParentDatabaseName: string | null,
		newCollectionName: string | null
	) {
		super(newData, newParentDatabaseName, newCollectionName);
	}
}
