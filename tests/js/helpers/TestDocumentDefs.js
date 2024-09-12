const { NedbEmbeddedDocument, NedbDocument, SuperCamo } = require("../../../dist");

const {scryptSync} = require("node:crypto");

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

class UserWithPassword extends NedbDocument {
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

		this.password = {
			type: String,
			required: true
		}
	}

	static async hashPassword(password) {
		return new Promise((resolve, reject) => {
			const salt = crypto.randomBytes(8).toString("hex")
	
			crypto.scrypt(password, salt, 64, (err, derivedKey) => {
				if (err) reject(err);
				resolve(salt + ":" + derivedKey.toString('hex'))
			});
		})
	}
	
	static async verifyPassword(password, hash) {
		return new Promise((resolve, reject) => {
			const [salt, key] = hash.split(":")
			crypto.scrypt(password, salt, 64, (err, derivedKey) => {
				if (err) reject(err);
				resolve(key == derivedKey.toString('hex'))
			});
		})
	}

	async preSave(){
		if (this.data._id){
			let existingDbData = await SuperCamo.clientGet(this.parentDatabaseName).findOneObject(this.collectionName, {_id: this.data._id});
			if (existingDbData?.password != this.data.password){
				// Password was modified, should re-encrypt it!
				this.data.password = await UserWithPassword.hashPassword(this.data.password);
				console.log("Password encrypted!");
			}
		}
	}
}

module.exports = {
	Bio, User, UserWithPassword
}