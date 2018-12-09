require('dotenv').config() // Should be first line application; loads environment variables
import * as BitSkins from "bitskins"
import { InventoryChangesObject } from "inventory_changes";
import { ConsoleColors } from "./console_colors"; // Needs a relative import; I'm not sure why.

/**
 * See https://github.com/Rob--/bitskins#api for documentation
 */
const api = new BitSkins.API(process.env.API_KEY, process.env.API_SECRET)

/**
 * See https://github.com/Rob--/bitskins#web-sockets for documentation
 */
const socket = new BitSkins.WebSocket()

/**
 * See `ConsoleColors` import for documentation
 */
const colors = new ConsoleColors()

socket.on('connected', () => {
    console.log('connected, yay!')
})

socket.on('inventory_changes:listed', (item: InventoryChangesObject) => {
    console.log(colors.FgGreen, 'Item Listed!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
    console.log(colors.Bright,`${item.market_hash_name}\n$ ${item.price}`, colors.Reset)
})

socket.on('inventory_changes:delisted_or_sold', (item: InventoryChangesObject) => {
    console.log(colors.FgRed, 'Item Delisted or Sold!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
    console.log(colors.Bright,`${item.market_hash_name}\n$ ${item.price}`, colors.Reset)
})

socket.on('inventory_changes:price_changed', (item: InventoryChangesObject) => {
    console.log(colors.FgYellow, 'Price Changed!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
    console.log(colors.Bright,`${item.market_hash_name}\nPrice Change: ${(item.old_price - item.price).toFixed(2)}`, colors.Reset)
})

socket.on('inventory_changes:extra_info', (item: InventoryChangesObject) => {
    console.log(colors.FgBlue, 'Extra Info Received!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
    // JSON Pretty printing: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
    console.log(
        colors.Bright,
        `${item.market_hash_name}\n
            Extra Info: ${JSON.stringify(item.extra_info, null, 2)}\n
            StickerInfo: ${JSON.stringify(item.sticker_info, null, 2)}`,
        colors.Reset)
})