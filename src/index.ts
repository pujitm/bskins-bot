require("dotenv").config(); // Should be first line application; loads environment variables
import * as BitSkins from "bitskins";
import { InventoryChangesObject } from "./data/inventory_changes";
import { colors } from "./util/console_colors"; // Needs currentDoc relative import; I'm not sure why.
import { Db, Double } from "mongodb";
import { blacklistedSkins } from "constants/blacklist";
import { dbOnDelisted, dbOnListed, dbOnPriceChanged, dbOnExtraInfo } from "./data/mongo";
import { averageOf } from "util/custom_math";
import { initializeApi } from "./api/app";

// ---- Configuration ----

/**
 * See https://github.com/Rob--/bitskins#api for documentation
 */
const bsApi = new BitSkins.API(process.env.API_KEY, process.env.API_SECRET);

/**
 * See https://github.com/Rob--/bitskins#web-sockets for documentation
 */
const bsSocket = new BitSkins.WebSocket();

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
  function (err, client) {

    if (err) {
      console.log(err);
      console.log('Exiting ...');
      return;
    }

    console.log("Connected successfully to database server");

    const db = client.db(dbName);

    bsSocket.on(channel.connected, () => {
      console.log("connected to bitskins websocket");
    });

    //socket.on(channel.listed, (item: InventoryChangesObject) => {
    //  if (item.app_id == CSGO_APP_ID) {
    //    dbOnListed(db, item, doc => {
    //      console.log(colors.FgGreen, "Item Listed!", colors.Reset);
    //      console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
    //      console.log(
    //        colors.Bright,
    //        `${item.market_hash_name}\n$ ${item.price}`,
    //        colors.Reset
    //      );
    //    });
    //  }
    //});

    //socket.on(channel.delisted, (item: InventoryChangesObject) => {
    //  if (item.app_id == CSGO_APP_ID) {
    //    dbOnDelisted(db, item, doc => {
    //      console.log(colors.FgRed, "Item Delisted or Sold!", colors.Reset);
    //      console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
    //      console.log(
    //        colors.Bright,
    //        `${item.market_hash_name}\n$ ${item.price}`,
    //        colors.Reset
    //      );
    //    });
    //  }

    //  const id = item.item_id;
    //  const name = item.market_hash_name;
    //  const price = item.price;
    //  const broadcastTime = item.broadcasted_at;
    //});

    //socket.on(channel.price_changed, (item: InventoryChangesObject) => {
    //  if (item.app_id == CSGO_APP_ID) {
    //    dbOnPriceChanged(db, item, doc => {
    //      console.log(colors.FgYellow, "Price Changed!", colors.Reset);
    //      console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
    //      console.log(
    //        colors.Bright,
    //        `${item.market_hash_name}\nPrice Change: ${doc.delta}`,
    //        colors.Reset
    //      );
    //    });
    //  }
    //});

    //socket.on(channel.extra_info, (item: InventoryChangesObject) => {
    //  if (item.app_id == CSGO_APP_ID) {
    //    dbOnExtraInfo(db, item, doc => {
    //      console.log(colors.FgBlue, "Extra Info Received!", colors.Reset);
    //      console.log(colors.Dim, JSON.stringify(doc), colors.Reset);
    //      // JSON Pretty printing: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
    //      console.log(
    //        colors.Bright,
    //        `Extra Info: ${JSON.stringify(doc.extra_info, null, 2)}\n
    //         StickerInfo: ${JSON.stringify(doc.sticker_info, null, 2)}`,
    //        colors.Reset
    //      );
    //    });
    //  }
    //});

    bsSocket.on(channel.disconnected, () => {
      client.close();
    });

    initializeApi(db);
  }
);