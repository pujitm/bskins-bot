const express = require("express");
import { Db } from "mongodb";

/**
 * Uses express to start app on port 3000
 * 
 * @param db reference to Mongo database
 * */
export function initializeApi(db: Db) {
    const app = express();
    var expressWs = require('express-ws')(app);
    const port = 3000;
    app.get('/', function (req, res) {
        db.collection("listed").countDocuments().then(function (val) {
            res.send(`Items listed: ${val}`);
        }).catch(function (err) {
            res.send(500, err);
        });
        
    });

    app.ws('/', function (ws, req) {
        ws.on('message', function (msg) {
            console.log(msg);
            ws.send(msg);
        });

        setInterval(
            function () {
                db.collection("listed").countDocuments().then(function (val) {
                    ws.send(`Items listed: ${val}`);
                });
            },
            2000
        );
    });
    app.listen(port, () => console.log(`bskins-bot is listening on port ${port}!`));
}