/**
 * Metadata about NeDB clients in use within SuperCamo.
 * @author BigfootDS
 * @module Interfaces
 * @category Reference
 * @interface
 */

import { NedbDocument } from "../classes/NedbDocument"
import { NedbEmbeddedDocument } from "../classes/NedbEmbeddedDocument"
import { CollectionAccessor } from "./CollectionAccessorInterface"


/**
 * Metadata about NeDB clients in use within SuperCamo.
 * @author BigfootDS
 * @module Interfaces
 * @category Reference
 * @interface
 */
export interface NedbClientEntry {
	
	/**
	 * Human-friendly name to identify the database when an app using SuperCamo is using multiple NeDB database connections simultaneously.
	 * @author BigfootDS
	 */
	name: string,

	
	/**
	 * The absolute file path to the folder that represents this NeDB client. Its collections are individual NeDB datastore files contained within this folder.
	 * @author BigfootDS
	 */
	path: string

	
	/**
	 * Array of collections used by this NeDB client. This is essentially where you track what models and collections are used in this particular database.
	 * @author BigfootDS
	 */
	collections: Array<CollectionAccessor>

	
	/**
	 * Array of documents used by the collections within this NeDB client. This should be a smaller array than the collections, since multiple collections could be using the same document.
	 * @author BigfootDS
	 */
	documents: typeof NedbDocument[],

	
	/**
	 * Array of subdocuments or embedded documents used by the documents within the collections of this NeDB client.
	 * @author BigfootDS
	 */
	embeddedDocuments: typeof NedbEmbeddedDocument[]
}