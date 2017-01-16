var app = require('./app');

var db =require('../base').db;
var posionRelation=require('./posion_relation');

app.get('/cabinetColumns', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,b.NAME,p.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.SEQUENCE,b.CABINET_COUNT,b.CABINET_DEPTH from config.CABINET_COLUMNS b '
		+'left join config.POSITION_RELATION p on b.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, objects, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/cabinetColumns', function(req, res) {
	var obj = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,obj,function(id){
			obj.ID=id;
			posionRelation.insertPosionRelation(chain,obj,function(){
				var sql='INSERT INTO config.CABINET_COLUMNS(ID,NAME,CODE,SEQUENCE,CABINET_COUNT,CABINET_DEPTH)values(?,?,?,?,?,?)';
				chain.query(sql, [ obj.ID,obj.NAME,obj.CODE,obj.SEQUENCE,obj.CABINET_COUNT,obj.CABINET_DEPTH]);
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

app.put('/cabinetColumns', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,obj,function(){
				posionRelation.updatePosionRelation(chain,obj,function(){
				var sql='update config.CABINET_COLUMNS set NAME=?,CODE=?,SEQUENCE=?,CABINET_COUNT=?,CABINET_DEPTH=? where ID=?';
				chain.query(sql, [obj.NAME,obj.CODE,obj.SEQUENCE,obj.CABINET_COUNT,obj.CABINET_DEPTH,obj.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/cabinetColumns/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.CABINET_COLUMNS where ID=?', [ req.params.id ]).on('result', function(result) {
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
