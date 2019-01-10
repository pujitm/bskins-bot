const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const url = process.env.DB_HOST;
const connectionOptions = { useNewUrlParser: true };
const dbName = process.env.DB_NAME;

MongoClient.connect(
  url,
  function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    // insertTestDocuments(db, () => null);
    // findDocuments(db, () => null);

    client.close();
  }
);

const insertTestDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection("test");
  // Insert some documents
  collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
};

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection("test");
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
};
