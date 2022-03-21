var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config();

var db;
var settings = {
    host: '172.29.0.6',
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "uptime",
    connectionLimit: 100
};


//create singleton database connection

function connectDatabase() {
    if (!db) {
        db = mysql.createPool(settings);
    }
    return db;
}

function test() {
    console.log("this is a test");
}

// export default connectDatabase();


exports.test = test;
exports.connectDatabase = connectDatabase;
// exports.db = db;