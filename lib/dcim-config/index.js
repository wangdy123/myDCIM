module.exports = {};
module.exports.config = require(require('path').join(process.cwd(), 'conf', 'config.json'));
var confs = module.exports.config.confs;
for (var i = 0; i < confs.length; i++) {
	module.exports[confs[i]] = require(require('path').join(process.cwd(), 'conf', confs[i] + '.json'));
}
