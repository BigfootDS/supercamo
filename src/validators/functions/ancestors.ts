/** @module Internal
  * @ignore 
 */


/**
 * Gets the root-most class of a given class object.
 * Useful for tracking the base class of something when 
 * deeply-nested inheritance is in use.
 * 
 * Code comes from this StackOverflow answer written by "Resist Design":
 * https://stackoverflow.com/a/40393932
 * 
 * @author BigfootDS
 * @ignore 
 * @param targetClass A class object. Not an instance, but the actual object declared with the `class` keyword.
 * @returns {class} The full class object of the root-most class in the inheritance tree of the provided targetClass.
 */
export function getBaseClass(targetClass: any): any {
	if (targetClass instanceof Function) {
		let baseClass = targetClass;

		while (baseClass) {
			const newBaseClass = Object.getPrototypeOf(baseClass);

			if (newBaseClass && newBaseClass !== Object && newBaseClass.name) {
				baseClass = newBaseClass;
			} else {
				break;
			}
		}

		return baseClass;
	}
}


export function getClassInheritanceList(targetClass: any): any {
	let classList = [];

	let targetClassParent = Object.getPrototypeOf(targetClass);
	if (targetClassParent){
		classList.push(targetClassParent.name);
		if (Object.getPrototypeOf(targetClassParent).name){
			// Recursive function, hell yeah
			let nestedParentName = getClassInheritanceList(targetClassParent);
			classList = [...classList, ...nestedParentName];
		}
		
	}

	return classList;
}
