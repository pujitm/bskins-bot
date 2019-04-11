require("dotenv").config();
import { expect } from "chai";
import "mocha";
import { Db } from "mongodb";
import { averageOf } from "../custom_math";
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const url = process.env.DB_HOST;
const connectionOptions = { useNewUrlParser: true };
const dbName = process.env.DB_NAME;

describe("mongo-connection", function() {
  it("should have no errors", async function() {
    MongoClient.connect(
      url,
      connectionOptions,
      async function(err, client) {
        assert.equal(null, err);
        // console.log("Connected successfully to server");
        const testName = "Test Name";

        const db = client.db(dbName);
        const listing_stats = db.collection("test_listed_stats");
        // await listing_stats.deleteMany({});

        try {

          let origItem = {
            name: testName,
            volume: 1,
            avg: {
              price: 2.5,
              discount: 0
            }
          }

          await listing_stats.insertOne(origItem);
          
          let doc = await listing_stats.findOne({ name: testName });
          expect(doc).to.not.be.equal(null);
  
          const newItem = {
            price: 2.5,
            discount: 0
          };
  
          // placeholder values
          let stat = {
            name: "a",
            volume: 1,
            avg: {
              price: 1.0,
              discount: 0
            }
          };

          stat.volume = doc["volume"] + 1;

          stat.avg.price = averageOf(
            doc["avg"]["price"],
            stat.volume,
            newItem.price
          );
          stat.avg.discount = averageOf(
            doc["avg"]["discount"],
            stat.volume,
            newItem.discount
          );

          expect(stat.volume).to.be.equal(2)
          expect(doc.name).to.be.equal(testName)
          expect(stat.avg.price).to.be.equal(2.5)
          expect(stat.avg.discount).to.be.equal(0)

          await listing_stats.updateOne(
            { name: testName }, // Filter
            {$set: {volume: 2}} // Update data
          );

          let doc1 = await listing_stats.findOne({ name: testName });
          expect(doc1["volume"]).to.be.equal(2);

          // Cleanup
          await listing_stats.deleteMany({});
        } catch (ex) {
          throw ex;
        }

        client.close();
      }
    );
  });

  it("average function should work", function() {
    let oldVol = 4;
    let newVol = 5;

    let oldAvg = 3;
    let expectedAvg = 4;

    let newPrice = 8;

    expect(averageOf(oldAvg, newVol, newPrice)).to.be.equal(expectedAvg);
  });
});