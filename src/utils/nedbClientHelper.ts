/** @module Internal */

import { getClassInheritanceList } from "../validators/functions/ancestors";
import { isESClass } from "../validators/functions/typeValidators";
import { CollectionsListEntry } from "../structures/interfaces/CollectionsListEntryInterface";
import { NedbEmbeddedDocument } from "../structures/NedbEmbeddedDocument";
import { NedbDocument } from "../structures/NedbDocument";



/**
 * 
 * Process a list of key-value pairs (KVPs) to see which subdocuments are used the models contained in them.
 * @author BigfootDS
 * @ignore 
 * @param {Array<CollectionsListEntry>} collectionsList Array of objects where each object contains a model and a name.
 */
export function parseCollectionsListForEmbeddeddocuments(collectionsList: Array<CollectionsListEntry>): typeof NedbEmbeddedDocument[] {
    let result: typeof NedbEmbeddedDocument[] = [];

    collectionsList.forEach((kvp: CollectionsListEntry) => {
        let tempModelInstance: NedbDocument = new kvp.model({}, null, null);
        let docKeys = Object.keys(tempModelInstance);
         
        for (const key of docKeys){
            // @ts-ignore
            let propertyIsArray = Array.isArray(tempModelInstance[key].type);
            // @ts-ignore
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
