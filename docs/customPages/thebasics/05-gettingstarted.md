---
title: 05 - Getting Started

---

So, if you're ready to start coding with SuperCamo, this is the page for you!

This page will walk through installation, document declaration, database connection, and basic CRUD operations.

## Installation

Install this package as a production dependency using this command:

```bash
npm install @bigfootds/supercamo
```

## Usage

The general process of working with SuperCamo should be:

1. Declare your documents, as well as any needed embedded documents.
2. Use SuperCamo to connect to a database.
	- This requires a list of documents to have been declared, so this _must_ be step 2!
3. Use SuperCamo to retrieve a database client instance.
4. Use the database client instance to perform any and all database operations.

