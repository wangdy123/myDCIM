var mysql = require("mysql");
async = require("async");

var pool = mysql.createPool({
	connectionLimit : 16,
	host : "localhost",
	port : 3306,
	user : "root",
	password :  "wangsx",
	database : "config"
});

pool.getConnection(function(err,connection){
	var tasks = {
			table_a : function(callback) {
				connection.query('select count(*) from config.OBJECT', function(err, result) {
					if(err){
						callback(err);
						return;
					}
					callback(err, result[0]['count(*)']); // 将结果传入callback
				});
			},
			table_b : function(callback) {
				connection.query('select count(*) from config.OBJECT', function(err, result) {
					if(err){
						callback(err);
						return;
					}
					callback(err, result[0]['count(*)']);
				});
			},
			table_c : function(callback) {
				connection.query('select count(*) from config.OBJECT', function(err, result) {
					if(err){
						callback(err);
						return;
					}
					callback(err, result[0]['count(*)']);
				});
			}
		};

		async.series(tasks, function(err, results) {
			if (err) {
				console.log(err);
			} else {
				console.log(results);
			}
			connection.release();
		});
});

/*
var title = 'It is a new post';

var tasks1 = [ function(callback) {
	connection.beginTransaction(function(err) {
		callback(err);
	});
}, function(callback) {
	connection.query('INSERT INTO posts SET title=?', title, function(err, result) {
		callback(err, result.insertId); // 生成的ID会传给下一个任务
	});
}, function(insertId, callback) {
	// 接收到上一条任务生成的ID
	var log = 'Post ' + insertId + ' added';
	connection.query('INSERT INTO log SET data=?', log, function(err, result) {
		callback(err);
	});
}, function(callback) {
	connection.commit(function(err) {
		callback(err);
	});
} ];

async.waterfall(tasks1, function(err, results) {
	if (err) {
		console.log(err);
		connection.rollback(); // 发生错误事务回滚
	}
	connection.end();
});

var title = 'It is a new post';

// 用于在posts插入成功后保存自动生成的ID
var postId = null;

// function数组，需要执行的任务列表，每个function都有一个参数callback函数并且要调用
var tasks = [ function(callback) {
	// 开启事务
	connection.beginTransaction(function(err) {
		callback(err);
	});
}, function(callback) {
	// 插入posts
	connection.query('INSERT INTO posts SET title=?', title, function(err, result) {
		postId = result.insertId;
		callback(err);
	});
}, function(callback) {
	// 插入log
	var log = 'Post ' + postId + ' added';
	connection.query('INSERT INTO log SET data=?', log, function(err, result) {
		callback(err);
	});
}, function(callback) {
	// 提交事务
	connection.commit(function(err) {
		callback(err);
	});
} ];

async.series(tasks, function(err, results) {
	if (err) {
		console.log(err);
		connection.rollback(); // 发生错误事务回滚
	}
	connection.end();
});

var sqls = {
	table_a : "select count(*) from table_a",
	table_b : "select count(*) from table_b",
	table_c : "select count(*) from table_c"
};

async.map(sqls, function(item, callback) {
	connection.query(item, function(err, results) {
		callback(err, results[0]['count(*)']);
	});
}, function(err, results) {
	if (err) {
		console.log(err);
	} else {
		console.log(results);
	}
});*/
