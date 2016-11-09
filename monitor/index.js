var app = require('./app');

app.get('/page.html', function(req, res) {
	try {
		res.render('device', {});
	} catch (e) {
		console.log(e);
	}
});

app.get('/treeNode', function(req, res) {
	res.send([ {
		"id" : 1,
		"text" : "Folder1",
		"iconCls" : "icon-save",
		attributes:{data:"datas"}
	}, {
		"text" : "Languages",
		state:"closed"
	} ]);
});
module.exports = app;