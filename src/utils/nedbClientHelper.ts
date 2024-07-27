/** @module Internal */

import { getClassInheritanceList } from "../validators/functions/ancestors";
import { isESClass } from "../validators/functions/typeValidators";
import { CollectionsListEntry } from "../structures/interfaces/CollectionsListEntryInterface";
import { NedbEmbeddedDocument } from "../structures/NedbEmbeddedDocument";



/**
 * 
 * Process a list of key-value pairs (KVPs) to see which subdocuments are used the models contained in them.
 * @author BigfootDS
 * @ignore 
 * @param {Array<CollectionsListEntry>} collectionsList Array of objects where each object contains a model and a name.
 * @returns {Object[]} Array of classes that inherit from NedbEmbeddedDocument.
 */
function parseCollectionsListForSubdocuments (collectionsList: Array<CollectionsListEntry>) {
    let result: Array<Type extends NedbEmbeddedDocument> = [];

    collectionsList.forEach((kvp: CollectionsListEntry) => {
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