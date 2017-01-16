var app = require('./app');

var db =require('../base').db;
var posionRelation=require('./posion_relation');



app.get('/buildings', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,b.NAME,p.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.FLOOR_GROUND,b.FLOOR_UNDERGROUND from config.BUILDING b '
		+'left join config.POSITION_RELATION p on b.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, buildings, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(buildings);
		}
	});
});

app.get('/buildings/:id', function(req, res) {
	var sql = 'select p.ID,b.NAME,p.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.FLOOR_GROUND,b.FLOOR_UNDERGROUND from config.BUILDING b '
		+'left join config.POSITION_RELATION p on b.ID=p.ID where p.ID=?';
	db.pool.query(sql,[req.params.id], function(error, buildings, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			if(buildings.length>0){
				res.send(buildings[0]);				
			}else{
				res.status(404).send("not found");
			}
		}
	});
});
app.post('/buildings', function(req, res) {
	var building = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,building,function(id){
			building.ID=id;
			posionRelation.insertPosionRelation(chain,building,function(){
				console.log(building);
				var sql='INSERT INTO config.BUILDING(ID,NAME,CODE,FLOOR_GROUND,FLOOR_UNDERGROUND)values(?,?,?,?,?)';
				chain.query(sql, [ building.ID,building.NAME,building.CODE,building.FLOOR_GROUND,building.FLOOR_UNDERGROUND]);
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

app.put('/buildings', function(req, res) {
	var building = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,building,function(){
				posionRelation.updatePosionRelation(chain,building,function(){
				var sql='update config.BUILDING set NAME=?,CODE=?,FLOOR_GROUND=?,FLOOR_UNDERGROUND=? where ID=?';
				chain.query(sql, [building.NAME,building.CODE,building.FLOOR_GROUND,building.FLOOR_UNDERGROUND,building.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/buildings/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.BUILDING where ID=?', [ req.params.id ]).on('result', function(result) {
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
