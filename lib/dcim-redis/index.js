var redis = require("redis");
var uuid = require('node-uuid');
var config = require('dcim-config');

function createRedisConnect() {
	return redis.createClient({
		host : config.redis.host,
		port : config.redis.port,
		connect_timeout : 1
	});
}
module.exports.createRedisConnect = createRedisConnect;

var client = createRedisConnect();

// client.on("connect", function() {
// client.auth(config.redis.user);
// });

client.on("error", function(err) {
	logger.error("Error: " + err);
	process.exit();
});

module.exports.redis = client;

var subscribeClient = createRedisConnect();
var publishClient = createRedisConnect();

var subscribes = {};
var psubscribes = {};

subscribeClient.on("error", function(err) {
	for ( var topic in subscribes) {
		subscribeClient.subscribe(topic);
	}
	for ( var pattern in psubscribes) {
		subscribeClient.psubscribe(pattern);
	}
});

publishClient.on("error", function(err) {
	logger.error(err);
});

module.exports.subscribe = function(topic, fn) {
	subscribes[topic] = fn;
	subscribeClient.subscribe(topic);
};

subscribeClient.on('message', function(topic, message) {
	if (topic in subscribes) {
		subscribes[topic](topic, JSON.parse(message));
	}
});

module.exports.unsubscribe = function(topic) {
	delete subscribes[topic];
};

module.exports.psubscribe = function(pattern, topic, fn) {
	if (pattern in psubscribes) {
		psubscribes[pattern][topic] = fn;
	} else {
		psubscribes[pattern] = {};
		psubscribes[pattern][topic] = fn;
		subscribeClient.psubscribe(pattern, function(err, r) {
			if(err){
				logger.error(err);
			}
		});
	}
};
subscribeClient.on('pmessage', function(pattern, topic, message) {
	if (pattern in psubscribes) {
		if (topic in psubscribes[pattern]) {
			psubscribes[pattern][topic](topic, JSON.parse(message));
		}
	}
});

module.exports.punsubscribe = function(pattern, topic) {
	if (pattern in psubscribes) {
		if (topic in psubscribes[pattern]) {
			delete psubscribes[pattern][topic];
		}
	}
};

module.exports.publish = function(topic, message, cbk) {
	publishClient.publish(topic, JSON.stringify(message), function(err, result) {
		if (cbk) {
			cbk(err, result);
		}
	});
};

module.exports.mqRpc = function(method, param, callback, waitSecond) {
	waitSecond = waitSecond ? waitSecond : 5;
	var respTopic = method + '_resp:' + uuid.v1();
	var pattern = method + '_resp:*';
	var responceBodys = [];
	var responceCount = 0;
	var requestCount = 0;
	var timeout=null;
	function responce(err) {
		try {
			clearTimeout(timeout);
			module.exports.punsubscribe(pattern, respTopic);
			callback(err, responceBodys);
		} catch (e) {
			logger.error(e);
		}
	}
	module.exports.psubscribe(pattern, respTopic, function(topic, message) {
		responceCount++;
		if (!message.error) {
			responceBodys.push(message.result);
		}
		if (responceCount >= requestCount) {
			responce(null);
		}
	});
	timeout = setTimeout(function() {
		responce("out of time");
	}, waitSecond * 1000);

	module.exports.publish(method, {
		respTopic : respTopic,
		param : param
	}, function(err, result) {
		if (err) {
			responce(err);
		} else {
			requestCount = result;
		}
	});
};

module.exports.initRpcService = function(method, callback) {
	module.exports.subscribe(method, function(topic, request) {
		callback(request.param, function(err, responseBody) {
			module.exports.publish(request.respTopic, {
				error : err,
				result : responseBody
			});
		});
	});
}