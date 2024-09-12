const { NedbEmbeddedDocument, NedbDocument, SuperCamo } = require("../../../dist");

const {scrypt, timingSafeEqual, randomBytes} = require("node:crypto");

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

	static encryptionKeyLength = 64;
	
	
	/**
	 * Zero-dependency password hashing.
	 * 
	 * Code based on comments and article content from this article:
	 * 
	 * [https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e](https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k)
	 * @author BigfootDS
	 *
	 * @static
	 * @async
	 * @param {string} password Raw, unencrypted and vulnerable password. eg. "Password1"
	 * @returns {Promise<string>}
	 */
	static async hashPassword(password) {
		let result = await new Promise((resolve, reject) => {
			const salt = randomBytes(16).toString("hex");
	
			scrypt(password, salt, UserWithPassword.encryptionKeyLength, (err, derivedKey) => {
				if (err) reject(err);
				resolve(`${salt}:${derivedKey.toString('hex')}`);
			});
		});
		return result;
	}
	
	
	/**
	 * Zero-dependency password verification.
	 * 
	 * Code based on comments and article content from this article:
	 * 
	 * [https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e](https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k)
	 * @author BigfootDS
	 *
	 * @static
	 * @async
	 * @param {string} password Raw, unencrypted and vulnerable password. eg. "Password1"
	 * @param {string} hash Previously-hashed and salted password.
	 * @returns {boolean}
	 */
	static async verifyPassword(password, hash) {
		return new Promise((resolve, reject) => {
			const [salt, key] = hash.split(":");
			const keyAsBuffer = Buffer.from(key, "hex");

			scrypt(password, salt, UserWithPassword.encryptionKeyLength, (err, derivedKey) => {
				if (err) reject(err);
				resolve(timingSafeEqual(keyAsBuffer, derivedKey));
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