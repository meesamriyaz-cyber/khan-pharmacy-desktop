Place demo collection exports in this folder before building the installer.

Supported formats:
- collection-name.bson from mongodump
- collection-name.json from mongoexport, either JSON array or newline-delimited JSON

Each file name becomes the MongoDB collection name. For example:
- products.bson imports into the products collection
- categories.json imports into the categories collection

The packaged app imports these files only when the matching local collection is empty.
