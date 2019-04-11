import { Db } from "mongodb";
import { InventoryChangesObject } from "inventory_changes";
import { colors } from "./console_colors";
import { averageOf } from "./custom_math";

// Example of Mongo Usage

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const url = process.env.DB_HOST;
const connectionOptions = { useNewUrlParser: true };
const dbName = process.env.DB_NAME;

MongoClient.connect(
  url,
  connectionOptions,
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

function query(db: Db, callback) {
    const collection = db.collection('test')
    const query = {a:1}
    // See https://mongodb.github.io/node-mongodb-native/markdown-docs/queries.html
    // For Indexing (improved performance), see https://docs.mongodb.com/manual/indexes/
    collection.find(query).toArray((err, docs) => {})
}

// --------------------------------
// ---- DB Hooks ------------------
// --------------------------------

export function dbOnDelisted(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("delisted");

  const doc = {
    id: item.item_id,
    hash_name: item.market_hash_name,
    price: item.price,
    broadcasted_at: item.broadcasted_at
  };

  collection.insert(doc, callback(doc));
}

export function dbOnExtraInfo(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("extra_info");

  const doc = {
    item_id: item.item_id,
    asset_id: item.asset_id,
    extra_info: item.extra_info,
    sticker_info: item.sticker_info
  };

  collection.insert(doc, callback(doc));
}

export function dbOnPriceChanged(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("price_changed");

  const delta = (item.old_price - item.price).toFixed(2);

  const doc = {
    id: item.item_id,
    hash_name: item.market_hash_name,
    old_price: item.old_price,
    price: item.price,
    delta: delta,
    broadcasted_at: item.broadcasted_at
  };

  collection.insert(doc, callback(doc));
}

export async function dbOnListed(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("listed");
  const listing_stats = db.collection("listed_stats")

  const doc = {
    id: item.item_id,
    hash_name: item.market_hash_name,
    price: item.price,
    discount: item.discount,
    broadcasted_at: item.broadcasted_at
  };

  // if (isNaN(doc.price) || isNaN(doc.discount)) {
  //   console.log(colors.FgRed, 'PRICE IS NaN', colors.Reset)
  //   return;
  // }

  collection.insertOne(doc, callback(doc));
  let currentDoc = await listing_stats.findOne({ 'name': item.market_hash_name })

  // Initialize default statistics
  let stats = {
    'name': item.market_hash_name,
    'volume': 1,
    'avg': {
      'price': item.price,
      'discount': item.discount
    }
  }

  if (currentDoc) {
    // console.log(`existing volume ${currentDoc['volume']}`)
    let vol = currentDoc['volume'] + 1
    stats['volume'] = vol
    console.log(`new volume: ${stats['volume']}`)

    stats['avg']['price'] = averageOf(currentDoc['avg']['price'], vol, item.price)
    stats['avg']['discount'] = averageOf(currentDoc['avg']['discount'], vol, item.discount)

    console.log(colors.Dim,
      `Stats: {volume: ${stats.volume}, avg_price: ${stats.avg.price}, avg_discount: ${stats.avg.discount}}`,
      colors.Reset)

    // if (isNaN(stats.avg.price) || isNaN(stats.avg.discount)) {
    //   console.log(colors.FgRed, 'Stats PRICE IS NaN', colors.Reset)
    //   return;
    // }

    await listing_stats.updateOne(
      { 'name': item.market_hash_name }, // Filter
      {
        $set: {
          volume: stats.volume,
          avg: {
            price: stats.avg.price,
            discount: stats.avg.discount
          }
        }
      }, // Update data
      function () { } // Callback
    )

  } else {
    console.log(`New Hash Name!`)
    listing_stats.insertOne(stats)
  }
}

// ---- End DB Hooks ----
