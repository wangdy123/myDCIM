module.exports.getHtmlBaseInfo = function(req, res) {
	return {
		userName : "admin",
		theme : req.cookies.theme ? req.cookies.theme : "default",
		themes : [ {
			name : "bootstrap",
			type : "bootstrap"
		}, {
			name : "default",
			type : "default"
		}, {
			name : "black",
			type : "black"
		}, {
			name : "gray",
			type : "gray"
		}, {
			name : "material",
			type : "material"
		}, {
			name : "metro",
			type : "metro"
		}, {
			name : "metro-blue",
			type : "metro-blue"
		} , {
			name : "metro-green",
			type : "metro-green"
		} , {
			name : "ui-dark-hive",
			type : "ui-dark-hive"
		}  ],
		menus : [ {
			id : 1,
			name : "监控系统m",
			selected:false,
			childMenus : [ {
				url : "/apps/monitor.html",
				name : "监控系统s"
			}, {
				url : "/apps/monitor.html",
				name : "监控系统s11"
			}, {
				url : "/apps/monitor.html",
				name : "监控系统s12"
			} ]
		}, {
			id : 2,
			name : "监控系统m2",
			selected:true,
			childMenus : [ {
				url : "/apps/monitor.html",
				name : "监控系统s2"
			} ]
		}, {
			id : 3,
			name : "监控系统m2",
			selected:false,
			childMenus : [ {
				url : "/apps/bar.html",
				name : "柱状图"
			} ]
		} ]
	};
};