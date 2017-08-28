var db = require('dcim-db');
var config = require('dcim-config');
var floor = require('dcim-object-dao').floor;

module.exports.initRequest = function(app) {
	app.get('/floors', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.root_object_id;
		floor.getByPositionParent(db.pool, parentId, function(error, floors) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(floors);
			}
		});
	});
}
