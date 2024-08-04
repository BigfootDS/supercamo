import Nedb from "@seald-io/nedb";
import { NedbDocument } from "../types/NedbDocument";

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


