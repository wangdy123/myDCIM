module.exports = [ {
	id : 1,
	name : "实时监控",
	childMenus : [ {
		id : 11,
		title : "监控系统",
		url : "dashboard.html",
		htmlFileUrl : "/dashboard/dashboard.html",
		border : false,
		name : "主页"
	}, {
		id : 11,
		title : "监控系统",
		url : "monitor.html",
		htmlFileUrl : "/monitor.html",
		border : false,
		name : "监控系统"
	}, {
		id : 12,
		title : "监控系统",
		url : "alarm.html",
		htmlFileUrl : "/alarm.html",
		border : true,
		name : "告警"
	} ]
}, {
	id : 3,
	name : "权限管理",
	childMenus : [ {
		id : 31,
		title : "部门管理",
		url : "department.html",
		htmlFileUrl : "/account/department/department-wokspace.html",
		border : false,
		name : "部门管理"
	}, {
		id : 34,
		title : "角色管理",
		url : "role.html",
		htmlFileUrl : "/account/role/role-wokspace.html",
		border : false,
		name : "角色管理"
	}, {
		id : 32,
		title : "人员管理",
		url : "personnel.html",
		htmlFileUrl : "/account/personnel/personnel-wokspace.html",
		border : false,
		name : "人员管理"
	}, {
		id : 33,
		title : "帐号管理",
		url : "account.html",
		htmlFileUrl :"/account/account/account-wokspace.html",
		border : false,
		name : "帐号管理"
	} ]
} ];