import * as BitSkins from "bitskins"
const socket = new BitSkins.WebSocket();

socket.on('connected', () => {
    console.log('connected, yay!')
})

socket.on('inventory_changes:listed', (item) => {
    console.log(item)
})