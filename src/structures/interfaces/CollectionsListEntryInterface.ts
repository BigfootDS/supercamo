/**
 * Metadata about a collection and its associated document model, to be used by a NedbClient during initial database connection.
 * @author BigfootDS
 *
 * @module Interfaces
 * @category Reference
 * @interface
 */

import { NedbDocument } from "../classes/NedbDocument";



/**
 * Metadata about a collection and its associated document model, to be used by a NedbClient during initial database connection.
 * @author BigfootDS
 *
 * @module Interfaces
 * @category Reference
 * @interface
 */
export interface CollectionsListEntry {

	
	/**
	 * Name of the collection.
	 * @author BigfootDS
	 */
	name: string,

	
	/**
	 * Reference to the NedbDocument-inheriting class used to define the collection's data structure.
	 * @author BigfootDS
	 */
	model: typeof NedbDocument 
}