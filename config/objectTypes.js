module.exports.objectTypeDef = {
	CSC : 1,
	LSC : 2,
	REGION : 3,
	STATION : 4,
	BUILDDING : 5,
	ROOM : 6
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
		childTypes : [ 3, 4 ]
	},
	3 : {
		name : "县区域",
		iconCls : "icon-region",
		childTypes : [ 4 ]
	},
	4 : {
		name : "园区",
		iconCls : "icon-region",
		childTypes : [ 5, 6 ]
	},
	5 : {
		name : "机楼",
		iconCls : "icon-region",
		childTypes : [ 6 ]
	},
	6 : {
		name : "机房",
		iconCls : "icon-region",
		childTypes : [ 7 ]
	},
	7 : {
		name : "机柜列",
		iconCls : "icon-region",
		childTypes : [ 8, 9 ]
	},
	8 : {
		name : "机柜",
		iconCls : "icon-region",
		childTypes : [ 9, 10, 11 ]
	},
	9 : {
		name : "动环设备",
		iconCls : "icon-region",
		childTypes : []
	},
	10 : {
		name : "网络设备",
		iconCls : "icon-region",
		childTypes : []
	},
	11 : {
		name : "服务器",
		iconCls : "icon-region",
		childTypes : []
	}
};