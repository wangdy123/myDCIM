var db = require('dcim-db');
var config = require('dcim-config');
var rack = require('dcim-object-dao').rack;

module.exports.initRequest = function(app) {
	app.get('/racks', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.root_object_id;
		rack.getByPositionParent(db.pool, parentId, function(error, racks) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(racks);
			}
		});
	});
}
