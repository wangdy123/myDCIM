var app = require('./app');
var db =require('../db');
var posionRelation=require('./posion_relation');

app.get('/doors', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,d.NAME,p.OBJECT_TYPE,p.PARENT_ID,d.CODE,d.SEQUENCE from config.DOOR d '
		+'left join config.POSITION_RELATION p on d.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, doors, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(doors);
		}
	});
});

app.post('/doors', function(req, res) {
	var door = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,door,function(id){
			door.ID=id;
			posionRelation.insertPosionRelation(chain,door,function(){
				var sql='INSERT INTO config.DOOR(ID,NAME,CODE,SEQUENCE)values(?,?,?,?)';
				chain.query(sql, [ door.ID,door.NAME,door.CODE,door.SEQUENCE]);
			});	
		});
	}, function() {
		res.status(201).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
	}
	catch(err){
		console.log(err);
		res.status(501).send(error);
	}
});

app.put('/doors', function(req, res) {
	var door = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,door,function(){
				posionRelation.updatePosionRelation(chain,door,function(){
				var sql='update config.DOOR set NAME=?,CODE=?,SEQUENCE=? where ID=?';
				chain.query(sql, [door.NAME,door.CODE,door.SEQUENCE,door.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/doors/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.DOOR where ID=?', [ req.params.id ]).on('result', function(result) {
		posionRelation.deletePosionRelation(chain,req.params.id,function(){
			posionRelation.deleteObject(chain,req.params.id,function(){
		});
		});
		});
	}, function() {
		res.status(200).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

module.exports = app;
