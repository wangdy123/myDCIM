module.exports = [ {
	id : 1,
	name : "实时监控",
	childMenus : [ {
		id : 11,
		title : "主页",
		url : "monitor-dashboard.html",
		htmlFileUrl : "/dashboard-dashboard.html",
		border : false,
		name : "主页"
	}, {
		id : 12,
		title : "监控系统",
		url : "monitor-monitor.html",
		htmlFileUrl : "/monitor.html",
		border : false,
		name : "监控系统"
	}, {
		id : 13,
		title : "告警",
		url : "monitor-alarm.html",
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
		url : "department-config.html",
		htmlFileUrl : "/account/department/department-wokspace.html",
		border : false,
		name : "部门管理"
	}, {
		id : 34,
		title : "角色管理",
		url : "role-config.html",
		htmlFileUrl : "/account/role/role-wokspace.html",
		border : false,
		name : "角色管理"
	}, {
		id : 32,
		title : "人员管理",
		url : "personnel-config.html",
		htmlFileUrl : "/account/personnel/personnel-wokspace.html",
		border : false,
		name : "人员管理"
	}, {
		id : 33,
		title : "帐号管理",
		url : "account-config.html",
		htmlFileUrl : "/account/account/account-wokspace.html",
		border : false,
		name : "帐号管理"
	} ]
}, {
	id : 4,
	name : "基础设施配置",
	childMenus : [ {
		id : 41,
		title : "行政区域配置",
		url : "config-region.html",
		htmlFileUrl : "/configer/region/region-wokspace.html",
		border : false,
		name : "行政区域配置"
	},{
		id : 42,
		title : "园区配置",
		url : "config-station_base.html",
		htmlFileUrl : "/configer/station-base/station-base-wokspace.html",
		border : false,
		name : "园区配置"
	},{
		id : 43,
		title : "机楼配置",
		url : "config-building.html",
		htmlFileUrl : "/configer/building/building-wokspace.html",
		border : false,
		name : "机楼配置"
	},{
		id : 44,
		title : "楼层配置",
		url : "config-floor.html",
		htmlFileUrl : "/configer/floor/floor-wokspace.html",
		border : false,
		name : "楼层配置"
	},{
		id : 45,
		title : "机房配置",
		url : "config-room.html",
		htmlFileUrl : "/configer/room/room-wokspace.html",
		border : false,
		name : "机房配置"
	} ]
} , {
	id : 5,
	name : "动环设施配置",
	childMenus : [ {
		id : 51,
		title : "环境设施配置",
		url : "config-environment.html",
		htmlFileUrl : "/configer/environment/environment-wokspace.html",
		border : false,
		name : "环境设施配置"
	},{
		id : 52,
		title : "动力设施配置",
		url : "config-power.html",
		htmlFileUrl : "/configer/power/power-wokspace.html",
		border : false,
		name : "动力设施配置"
	},{
		id : 53,
		title : "安防设施配置",
		url : "config-safety.html",
		htmlFileUrl : "/configer/safety/safety-wokspace.html",
		border : false,
		name : "安防设施配置"
	}]
} , {
	id : 6,
	name : "IT配置",
	childMenus : [ {
		id : 61,
		title : "服务器配置",
		url : "config-server.html",
		htmlFileUrl : "/configer/server/server-wokspace.html",
		border : false,
		name : "服务器配置"
	},{
		id : 62,
		title : "交换机配置",
		url : "config-switch.html",
		htmlFileUrl : "/configer/switch/switch-wokspace.html",
		border : false,
		name : "交换机配置"
	},{
		id : 63,
		title : "路由器配置",
		url : "config-route.html",
		htmlFileUrl : "/configer/route/route-wokspace.html",
		border : false,
		name : "路由器配置"
	},{
		id : 64,
		title : "终端设备配置",
		url : "config-terminal-equipment.html",
		htmlFileUrl : "/configer/terminal/terminal-equipment-wokspace.html",
		border : false,
		name : "终端设备配置"
	} ]
} ];