import { NedbDocument } from "../NedbDocument";



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
	model: Type extends NedbDocument ? Type : never
}