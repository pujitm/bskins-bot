export interface InventoryChangesObject {
    app_id: number;
    context_id: number;
    item_id: string;
    asset_id: string;
    class_id: string;
    instance_id: string;
    phase?: any;
    image: string;
    market_hash_name: string;
    price: number;
    old_price: number;
    discount: number;
    withdrawable_at: number;
    extra_info: ExtraInfo;
    wear_value: string;
    sticker_info: StickerInfo[];
    event_type: string;
    broadcasted_at: number;
}

export interface ExtraInfo {
    paintindex: number;
    paintseed: number;
    rarity: number;
    quality: number;
    paintwear: number;
    patternname: string;
}

export interface StickerInfo {
    name: string;
    url: string;
    wear_value: string;
}