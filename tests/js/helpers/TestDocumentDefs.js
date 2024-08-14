const { NedbEmbeddedDocument, NedbDocument } = require("../../../dist");

class Bio extends NedbEmbeddedDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.tagline = {
			type: String,
			required: true,
			unique: false
		}

		this.blurb = {
			type: String,
			required: true,
			unique: false
		}
	}
}

class User extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.email = {
			type: String,
			required: true,
			unique: true
		}

		this.bio = {
			type: Bio,
			required: false
		}
	}
}

module.exports = {
	Bio, User
}