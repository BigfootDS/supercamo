# @bigfootds/supercamo

Camo-inspired object data modeller (ODM) for NeDB, built specifically for BigfootDS' needs.

## The what

- NeDB compatibility
- Treat multiple NeDB datastores as a singular database
- Allow concurrent connections to multiple databases
- ODM-style wrapping around NeDB datastores
- Modern JavaScript implementations
- Leaning on standard NodeJS functions and APIs more than ever before

## The nitty-gritty

- Built using NodeJS version 22, looking _forward_ only.
- Built to depend on this particular flavour of NeDB:
	- [@seald-io/nedb](https://github.com/seald/nedb)

## The installation

Run this command:

```bash
npm install @bigfootds/supercamo
```

## The usage

This package is intended for usage in back-end JavaScript systems - anything that is built with _and runs on_ NodeJS, not the browser. Might work in the browser, but it is not supported by BigfootDS at all. We're more after ExpressJS server usage and ElectronJS "main" process usage.

### Concepts

SuperCamo is an object document manager (ODM) for NeDB. This means it's essentially a NoSQL database wrapper.

Since SuperCamo facilitates concurrent connections of multiple databases, it's got some fundamental differences in how it works compared to ye olde Camo and other NeDB-compatible ODMs.

Essentially:

- This library lets you create custom NedbClients.
- Each custom NedbClient that you create must include a list of Documents allowed to exist in that database client's database. 
	- EmbeddedDocuments do not need specifying, as they can only be used within Documents anyway.
- When performing queries on Documents, you must instead perform queries on a specific database client's reference to the Document. eg. no more `Document.findOne();`, but instead `SomeClient.Document.findOne();`.

### Code

Import the package like so:

```js
const SuperCamo = require("@bigfootds/supercamo");
```

## Example Projects

Dig through these to see what else can be done with this library, and learn about how it's used in specific types of projects:

- Simple ExpressJS server - NOT YET IMPLEMENTED
- Simple ElectronJS app - NOT YET IMPLEMENTED



