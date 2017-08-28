var app = require('./app');
var expressWs = require('express-ws')(app);

app.ws('/alarm-ws', function(ws, req) {
	require('dcim-redis').subscribe('alarm-message', function(topic, msg) {
		ws.send(msg);
	});
});