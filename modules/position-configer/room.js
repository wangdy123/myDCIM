var app = require('./app');

var db =require('../base').db;
var posionRelation=require('./posion_relation');


app.get('/rooms', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,f.NAME,p.OBJECT_TYPE,p.PARENT_ID,f.CODE,f.ROOM_TYPE,f.SEQUENCE from config.ROOM f '
		+'left join config.POSITION_RELATION p on f.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, rooms, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(rooms);
		}
	});
});

app.post('/rooms', function(req, res) {
	var room = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,room,function(id){
			room.ID=id;
			posionRelation.insertPosionRelation(chain,room,function(){
				var sql='INSERT INTO config.ROOM(ID,NAME,CODE,ROOM_TYPE,SEQUENCE)values(?,?,?,?,?)';
				chain.query(sql, [ room.ID,room.NAME,room.CODE,room.ROOM_TYPE,room.SEQUENCE]);
			});	
		});
	}, function() {
		res.status(201).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
	}
	catch(err){
		logger.error(err);
		res.status(500).send(error);
	}
});

app.put('/rooms', function(req, res) {
	var room = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,room,function(){
				posionRelation.updatePosionRelation(chain,room,function(){
				var sql='update config.ROOM set NAME=?,CODE=?,ROOM_TYPE=?,SEQUENCE=? where ID=?';
				chain.query(sql, [room.NAME,room.CODE,room.ROOM_TYPE,room.SEQUENCE,room.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/rooms/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.ROOM where ID=?', [ req.params.id ]).on('result', function(result) {
		posionRelation.deletePosionRelation(chain,req.params.id,function(){
			posionRelation.deleteObject(chain,req.params.id,function(){
		});
		});
		});
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;
