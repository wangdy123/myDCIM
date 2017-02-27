/**
 * http://usejsdoc.org/
 */
var config = require('./config').config;
var redis = require("redis");

var client = redis.createClient({
	host : config.redis.host,
	port : config.redis.port,
	connect_timeout: 1
});

client.on("error", function(err) {
	console.log("Error: " + err);
	process.exit();
});

console.log(new Date());
function setItem(i, callback) {
	if (1000000 === i) {
		console.log('finished:');
		console.log(new Date());
		return;
	}
	var key = 'data:' + i;
	client.set(key, "ssssssssssssssssssssssssssss", function(err, result) {
		if (err) {
			console.log(err);
			callback(i + 1, setItem);
		} else {
			client.expire(key, 100);
			callback(i + 1, setItem);
		}
	});
	if ((i % 100000) === 0) {
		console.log(new Date());
	}

}
setItem(0, setItem);
