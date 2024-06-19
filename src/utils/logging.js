const util = require("node:util");

const log = {
	verbose: util.debuglog("verbose"),
	superCamo: util.debuglog("supercamo"),
	superCamoRoot: util.debuglog("supercamo:root"),
	superCamoDocument: util.debuglog("supercamo:document"),
	superCamoEmbeddedDocument: util.debuglog("supercamo:embeddeddocument"),
	superCamoBaseDocument: util.debuglog("supercamo:basedocument"),
	superCamoClient: util.debuglog("supercamo:client"),
	superCamoValidators: util.debuglog("supercamo:validators"),

}

log.verbose("Starting SuperCamo with verbose logging enabled.");
log.superCamo("Starting SuperCamo with SuperCamo-specific verbose logging enabled.");
log.superCamoRoot("Starting SuperCamo with SuperCamo root SuperCamo class-specific verbose logging enabled.");
log.superCamoDocument("Starting SuperCamo with SuperCamo 'Document-specific verbose logging enabled.");
log.superCamoEmbeddedDocument("Starting SuperCamo with SuperCamo 'Embedded Document'-specific verbose logging enabled.");
log.superCamoBaseDocument("Starting SuperCamo with SuperCamo 'Base Document'-specific verbose logging enabled.");
log.superCamoClient("Starting SuperCamo with SuperCamo client-specific verbose logging enabled.");
log.superCamoValidators("Starting SuperCamo with SuperCamo validator-specific verbose logging enabled.");


/**
 * Configured logging system for the SuperCamo package.
 * 
 * Pass a string to this, and it'll automatically figure out which NodeJS util.DebugLogger to use.
 * 
 * This is not something for users of the SuperCamo package to directly use. Instead, this is something impacted by usage of the NODE_DEBUG environment variable.
 * 
 * For example, if you want logging from multiple packages, including SuperCamo, you may want to set NODE_DEBUG to be or include "verbose". This would enable multiple packages to log.
 * But if you only want SuperCamo to log, and not any other packages, you may want to set NODE_DEBUG to be or include "supercamo".
 * 
 * @example
 * Running your app with this command would enable logging for anything that uses "verbose" in its util logger:
 * ```bash
 * NODE_DEBUG=verbose node ./index.js	
 * ```
 * 
 * @example
 * Running your app with this command would enable logging for just SuperCamo, NodeJS "fs", and NodeJS "network" libraries:
 * ```bash
 * NODE_DEBUG=supercamo,fs,network node ./index.js
 * ```
 * 
 * @author BigfootDS
 *
 * @param {String} message The string to log.
 * @param {("Client"|"BaseDocument"|"Document"|"EmbeddedDocument"|"Validators"|"Root"|"")} caller Specific string to help with conditional logging, eg. "Client" to allow the SuperCamoClient logger to log. Defaults to "", which will allow the SuperCamo catch-all logger and Verbose generic logger to log.
 */
function SuperCamoLogger(message, caller = "") {
	
	if (log.superCamo.enabled){
		log.superCamo(message);
	} else if (log.verbose.enabled){
		log.verbose(message);
	} else {
		switch (caller) {
			case "Root":
				log.superCamoRoot(message);
				break;
			case "Client":
				log.superCamoClient(message);
				break;
			case "BaseDocument":
				log.superCamoBaseDocument(message);
				break;
			case "Document":
				log.superCamoDocument(message);
				break;
			case "EmbeddedDocument":
				log.superCamoEmbeddedDocument(message);
				break;
			case "Validators":
				log.superCamoValidators(message);
				break;
			default:
				break;
		}
	}
}

module.exports = SuperCamoLogger;