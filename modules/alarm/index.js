var app = require('./app');
var expressWs = require('express-ws')(app); 
// require('./role')
// require('./department')
// require('./personnel')
// require('./account')

app.ws('/alarm-ws', function(ws, req) {
	ws.on('message', function(msg) {
		console.log('_message');
		console.log(msg);
		ws.send('echo:' + msg);
	});
	require('dcim-mq').subscribe('alarm-message', function(topic, msg) {
		ws.send(msg);
	});
});


module.exports = app;