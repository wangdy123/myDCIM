$(function() {
	var alarmUrl = "alarm/historyAlarms";
	var $node = $('#history-alarm-datagrid');

	function isLeaf(data) {
		var childTypes = WUI.objectTypes[data.OBJECT_TYPE].childTypes;
		if (!childTypes || childTypes.length === 0) {
			return true;
		}
		return false;
	}

	$('#alarm-filter-object').combotree({
		url : 'logicobject/objectNodes',
		method : 'get',
		lines : true,
		dnd : true,
		animate : true,
		iconWidth : 22,
		icons : [ {
			iconCls : 'icon-delete',
			handler : function() {
				$('#alarm-filter-object').combotree("clear");
			}
		} ],
		loadFilter : function(datas, parent) {
			var objects = [];
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				objects.push({
					id : data.ID,
					text : data.NAME,
					state : isLeaf(data) ? "open" : "closed",
					iconCls : WUI.objectTypes[data.OBJECT_TYPE].iconCls,
					attributes : {
						data : data
					}
				});
			}
			return objects;
		}
	});

	$('#alarm-filter-type').combobox({
		valueField : 'type',
		textField : 'name',
		data : WUI.alarmTypes,
		multiple : true,
		iconWidth : 22,
		icons : [ {
			iconCls : 'icon-delete',
			handler : function() {
				$('#alarm-filter-type').combobox("clear");
			}
		} ]
	});
	$('#alarm-filter-level').combobox({
		valueField : 'level',
		textField : 'name',
		multiple : true,
		data : WUI.alarmLevels.levels,
		iconWidth : 22,
		icons : [ {
			iconCls : 'icon-delete',
			handler : function() {
				$('#alarm-filter-level').combobox("clear");
			}
		} ]
	});
	$('#alarm-filter-device-type').combobox({
		valueField : 'type',
		textField : 'name',
		showItemIcon : true,
		data : WUI.deviceTypes,
		iconWidth : 22,
		multiple : true,
		icons : [ {
			iconCls : 'icon-delete',
			handler : function() {
				$('#alarm-filter-device-type').combobox("clear");
			}
		} ]
	});

	$('#alarm-filter-arise-startDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	$('#alarm-filter-arise-endDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	$('#alarm-filter-recover-startDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	$('#alarm-filter-recover-endDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	function seachAlarm() {
		var param = {};
		var objectId = $('#alarm-filter-object').combotree('getValue');
		if (objectId) {
			param.objectId = parseInt(objectId, 10);
		}
		var alarmType = $('#alarm-filter-type').combobox('getValues');
		if (alarmType && alarmType.length > 0) {
			param.alarmType = "" + alarmType;
		}
		var alarmLevel = $('#alarm-filter-level').combobox('getValues');
		if (alarmLevel && alarmLevel.length > 0) {
			param.alarmLevel = "" + alarmLevel;
		}
		var deviceType = $('#alarm-filter-device-type').combobox('getValues');
		if (deviceType && deviceType.length > 0) {
			param.deviceType = "" + deviceType;
		}
		var ariseStartDate = $('#alarm-filter-arise-startDate').datebox('getValue');
		if (ariseStartDate) {
			param.ariseStartDate = WUI.timeformat_t(ariseStartDate);
		}
		var ariseEndDate = $('#alarm-filter-arise-endDate').datebox('getValue');
		if (ariseEndDate) {
			param.ariseEndDate = WUI.timeformat_t(ariseEndDate);
		}
		var recoverStartDate = $('#alarm-filter-recover-startDate').datebox('getValue');
		if (recoverStartDate) {
			param.recoverStartDate = WUI.timeformat_t(recoverStartDate);
		}
		var recoverEndDate = $('#alarm-filter-recover-endDate').datebox('getValue');
		if (recoverEndDate) {
			param.recoverEndDate = WUI.timeformat_t(recoverEndDate);
		}
		if (!ariseStartDate && !recoverStartDate) {
			$.messager.alert('提示', "请选择告警开始时间或告警恢复时间范围！");
			return;
		}
		$node.datagrid("load", param);
	}
	$('#alarm-filter-search-btn').click(seachAlarm);
	$('#alarm-filter-export-btn').click(
			function() {
				var querys = [];
				var objectId = $('#alarm-filter-object').combotree('getValue');
				if (objectId) {
					querys.push("objectId=" + objectId);
				}
				var alarmType = $('#alarm-filter-type').combobox('getValues');
				if (alarmType) {
					querys.push("alarmType=" + alarmType);
				}
				var alarmLevel = $('#alarm-filter-level').combobox('getValues');
				if (alarmLevel) {
					querys.push("alarmLevel=" + alarmLevel);
				}
				var deviceType = $('#alarm-filter-device-type').combobox('getValues');
				if (deviceType) {
					querys.push("deviceType=" + deviceType);
				}
				var ariseStartDate = $('#alarm-filter-arise-startDate').datebox('getValue');
				if (ariseStartDate) {
					querys.push("ariseStartDate=" + WUI.timeformat_t(ariseStartDate));
				}
				var ariseEndDate = $('#alarm-filter-arise-endDate').datebox('getValue');
				if (ariseEndDate) {
					querys.push("ariseEndDate=" + WUI.timeformat_t(ariseEndDate));
				}
				var recoverStartDate = $('#alarm-filter-recover-startDate').datebox('getValue');
				if (recoverStartDate) {
					querys.push("recoverStartDate=" + WUI.timeformat_t(recoverStartDate));
				}
				var recoverEndDate = $('#alarm-filter-recover-endDate').datebox('getValue');
				if (recoverEndDate) {
					querys.push("recoverEndDate=" + WUI.timeformat_t(recoverEndDate));
				}
				if (!ariseStartDate && !recoverStartDate) {
					$.messager.alert('提示', "请选择告警开始时间或告警恢复时间范围！");
					return;
				}
				var url = alarmUrl + "/历史告警" + WUI.timeformat(new Date()) + ".xlsx"
						+ (querys.length > 0 ? ("?" + querys.join("&")) : "");
				open(url, '_self', 'height=100,width=400, top=0,left=0');
			});

	$node.datagrid({
		url : alarmUrl,
		fit : true,
		border : false,
		method : "get",
		sortName : "alarm_begin",
		sortOrder : "desc",
		singleSelect : true,
		checkOnSelect : false,
		selectOnCheck : false,
		onLoadError : WUI.onLoadError,
		toolbar : '#history-alarm-tool',
		rowStyler : function(value, row, index) {
			for (var i = 0; i < WUI.alarmLevels.levels.length; i++) {
				var level = WUI.alarmLevels.levels[i];
				if (level.level === row.alarm_level) {
					return 'background-color:' + level.color;
				}
			}
		},
		columns : [ [
				{
					title : "",
					field : "light",
					formatter : function(value, row, index) {
						for (var i = 0; i < WUI.alarmLevels.levels.length; i++) {
							var level = WUI.alarmLevels.levels[i];
							if (level.level === row.alarm_level) {
								return '<div class="' + level.iconCls + '" title="' + level.name + '"></div>';
							}
						}
					}
				},
				{
					title : "告警类型",
					width : 80,
					field : "alarm_type",
					formatter : function(value, row, index) {
						var type = WUI.findFromArray(WUI.alarmTypes, "type", row.alarm_type);
						return type ? type.name : "";
					}
				},
				{
					title : "告警节点",
					field : "object_name",
					width : 150,
					formatter : function(value, row, index) {
						return "<a href=\"index.html?page=monitor/monitor.html&objectId=" + row.object_id + "\">"
								+ row.object_name + "</a>";
					}
				}, {
					title : "告警名称",
					sortable : true,
					width : 100,
					field : "alarm_name"
				}, {
					title : "开始时间",
					field : "alarm_begin",
					width : 130,
					sortable : true,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.alarm_begin);
					}
				}, {
					field : "end_time",
					title : "结束时间",
					width : 130,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.end_time);
					}
				}, {
					width : 100,
					title : "告警描述",
					field : "alarm_desc"
				}, {
					width : 100,
					title : "告警级别",
					sortable : true,
					field : "alarm_level",
					formatter : function(value, row, index) {
						for (var i = 0; i < WUI.alarmLevels.levels.length; i++) {
							var level = WUI.alarmLevels.levels[i];
							if (level.level === row.alarm_level) {
								return level.name;
							}
						}
					}
				}, {
					width : 100,
					title : "告警值",
					align : 'right',
					field : "alarm_value"
				}, {
					width : 100,
					title : "持续时间",
					field : "continued",
					formatter : function(value, row, index) {
						WUI.timeDiff(WUI.date_parse(row.alarm_begin), WUI.date_parse(endTime));
					}
				}, {
					width : 130,
					title : "确认时间",
					field : "ack_time",
					sortable : true,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.ack_time);
					}
				}, {
					width : 80,
					title : "确认人",
					field : "ack_user"
				}, {
					width : 150,
					title : "确认描述",
					field : "reason"
				} ] ],
		view : detailview,
		detailFormatter : function(rowIndex, row) {
			var alarmLevel = "";
			for (var i = 0; i < WUI.alarmLevels.levels.length; i++) {
				var level = WUI.alarmLevels.levels[i];
				if (level.level === row.alarm_level) {
					alarmLevel = level.name;
				}
			}
			var type = WUI.findFromArray(WUI.alarmTypes, "type", row.alarm_type);
			type = type ? type.name : "";
			return '<table class="grid-detail"><tr><th>告警类型:</th><td>' + type + '</td><th>告警级别:</th><td>' + alarmLevel
					+ '</td></tr><tr><th>告警节点:</th><td>' + row.object_name + '</td><th>告警名称:</th><td>' + row.alarm_name
					+ '</td></tr><tr><th>开始时间:</th><td>' + WUI.timeformat(row.alarm_begin) + '</td><th>结束时间:</th><td>'
					+ WUI.timeformat(row.end_time) + '</td></tr><tr><th>持续时间:</th><td>'
					+ WUI.timeDiff(WUI.date_parse(row.alarm_begin), WUI.date_parse(endTime))
					+ '</td><th>告警描述:</th><td>' + row.alarm_desc + '</td></tr><tr><th>告警值:</th><td>' + row.alarm_value
					+ '</td><th>确认时间:</th><td>' + WUI.timeformat(row.ack_time) + '</td></tr><tr><th>确认人:</th><td>'
					+ row.ack_user + '</td><th>确认描述:</th><td>' + row.reason + '</td></tr></table>';
		}
	});
});
