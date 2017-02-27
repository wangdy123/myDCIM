var mq = require('./redis_mq');

var method = "signal_value";
mq.initRpcService(method, function(param, responseFn) {
	var values = [];
	for (var index = 0; index < param.length; index++) {
		values.push({
			id : param[index],
			value : index,
			updateTime : new Date()
		});
	}
	responseFn(null, values);
});

var lastTime = new Date();
var j = 0;
function dotest(fn) {
	j++;
	if (j > 100000) {
		process.exit();
	}
	if (j % 10000 === 0) {
		var time = new Date();
		if (lastTime) {
			var count = 10000 / ((time.valueOf() - lastTime.valueOf()) * 0.001);
			console.log("per second:" + count);
		}
		lastTime = time;
	}
	mq.mqRpc(method, [ 1, 222, 333, 444, 555 ], function(err, values) {
		if (err) {
			console.log("err:" + err);
			console.log("j:" + j);
		} else {
			// console.log(values);
		}
		fn(fn);
		// process.exit();
	});

}
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);
// dotest(dotest);

var lastTime = new Date();
var i = 0;
function sub(topic) {
	mq.subscribe(topic, function(topic, message) {
		//console.log(topic + "message:" + message);
		pub(topic);
	});
}

function pub(topic) {
	i++;
	if (i > 1000000) {
		process.exit();
	}
	if (i % 100000 === 0) {
		var time = new Date();
		if (lastTime) {
			var count = 100000 / ((time.valueOf() - lastTime.valueOf()) * 0.001);
			console.log("per second:" + count);
		}
		lastTime = time;
	}
	mq.publish(topic, {
		aaa : "zzz"
	});
}

sub("topic1");
pub("topic1");

 sub("topic2");
 pub("topic2");

 sub("topic3");
 pub("topic3");

 sub("topic4");
 pub("topic4");

 sub("topic5");
 pub("topic5");
