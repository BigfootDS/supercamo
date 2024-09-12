
export class CollectionAccessError extends Error {
	constructor(collectionName: string){
		super(`Collection not found in the database client instance:\n\t${collectionName}`);
	}
}