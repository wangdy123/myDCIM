var db = require('dcim-db');
var config = require('dcim-config');
var cabinet = require('dcim-object-dao').cabinet;

module.exports.initRequest = function(app) {
	app.get('/cabinets', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		cabinet.getByPositionParent(db.pool, parentId, function(error, cabinets) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(cabinets);
			}
		});
	});
}
