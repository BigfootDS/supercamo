import Nedb from "@seald-io/nedb";
import { CollectionAccessor as ICollectionAccessor } from "../interfaces/CollectionAccessorInterface";
import { NedbDocument } from "./NedbDocument";

export class CollectionAccessor implements ICollectionAccessor {
	name: string;
	model: typeof NedbDocument;
	path: string;
	datastore: Nedb;
	
	constructor(name: string, model: typeof NedbDocument, path: string, datastore: Nedb){
		this.name = name;
		this.model = model;
		this.path = path;
		this.datastore = datastore;
	}
}