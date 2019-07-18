import { bsApi } from './index';
import skinValues from './constants/initSkinValues';
import { InventoryChangesObject } from 'data/inventory_changes';

export async function onListed(item: any) {
    if (goodBuy(item)) {
        let bought: boolean = await buy(item);
        logPurchase(item, bought); // don't await, let this happen in background
        if (bought) {
            list(item);
        }
    }
}

/**
 * Returns a boolean indicating whether this item
 * is a 'good buy'
 * @param item 
 */
function goodBuy(item: InventoryChangesObject): boolean {
    let expectedValue = skinValues[item.item_id];
    if (!expectedValue) return false;
    return item.price < expectedValue;
}

/**
 * Attempts to purchase the item
 * Returns a boolean indicating whether purchase was successful
 * @param item item to purchase
 */
async function buy(item: InventoryChangesObject): Promise<boolean> {
    // TODO implement
    let code = await bsApi.buyItem([item.item_id], [item.price]);
    return (code - 300) < 0; // 200 statuses are ok, 300 and up are bad
}

/**
 * Logs success or failure of purchase
 * @param purchaseAttempt 
 */
async function logPurchase(item, success) {
    // TODO implement
}

/**
 * Lists this item on the marketplace
 * @param item 
 */
function list(item: any) {
    // TODO implement
    // let code = bsApi.sellItem([item.id], [item.price]);
    // return (code - 300) < 0; 
}