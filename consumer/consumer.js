const { Kafka } = require("kafkajs");
var mysql = require('mysql');

var con = mysql.createConnection({
	host: '172.29.0.6',
	user: "root",
	password: "password",
	database: "uptime"
  });



const clientId = "uptime";
const brokers = ["172.29.0.3:9092"];
const topic = "lrc-uptime";

const kafka = new Kafka({ clientId, brokers });

const consumer = kafka.consumer({ groupId: clientId })

const consume = async () => {

	await consumer.connect()
	await consumer.subscribe({ topic })
	await consumer.run({

		eachMessage: ({ message }) => {
			console.log('received message:', message.key.toString(), message.value.toString());
			let mes = message.value.toString().split('$')[0];
			let site = message.value.toString().split('$')[1];
			var now = Date.now();
			//MAKE THESE QUERIES PARAMATERIZED
			if(con) {
				var sql = `INSERT INTO response (Status, Site, Message, JsTimeStamp) VALUES ('${message.key.toString()}', '${site}','${mes}', '${now}');`;
				con.query(sql, function (err, result) {
					if (err) {
						console.log(err);
					}
					else {
						// console.log(result);
					}
			})} else {
				con.connect(function(err) {
					if (err) {
						// throw err;
						console.log(err);
					} 
					console.log("Connected!");
					var sql = `INSERT INTO response (Status, Site, Message, JsTimeStamp) VALUES ('${message.key.toString()}', '${site}','${mes}', '${now}');`;
					  console.log("1 record inserted");
					});
			}
			
		},
	})
}


consume();

module.exports = consume