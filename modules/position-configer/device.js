var db = require('dcim-db');
var config = require('dcim-config');
var device = require('dcim-object-dao').device;

module.exports.initRequest = function(app) {
	app.get('/devices', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		device.getByPositionParent(db.pool, parentId, function(error, devices) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(devices);
			}
		});
	});
}
