require('dotenv').config();
import { expect } from "chai";
import "mocha";
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const url = process.env.DB_HOST;
const connectionOptions = { useNewUrlParser: true };
const dbName = process.env.DB_NAME;

describe("mongo-connection", function() {
  it("should have no errors", function(done) {
    MongoClient.connect(
      url,
      connectionOptions,
      function(err, client) {
        assert.equal(null, err);
        // console.log("Connected successfully to server");

        // const db = client.db(dbName);

        client.close();
        done();
      }
    );
  });

});
