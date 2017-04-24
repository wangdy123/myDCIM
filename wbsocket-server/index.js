module.exports.initWs = function(app) {
	var expressWs = require('express-ws')(app);
	app.ws('/alarm/alarm-ws', function(ws, req) {
		ws.on('message', function(msg) {
			console.log('_message');
			console.log(msg);
			ws.send('echo:' + msg);
		});
		require('dcim-redis').subscribe('alarm-message', function(topic, msg) {
			ws.send(msg);
		});
	});
}