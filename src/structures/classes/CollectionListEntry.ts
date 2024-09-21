import { CollectionsListEntry } from "../interfaces/CollectionsListEntryInterface";
import { NedbDocument } from "./NedbDocument";


export class CollectionListEntry implements CollectionsListEntry {
	name: string;
	model: typeof NedbDocument;

	constructor(name: string, model: typeof NedbDocument){
		this.name = name;
		this.model = model;
	}
	
}