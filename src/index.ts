import * as BitSkins from "bitskins"
import { InventoryChangesObject } from "inventory_changes";
import { ConsoleColors } from "./console_colors"; // Needs a relative import; I'm not sure why.

const socket = new BitSkins.WebSocket();
const colors = new ConsoleColors()

socket.on('connected', () => {
    console.log('connected, yay!')
})

socket.on('inventory_changes:listed', (item: InventoryChangesObject) => {
    console.log(colors.FgGreen, 'Item Listed!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
})

socket.on('inventory_changes:delisted_or_sold', (item: InventoryChangesObject) => {
    console.log(colors.FgRed, 'Item Delisted or Sold!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
})

socket.on('inventory_changes:price_changed', (item: InventoryChangesObject) => {
    console.log(colors.FgYellow, 'Price Changed!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
})

socket.on('inventory_changes:extra_info', (item: InventoryChangesObject) => {
    console.log(colors.FgBlue, 'Extra Info Received!', colors.Reset)
    console.log(colors.Dim, JSON.stringify(item), colors.Reset)
})