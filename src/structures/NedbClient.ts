import path from "node:path";
import { CollectionAccessor } from "./interfaces/CollectionAccessorInterface";
import { CollectionsListEntry } from "./interfaces/CollectionsListEntryInterface";
import { NedbClientEntry } from "./interfaces/NedbClientEntryInterface";
import { NedbDocument } from "./NedbDocument";
import { NedbEmbeddedDocument } from "./NedbEmbeddedDocument";
import {default as Datastore} from "@seald-io/nedb";


export class NedbClient implements NedbClientEntry {
	name: string;
	path: string;
	collections: CollectionAccessor[];
	documents: NedbDocument[];
	embeddedDocuments: NedbEmbeddedDocument[];
	
	constructor(dbDirectoryPath: string, dbName: string, collectionsList: Array<CollectionsListEntry>){
		this.name = dbName;
		this.path = dbDirectoryPath;

		this.collections = collectionsList.map((kvp) => {
			return this.createCollection(kvp.model, kvp.name);
		})

		this.documents = [...new Set(collectionsList.map((kvp) => {
			return kvp.model;
		}))];

		this.embeddedDocuments = parseCollectionsListForEmbeddedDocuments(collectionsList);
	}



	createCollection = (model: NedbDocument, name: string) => {
        let newCollectionPath = path.join(this.path, name, ".db");
        let newCollectionObj = {
            model: model,
            name: name,
            path: newCollectionPath,
            datastore: new Datastore({filename: newCollectionPath, autoload: true})
        };

        if (this.collections.some(collectionObj => collectionObj.name == newCollectionObj.name)){
            throw new Error("Collection already exists in the database client, will not make duplicate datastores: " + newCollectionObj.name + "\n\tWe currently have these collections in the database client: " + this.collections.map((collectionObj => collectionObj.name)));
        } else {
            this.collections.push(newCollectionObj);
        }
            
        // Return an object to stick into collections, containing info about the specific collection based on the given model.
        return newCollectionObj;
    }
}