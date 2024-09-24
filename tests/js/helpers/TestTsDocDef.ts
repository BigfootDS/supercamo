import { NedbDocument } from "../../../dist";


export class User extends NedbDocument {
	constructor(newData: object, newParentDatabaseName: string, newCollectionName: string){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			email: {
				type: String,
				// CTRL+Space in this area shows all available KeyRule properties
				// Regular JS isn't working with this, but TypeScript works with this!
			}
		}
	}
}