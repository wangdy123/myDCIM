var subscribeClient = require('../db').createRedisConnect();
var publishClient = require('../db').createRedisConnect();

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
	console.log(err);
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
}

module.exports.psubscribe = function(pattern, topic, fn) {
	if (pattern in psubscribes) {
		psubscribes[pattern][topic] = fn;
	} else {
		psubscribes[pattern] = {};
		psubscribes[pattern][topic] = fn;
		subscribeClient.psubscribe(pattern, function(err, r) {
			console.log(err + r);
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
}

module.exports.publish = function(topic, message, cbk) {
	publishClient.publish(topic, JSON.stringify(message), function(err, result) {
		if (cbk) {
			cbk(err, result);
		}
	});
};

var uuid = require('node-uuid');
module.exports.mqRpc = function(method, param, callback, waitSecond) {
	waitSecond = waitSecond ? waitSecond : 5;
	var respTopic = method + '_resp:' + uuid.v1();
	var pattern = method + '_resp:*';
	var responceBodys = [];
	var responceCount = 0;
	var requestCount = 0;

	function responce(err) {
		try {
			clearTimeout(timeout);
			module.exports.punsubscribe(pattern, respTopic);
			callback(err, responceBodys);
		} catch (e) {
			console.log(e);
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
	var timeout = setTimeout(function() {
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