var cache = { up: 0, down: 0, lrcHour: {}, lrcDay: {}, lrcWeek: {}, bbHour: {}, bbDay: {}, bbWeek: {} };
var database = require('./db.js');
const bent = require('bent');

var db = database.connectDatabase();

async function cacheStatus () {
    

        const getLrcHour = bent('http://172.29.0.7:3300/filter/lrc/60', 'GET', 'json');
        let lrcHour = await getLrcHour('/');
        cache.lrcHour = lrcHour;

        const getLrcDay = bent('http://172.29.0.7:3300/filter/lrc/1440', 'GET', 'json');
        let lrcDay = await getLrcDay('/');
        cache.lrcDay = lrcDay;

        const getLrcWeek = bent('http://172.29.0.7:3300/filter/lrc/10080', 'GET', 'json');
        let lrcWeek = await getLrcWeek('/');
        cache.lrcWeek = lrcWeek;

        const getbbHour = bent('http://172.29.0.7:3300/filter/bb/60', 'GET', 'json');
        let bbHour = await getbbHour('/');
        cache.bbHour = bbHour;

        const getbbDay = bent('http://172.29.0.7:3300/filter/bb/1440', 'GET', 'json');
        let bbDay = await getbbDay('/');
        cache.bbDay = bbDay;

        const getbbWeek = bent('http://172.29.0.7:3300/filter/bb/10080', 'GET', 'json');
        let bbWeek = await getbbWeek('/');
        cache.bbWeek = bbWeek;

        db.getConnection(function(error, connection){
            var sql1 = "SELECT COUNT(*) as up from response WHERE Status='200'";
            var sql2 = "SELECT COUNT(*) as down from response WHERE Status!='200'";
       
        connection.query(sql1, function (err, result) {
            if (err) {
                cache = err;
                console.log(err);
            }
            var r = JSON.stringify(result[0]);
            r = JSON.parse(r);
            // console.log('r:', r);
            cache.up = r.up;
            // console.log("UP:", cache.up)
            // console.log(cache)
        });
        connection.query(sql2, function (err, result) {
            if (err) {
                cache = err;
                console.log(err);
            }
            var r = JSON.stringify(result[0]);
            r = JSON.parse(r);
            cache.down = r.down;
            // console.log(cache)
        });
        connection.release();
        })

}

function start () {setInterval(cacheStatus, 6000)}

// export  { cache, start };

exports.start = start;
exports.cache = cache;

// module.exports = {
//     start: function() {},
//     cache: cache,
// };