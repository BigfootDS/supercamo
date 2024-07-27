import Nedb from "@seald-io/nedb";

export interface CollectionAccessor {
	
	/**
	 * Name of the collection.
	 * @author BigfootDS
	 */
	name: String,

	
	/**
	 * Reference to the NedbDocument-inheriting class used to define the collection's data structure.
	 * @author BigfootDS
	 */
	model: Object,

	
	/**
	 * Path to its ".db" NeDB file.
	 * @author BigfootDS
	 */
	path: String,

	
	/**
	 * Reference to the NeDB Datastore object for this collection.
	 * @author BigfootDS
	 */
	datastore: Nedb
}


