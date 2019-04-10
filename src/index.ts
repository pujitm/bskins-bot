require("dotenv").config(); // Should be first line application; loads environment variables
import * as BitSkins from "bitskins";
import { InventoryChangesObject } from "inventory_changes";
import { ConsoleColors } from "./console_colors"; // Needs currentDoc relative import; I'm not sure why.
import { Db, Double } from "mongodb";
import {blacklistedSkins} from "blacklist";

// ---- Configuration ----

/**
 * See https://github.com/Rob--/bitskins#api for documentation
 */
const api = new BitSkins.API(process.env.API_KEY, process.env.API_SECRET);

/**
 * See https://github.com/Rob--/bitskins#web-sockets for documentation
 */
const socket = new BitSkins.WebSocket();

/**
 * See `ConsoleColors` import for documentation
 */
const colors = new ConsoleColors();

const MongoClient = require("mongodb").MongoClient;

const usingDockerFlag = process.env.USING_DOCKER;

let url;

if (usingDockerFlag) {
  url = process.env.DB_HOST;
} else {
  url = process.env.LOCAL_DB_HOST;
}

const connectionOptions = { useNewUrlParser: true };
const dbName = process.env.DB_NAME;

const channel = {
  connected: "connected",
  listed: "inventory_changes:listed",
  delisted: "inventory_changes:delisted_or_sold",
  price_changed: "inventory_changes:price_changed",
  extra_info: "inventory_changes:extra_info",
  disconnected: "disconnected"
};

const CSGO_APP_ID = 730

// ---- End Configuration ----

MongoClient.connect(
  url,
  connectionOptions,
  function(err, client) {

    if (err) {
      console.log(err);
      console.log('Exiting ...');
      return;
      
    }

    console.log("Connected successfully to database server");

    const db = client.db(dbName);

    socket.on(channel.connected, () => {
      console.log("connected to bitskins websocket");
    });

    socket.on(channel.listed, (item: InventoryChangesObject) => {
      if (item.app_id == CSGO_APP_ID) {
        dbOnListed(db, item, doc => {
          console.log(colors.FgGreen, "Item Listed!", colors.Reset);
          console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
          console.log(
            colors.Bright,
            `${item.market_hash_name}\n$ ${item.price}`,
            colors.Reset
          );
        });
      }
    });

    socket.on(channel.delisted, (item: InventoryChangesObject) => {
      if (item.app_id == CSGO_APP_ID) {
        dbOnDelisted(db, item, doc => {
          console.log(colors.FgRed, "Item Delisted or Sold!", colors.Reset);
          console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
          console.log(
            colors.Bright,
            `${item.market_hash_name}\n$ ${item.price}`,
            colors.Reset
          );
        });
      }

      const id = item.item_id;
      const name = item.market_hash_name;
      const price = item.price;
      const broadcastTime = item.broadcasted_at;
    });

    socket.on(channel.price_changed, (item: InventoryChangesObject) => {
      if (item.app_id == CSGO_APP_ID) {
        dbOnPriceChanged(db, item, doc => {
          console.log(colors.FgYellow, "Price Changed!", colors.Reset);
          console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
          console.log(
            colors.Bright,
            `${item.market_hash_name}\nPrice Change: ${doc.delta}`,
            colors.Reset
          );
        });
      }
    });

    socket.on(channel.extra_info, (item: InventoryChangesObject) => {
      if (item.app_id == CSGO_APP_ID) {
        dbOnExtraInfo(db, item, doc => {
          console.log(colors.FgBlue, "Extra Info Received!", colors.Reset);
          console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
          // JSON Pretty printing: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
          console.log(
            colors.Bright,
            `Extra Info: ${JSON.stringify(doc.extra_info, null, 2)}\n
             StickerInfo: ${JSON.stringify(doc.sticker_info, null, 2)}`,
            colors.Reset
          );
        });
      }
    });

    socket.on(channel.disconnected, () => {
      client.close();
    });
  }
);

// --------------------------------
// ---- DB Hooks ------------------
// --------------------------------

/**
 * 
 * @param avg The old average
 * @param volume the new volume (old volume + 1)
 * @param addOn the value of the new item
 */
function averageOf(avg: number, volume: number, addOn: number) {
  volume = (volume > 1) ? volume : 2;
  let aggregate = avg * (volume - 1)
  // console.log(`init agg: ${aggregate}`)
  aggregate = parseFloat(`${aggregate}`) + parseFloat(`${addOn}`)
  let newAvg = aggregate / volume

  // if (isNaN(newAvg)) {
  //   console.log(`agg: ${aggregate}\nvol: ${volume}\nadd-on: ${addOn}\nnew-avg: ${newAvg}`)
  //   process.exit(0)
  // }

  return newAvg
}

async function dbOnListed(db: Db, item: InventoryChangesObject, callback) {
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
  var currentDoc = await listing_stats.findOne({'name': item.market_hash_name})
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
      {'name': item.market_hash_name}, // Filter
      {$set: {
        volume: stats.volume,
        avg: {
          price: stats.avg.price,
          discount: stats.avg.discount
        }
      }}, // Update data
      function (){} // Callback
    )

  } else {
    console.log(`New Hash Name!`)
    listing_stats.insertOne(stats)
  }

  
}

function dbOnDelisted(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("delisted");

  const doc = {
    id: item.item_id,
    hash_name: item.market_hash_name,
    price: item.price,
    broadcasted_at: item.broadcasted_at
  };

  collection.insert(doc, callback(doc));
}

function dbOnPriceChanged(db: Db, item: InventoryChangesObject, callback) {
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

function dbOnExtraInfo(db: Db, item: InventoryChangesObject, callback) {
  const collection = db.collection("extra_info");

  const doc = {
    item_id: item.item_id,
    asset_id: item.asset_id,
    extra_info: item.extra_info,
    sticker_info: item.sticker_info
  };

  collection.insert(doc, callback(doc));
}

// ---- End DB Hooks ----