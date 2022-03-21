const express = require('express');
const bodyParser = require('body-parser');
var dotenv = require('dotenv');
const { start, cache } = require('./helper.js');
var database = require('./db.js');
var cors = require('cors')

dotenv.config();


database.test();
var db = database.connectDatabase();

const app = express();
const port = 3300;
app.use(cors())

    app.use(bodyParser.json());
        app.use(
          bodyParser.urlencoded({
            extended: true,
          })
        );

    var init_connection = setInterval(function(){
            if (!db) {
                return
            } else {
                start();
                monitorRequests();
                clearInterval(init_connection);
            }
         }, 15000);


    function monitorRequests() {

        app.get('/status', (req, res) => {
            db.getConnection(function(error, connection){
                var sql = `SELECT * from response ORDER BY id DESC LIMIT 1;`;
                connection.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.json(result);
            });
            connection.release();
            })
        });


        app.get('/total', (req, res) => {
            db.getConnection(function(error, connection){
                var sql = `SELECT * from response;`;
                connection.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.json(result);
            });
            connection.release();
            })
        });


        app.get('/cache', (req, res) => {
            console.log('hit cache route')
                res.json(cache);
        })

        //This will take in number of minutes, and return the up/down stats within the 'current time - the input minutes'
        app.get('/filter/:site/:mins', async (req, res) => {
            var site = req.params.site;
            var mins = req.params.mins;
            var now = Date.now();
            var search = new Date(now - mins * 60000).valueOf();
            // console.log(search);
            var health = {};

            await db.getConnection(async function(error, connection){
                var up = 0;
                var down = 0;

                // var sql = `SELECT COUNT(CASE WHEN Status=200 THEN 1 END) AS up, COUNT(CASE WHEN Status!=200 THEN 1 END) AS down from response WHERE JsTimeStamp > '${search}';`;
                var sql = `SELECT COUNT(CASE WHEN Status=200 THEN 1 END) AS up, COUNT(CASE WHEN Status!=200 THEN 1 END) AS down from response WHERE JsTimeStamp > ? AND Site = ?`;
                await connection.query(sql, [search, site], function (err, result) {
                if (err) {
                    console.log(err);
                }
                // console.log('result: ', result)
                // res.json(result);
                var r = JSON.stringify(result[0]);
                r = JSON.parse(r);
                up = r.up;
                down = r.down;
                health.up = up;
                health.down = down;
                res.json(health);
                connection.release();
            })
            });
    })

        app.listen(port, () => {
        });
    }




