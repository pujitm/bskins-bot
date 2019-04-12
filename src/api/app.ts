const express = require("express");
import { Db } from "mongodb";

/**
 * Uses express to start app on port 3000
 * 
 * @param db reference to Mongo database
 * */
export function initializeApi(db: Db) {
    const app = express();
    const port = 3000;
    app.get('/', function (req, res) {
        db.collection("listed_stats").countDocuments().then(function (val) {
            res.send(`Unique items listed: ${val}`);
        }).catch(function (err) {
            res.send(500, err);
        });
        
    });
    app.listen(port, () => console.log(`bskins-bot is listening on port ${port}!`));
}