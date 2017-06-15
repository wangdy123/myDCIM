var db = require('dcim-db');
var config = require('dcim-config');
var room = require('dcim-object-dao').room;

module.exports.initRequest = function(app) {
	app.get('/rooms', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		room.getByPositionParent(db.pool, parentId, function(error, rooms) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(rooms);
			}
		});
	});
}
