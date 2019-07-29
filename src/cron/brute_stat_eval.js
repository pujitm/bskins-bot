require("dotenv").config(); // Should be first line application; loads environment variables
const { Firestore } = require('@google-cloud/firestore');

const _cliProgress = require('cli-progress');
 
// create a new progress bar instance and use shades_classic theme
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

const firestore = new Firestore();
const average = arr => arr.reduce((sum, element) => sum + element, 0) / arr.length;
let prices = {};

firestore.listCollections().then(async (collections) => {
    bar1.start(collections.length, 0);
    for (let collection of collections) {
        // console.log(`Found collection with id: ${collection.id}`);
        let collPrices = await parseCollection(collection);
        prices[collection.id] = collPrices;
        bar1.increment();
    }
    bar1.stop();
    console.log(prices);
});

function parseCollection(collection) {
    return collection.listDocuments().then(async (documentRefs) => {
        let buyPrices = [];
        let sellPrices = [];
        for (let ref of documentRefs) {
            if (ref.id) {
                const snap = await ref.get();
                const data = snap.data();
                // console.log(data);

                if (data.listing) {
                    buyPrices.push(data.listing.price);
                }

                if (data.delist) {
                    sellPrices.push(data.delist.price);
                }
            }
        }

        let avgPrices = {
            avgList: average(buyPrices) || 0,
            avgSale: average(sellPrices) || 0,
            volume: documentRefs.length,
        };

        collection.doc('stats').set(avgPrices);

        return avgPrices;
    });
}

