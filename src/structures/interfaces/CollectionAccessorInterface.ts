/**
 * Metadata about a collection and its associated document model, to be used by a NedbClient during regular database client operations.
 * @author BigfootDS
 *
 * @module Interfaces
 * @category Reference
 * @interface
 */

import Nedb from "@seald-io/nedb";
import { NedbDocument } from "../classes/NedbDocument";


/**
 * Metadata about a collection and its associated document model, to be used by a NedbClient during regular database client operations.
 * @author BigfootDS
 *
 * @module Interfaces
 * @category Reference
 * @interface
 */
export interface CollectionAccessor {
	
	/**
	 * Name of the collection.
	 * @author BigfootDS
	 */
	name: string,

	
	/**
	 * Reference to the NedbDocument-inheriting class used to define the collection's data structure.
	 * @author BigfootDS
	 */
	model: typeof NedbDocument,

	
	/**
	 * Path to its ".db" NeDB file.
	 * @author BigfootDS
	 */
	path: string,

	
	/**
	 * Reference to the NeDB Datastore object for this collection.
	 * @author BigfootDS
	 */
	datastore: Nedb
}


