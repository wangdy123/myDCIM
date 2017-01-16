module.exports.objectTypeDef = {
	CSC : 1,
	LSC : 2,
	REGION : 3,
	STATION_BASE : 4,
	BUILDDING : 5,
	FLOOR : 6,
	ROOM : 7,
	CABINNET_COLUMN : 11,
	CABINNET : 12,
	ENV_DEVICE : 21,
	POWER_DEVICE : 22,
	SAFETY_DEVICE : 23,
	IT_DEVICE : 24
};

module.exports.objectTypes = {
	1 : {
		name : "省中心",
		iconCls : "icon-csc",
		childTypes : [ 2 ]
	},
	2 : {
		name : "市区域",
		iconCls : "icon-lsc",
		childTypes : [ 3, 4 ],
		configerPage : "../configer/object/lsc/wokspace.html"
	},
	3 : {
		name : "县区域",
		iconCls : "icon-region",
		childTypes : [ 4 ],
		configerPage : "../configer/object/region/wokspace.html"
	},
	4 : {
		name : "园区",
		iconCls : "icon-station",
		childTypes : [ 5, 7 ],
		configerPage : "../configer/object/station-base/wokspace.html"
	},
	5 : {
		name : "机楼",
		iconCls : "icon-building",
		childTypes : [ 6, 7 ],
		configerPage : "../configer/object/building/building-wokspace.html"
	},
	6 : {
		name : "楼层",
		iconCls : "icon-floor",
		childTypes : [ 7 ],
		configerPage : "../configer/object/floor/floor-wokspace.html"
	},
	7 : {
		name : "机房",
		iconCls : "icon-room",
		childTypes : [ 11, 21, 22, 23 ],
		configerPage : "../configer/object/room/room-wokspace.html"
	},
	11 : {
		name : "机柜列",
		iconCls : "icon-cabinet-column",
		childTypes : [ 12 ],
		configerPage : "../configer/object/cabinet-column/wokspace.html"
	},
	12 : {
		name : "机柜",
		iconCls : "icon-region",
		childTypes : [ 24 ],
		configerPage : "../configer/object/cabinet/wokspace.html"
	},
	21 : {
		name : "环境设备",
		iconCls : "icon-device"
	},
	22 : {
		name : "动力设备",
		iconCls : "icon-device"
	},
	23 : {
		name : "安防设备",
		iconCls : "icon-device"
	},
	24 : {
		name : "IT设备",
		iconCls : "icon-devModule"
	}
};