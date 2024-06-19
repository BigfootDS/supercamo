/** @module Internal */

const { getClassInheritanceList } = require("../validators/functions/ancestors");
const { isESClass } = require("../validators/functions/typeValidators");


/**
 * 
 * Process a list of key-value pairs (KVPs) to see which subdocuments are used the models contained in them.
 * @author BigfootDS
 * @ignore 
 * @param {[Object]} collectionsList Array of objects where each object contains a model and a name.
 * @returns {[Object]} Array of classes that inherit from NedbEmbeddedDocument.
 */
function parseCollectionsListForSubdocuments (collectionsList) {
    let result = [];

    collectionsList.forEach((kvp) => {
        let tempModelInstance = new kvp.model();
        let docKeys = Object.keys(tempModelInstance);
         
        for (const key of docKeys){
            let propertyIsArray = Array.isArray(tempModelInstance[key].type);
            let potentialClassRef = propertyIsArray ? tempModelInstance[key].type[0] : tempModelInstance[key].type;
            let classInheritanceList = [];
            try {
                classInheritanceList = getClassInheritanceList(potentialClassRef);
            } catch {
                classInheritanceList = [];
            }


            if (isESClass(potentialClassRef) && classInheritanceList.includes("NedbEmbeddedDocument")){
                result.push(potentialClassRef);
            }
        }
    })

    return [...new Set(result)];
}

module.exports = {
	parseCollectionsListForSubdocuments
}