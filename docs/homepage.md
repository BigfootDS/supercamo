# SuperCamo

SuperCamo is a Camo-inspired object data modeller (ODM) for NeDB, built specifically for BigfootDS' needs.

This package was inspired by Scott Robinson's [Camo](https://github.com/scottwrobinson/camo) ODM - but BigfootDS had some specific needs and an urge to try out TypeScript. We greatly appreciate what Camo is and does!

## The URLs

- [NPM package](https://www.npmjs.com/package/@bigfootds/supercamo)
- [GitHub repository](https://github.com/BigfootDS/supercamo)
- [Documentation website](https://bigfootds.github.io/supercamo/)

## Where To Start

Please have a look at the Guides section of the documentation website!

This package is made to facilitate the use of a local, embedded NoSQL database called "NeDB". So it still has Documents and Subdocuments/EmbeddedDocuments at its core - but there are some other nice things introduced in this package that do impact the usage of those features and functionalities.

The documentation website contains really handy resources:

- [Quick Start](./documents/Quick_Start.html)
- [Package Concept Walkthroughs](./documents/The_Basics.html)

## API Reference

Reference documentation for this package lives over here:

- [The "Reference" section of the documentation website](./modules/Classes.html)

## Example Projects

This package contains a heap of test code, so you may want to dig into the `tests/` directory to see how specific operations are done within this package.

Alternatively, you can dig through these projects to see practical usage of this package, and learn about how it's used in specific types of projects:

- [NodeJS terminal app](https://github.com/BigfootDS/supercamo-example-basic)
	- Uses SuperCamo v0.4.4
- ExpressJS server - NOT YET IMPLEMENTED
- ElectronJS app - NOT YET IMPLEMENTED

Those repositories are also used to dogfood this library - features needed for those projects will be prioritised. Check their readme files to see what is mapped out on each repository.


