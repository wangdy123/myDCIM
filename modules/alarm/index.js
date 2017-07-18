var app = require('./app');

require('./self-diagnosis');
require('./active-alarm')
require('./alarm-event')
require('./alarm-operate')

module.exports = app;