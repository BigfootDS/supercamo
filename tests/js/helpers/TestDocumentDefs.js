const { NedbEmbeddedDocument, NedbDocument, SuperCamo } = require("../../../dist");

const {scrypt, timingSafeEqual, randomBytes} = require("node:crypto");

class Bio extends NedbEmbeddedDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			tagline: {
				type: String,
				required: true,
				unique: false
			},
			blurb: {
				type: String,
				required: true,
				unique: false
			}
		}
	}
}

class User extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			email: {
				type: String,
				required: true,
				unique: true
			},
			bio: {
				type: Bio,
				required: false
			}
		}		
	}
}

class UserWithPassword extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			email: {
				type: String,
				required: true,
				unique: true
			},
			bio: {
				type: Bio,
				required: false
			},
			password: {
				type: String,
				required: true,
				minLength: 8,
				invalidateOnMinMaxError: true
			}
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
				// console.log("Password encrypted!");
			}
		}
	}
}




/**
Needs properties for rules from: 
@see {@link "../../../src/structures/interfaces/DocumentKeyRuleInterface.ts"}
```ts
{
	type:  any,
	required?: boolean,
	collection?: string,
	unique?: boolean,
	default?: any,
	min?: number,
	max?: number,
	minLength?: number,
	maxLength?: number,
	invalidateOnMinMaxError?: boolean,
	padStringValue?: string,
	padArrayValue?: any,
	choices?: Array<any>
	match?: RegExp|string, 
	validate?: Function, 
}
	```
*/
class ValidationRuleTester extends NedbDocument {
	constructor(newData, newParentDatabaseName, newCollectionName){
		super(newData, newParentDatabaseName, newCollectionName);

		this.rules = {
			exampleRequiredNoDefault: {
				type: String,
				required: true
			}, 	
			exampleRequiredWithDefault: {
				type: String,
				required: true,
				default: "Hello, world!"
			}, 	
			exampleUnique: {
				type: String,
				required: true,
				default: (Math.random() * 10000).toString()
			}, 	
			exampleMinNumber: {
				type: Number,
				required: true,
				min: 10,
				invalidateOnMinMaxError: false
			}, 	
			exampleMaxNumber: {
				type: Number,
				required: true,
				max: 10,
				invalidateOnMinMaxError: false
			}, 	
			exampleMinNumberWithError: {
				type: Number,
				required: true,
				min: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleMaxNumberWithError: {
				type: Number,
				required: true,
				max: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleReferenceDoc: {
				type: User,
				collection: "Users",
				required: false
			}, 	
			exampleStringMinLength: {
				type: String,
				minLength: 10,
				invalidateOnMinMaxError: false,
				padStringValue: "a"
			}, 	
			exampleStringMinLengthWithError: {
				type: String,
				minLength: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleStringMaxLength: {
				type: String,
				maxLength: 10,
				invalidateOnMinMaxError: false
			}, 	
			exampleStringMaxLengthWithError: {
				type: String,
				maxLength: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleArrayMinLength: {
				type: [String],
				minLength: 10,
				invalidateOnMinMaxError: false,
				padArrayValue: "a"
			}, 	
			exampleArrayMinLengthWithError: {
				type: [String],
				minLength: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleArrayMaxLength: {
				type: [String],
				maxLength: 10,
				invalidateOnMinMaxError: false
			}, 	
			exampleArrayMaxLengthWithError: {
				type: [String],
				maxLength: 10,
				invalidateOnMinMaxError: true
			}, 	
			exampleValueInChoices: {
				type: String,
				choices: [
					"squirtle",
					"bulbasaur",
					"charmander"
				]
			}, 	
			exampleMatchRuleRegex: {
				type: String,
				match: /([A-Z])\w+/g // Matches if a word has a capital letter in it
			}, 	
			exampleValidateRule: {
				type: String,
				validate: (value) => {
					if (value == "Hello, world!") {
						return true;
					} else {
						return false;
					}
				}
			}
		}

		
	}
}

module.exports = {
	Bio, User, UserWithPassword, ValidationRuleTester
}