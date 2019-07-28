require("dotenv").config(); // Should be first line application; loads environment variables
import * as BitSkins from "bitskins";
import { InventoryChangesObject } from "./data/inventory_changes";
import { colors } from "./util/console_colors"; // Needs currentDoc relative import; I'm not sure why.
import { Db, Double } from "mongodb";
import { blacklistedSkins } from "constants/blacklist";
import { dbOnDelisted, dbOnListed, dbOnPriceChanged, dbOnExtraInfo } from "./data/mongo";
import { averageOf } from "util/custom_math";
import { initializeApi } from "./api/app";
import { onListed } from "onListed";
const {Firestore} = require('@google-cloud/firestore');

// ---- Configuration ----

/**
 * See https://github.com/Rob--/bitskins#api for documentation
 */
export const bsApi = new BitSkins.API(process.env.API_KEY, process.env.API_SECRET);

/**
 * See https://github.com/Rob--/bitskins#web-sockets for documentation
 */
export const bsSocket = new BitSkins.WebSocket();

export const MongoClient = require("mongodb").MongoClient;

export const usingDockerFlag = process.env.USING_DOCKER;

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

// Create a new client
const firestore = new Firestore();

bsSocket.on(channel.connected, () => {
  console.log("connected to bitskins websocket");
});

bsSocket.on(channel.listed, (item: InventoryChangesObject) => {
  // PRECONDITION: item.app_id == CSGO_APP_ID
  let docRef = firestore.doc(`${item.market_hash_name}/${item.item_id}`);
  docRef.set({listing: item}).then().catch(err => {
    console.log(colors.FgRed, err, colors.Reset);
  }); // async operation
});

// Treat price changes as new listings
bsSocket.on(channel.price_changed, (item: InventoryChangesObject) => {
  // PRECONDITION: item.app_id == CSGO_APP_ID
  let docRef = firestore.doc(`${item.market_hash_name}/${item.item_id}`);
  docRef.update({listing: item}).then().catch(err => {
    if (!err.details.includes('No document to update')) {
      console.log(colors.FgRed, err, colors.Reset);
    }
  }); // async operation
  // onListed(item);
 });

 bsSocket.on(channel.delisted, (item: InventoryChangesObject) => {
  // PRECONDITION: item.app_id == CSGO_APP_ID
  let docRef = firestore.doc(`${item.market_hash_name}/${item.item_id}`);
  docRef.update({delist: item}).then().catch(err => {
    if (!err.details.includes('No document to update')) {
      console.log(colors.FgRed, err, colors.Reset);
    }
  }); // async operation
 });

// ---- End Configuration ----