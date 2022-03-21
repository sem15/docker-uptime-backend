const bent = require('bent');
var fs = require('fs');
const { Kafka } = require("kafkajs");


const clientId = "uptime";
const brokers = ["172.29.0.3:9092"];
const topic = "lrc-uptime";

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();

console.log("Checking to see if ssi.lrc.army.mil is online. . .")
var report = "Hello";


async function makeLrcRequest() {
    try {
        const get = bent('https://ssilrc.army.mil', 'GET');
        let response = await get('/');
        let now = new Date();
        // console.log('Test:', { statusCode: response.statusCode.toString(), statusMessage: response.statusMessage, timestamp: now });
        // let r = writeToLog(response);
        let r = { statusCode: response.statusCode.toString(), statusMessage: response.statusMessage + '$lrc', timestamp: now };
        produce(r);
    } catch (e) {
        console.log(e.statusCode, "error!");
        let error = {
            statusCode: e.statusCode,
            statusMessage: "Error"
        }
        if(error.statusCode == undefined) {
            error.statusCode = '000'
        }
        // let r = writeToLog(error);
        let now = new Date();
        let r = { statusCode: error.statusCode.toString(), statusMessage: error.statusMessage + '$lrc', timestamp: now };
        produce(r);
    }
}
async function makeBbRequest() {
    try {
        const get = bent('https://clle.blackboard.com/', 'GET');
        let response = await get('/');
        let now = new Date();
        // console.log('Test:', { statusCode: response.statusCode.toString(), statusMessage: response.statusMessage, timestamp: now });
        // let r = writeToLog(response);
        let r = { statusCode: response.statusCode.toString(), statusMessage: response.statusMessage + '$bb', timestamp: now };
        produce(r);
    } catch (e) {
        console.log(e.statusCode, "error!");
        let error = {
            statusCode: e.statusCode,
            statusMessage: "Error"
        }
        // let r = writeToLog(error);
        let now = new Date();
        let r = { statusCode: error.statusCode.toString(), statusMessage: error.statusMessage + '$bb', timestamp: now };
        produce(r);
    }
}

const produce = async (response) => {
	await producer.connect()

		try {
            console.log("producer sending")
            console.log("Sending key:", response.statusCode, "Sending Value:", response.statusMessage)
			await producer.send({
				topic,
				messages: [
					{
						key: response.statusCode,
						value: response.statusMessage,
					},
				],
			})
		} catch (err) {
			console.error("could not write message " + err)
		}
}


setInterval(function(){ 
    makeLrcRequest();
    makeBbRequest();
}, 6000);


module.exports = produce




// 'https://train.gordon.army.mil/webapps/ssi/wp-content/uploads/2020/11/eMILPO-User-Manual.pdf'
// 'https://ssilrc.army.mil'
// https://clle.blackboard.com/