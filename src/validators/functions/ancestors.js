const SuperCamo = require("../../SuperCamo.js");
const SuperCamoLogger = require("../../utils/logging");

/**
 * Gets the root-most class of a given class object.
 * Useful for tracking the base class of something when 
 * deeply-nested inheritance is in use.
 * 
 * Code comes from this StackOverflow answer written by "Resist Design":
 * https://stackoverflow.com/a/40393932
 * 
 * @author BigfootDS
 *
 * @param targetClass A class object. Not an instance, but the actual object declared with the `class` keyword.
 * @returns {class} The full class object of the root-most class in the inheritance tree of the provided targetClass.
 */
function getBaseClass(targetClass) {
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


function getClassInheritanceList(targetClass, registeredModelsList = []) {
	let classList = [];
	let localTargetClass = targetClass;

	let targetClassParent = Object.getPrototypeOf(localTargetClass);
	let constructorName = localTargetClass.constructor?.name;

	let activeModelList = registeredModelsList;
	SuperCamoLogger("Active models list:", "Validators");
	SuperCamoLogger(activeModelList, "Validators");
	// console.log(JSON.stringify(activeModelList, null, 4));
	let localClassRefArray = activeModelList.filter((model) => {
		SuperCamoLogger(model.name, "Validators");
		if (model.name === localTargetClass || model.name === constructorName){
			SuperCamoLogger(("Found matching model in filter:", model.name, localTargetClass, constructorName), "Validators");
			return model
		}
	});
	let localClassRef = localClassRefArray;
	SuperCamoLogger("Found matching model:", "Validators");
	SuperCamoLogger(localClassRef[0], "Validators");


	SuperCamoLogger(`Object prototype of ${localTargetClass} is ${targetClassParent}`, "Validators");
	SuperCamoLogger(`Constructor name of ${localTargetClass} is ${constructorName}`, "Validators");

	if (localClassRef[0]){
		SuperCamoLogger(typeof(localClassRef[0]), "Validators");
		SuperCamoLogger(localClassRef[0].name, "Validators");	
		classList.push(localClassRef[0].name);
		if (Object.getPrototypeOf(localClassRef[0]).name){
			// Recursive function, hell yeah
			let nestedParentName = getClassInheritanceList(localClassRef[0]);
			classList = [...classList, ...nestedParentName];
		}
		
	}

	return classList;
}

module.exports = {
	getBaseClass,
	getClassInheritanceList
}