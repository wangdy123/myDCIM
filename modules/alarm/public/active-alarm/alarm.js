$(function() {
	var alarmUrl = "alarm/activeAlarms";
	var finishAlarmUrl = "alarm/finishAlarm";
	var alarmReasonUrl = "alarm/alarmReason";
	var alarmAckUrl = "alarm/alarmAck";
	var $node = $('#active-alarm-datagrid');
	if (WUI.alarmWs_init) {
		return;
	}
	WUI.alarmWs_init = true;

	function isLeaf(data) {
		if (!WUI.objectTypes[data.OBJECT_TYPE].childTypes || WUI.objectTypes[data.OBJECT_TYPE].childTypes.length === 0) {
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
					state : !isLeaf(data) ? "open" : "closed",
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
		icons : [ {
			iconCls : 'icon-delete',
			handler : function() {
				$('#alarm-filter-device-type').combobox("clear");
			}
		} ]
	});

	$('#alarm-filter-startDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	$('#alarm-filter-endDate').datebox({
		parser : WUI.date_parse,
		formatter : WUI.dateFormat
	});

	function seachAlarm() {
		var param = {};
		var objectId = $('#alarm-filter-object').combotree('getValue');
		if (objectId) {
			param.objectId = parseInt(objectId, 10);
		}
		var alarmType = $('#alarm-filter-type').combobox('getValue');
		if (alarmType) {
			param.alarmType = parseInt(alarmType, 10);
		}
		var alarmLevel = $('#alarm-filter-level').combobox('getValue');
		if (alarmLevel) {
			param.alarmLevel = parseInt(alarmLevel, 10);
		}
		var deviceType = $('#alarm-filter-device-type').combobox('getValue');
		if (deviceType) {
			param.deviceType = parseInt(deviceType, 10);
		}
		var startDate = $('#alarm-filter-startDate').datebox('getValue');
		if (startDate) {
			param.startDate = WUI.timeformat_t(startDate);
		}
		var endDate = $('#alarm-filter-endDate').datebox('getValue');
		if (endDate) {
			param.endDate = WUI.timeformat_t(endDate);
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
				var alarmType = $('#alarm-filter-type').combobox('getValue');
				if (alarmType) {
					querys.push("alarmType=" + alarmType);
				}
				var alarmLevel = $('#alarm-filter-level').combobox('getValue');
				if (alarmLevel) {
					querys.push("alarmLevel=" + alarmLevel);
				}
				var deviceType = $('#alarm-filter-device-type').combobox('getValue');
				if (deviceType) {
					querys.push("deviceType=" + deviceType);
				}
				var startDate = $('#alarm-filter-startDate').datebox('getValue');
				if (startDate) {
					querys.push("startDate=" + WUI.timeformat_t(startDate));
				}
				var endDate = $('#alarm-filter-endDate').datebox('getValue');
				if (endDate) {
					querys.push("endDate=" + WUI.timeformat_t(endDate));
				}
				var url = alarmUrl + "/活动告警" + WUI.timeformat(new Date()) + ".xlsx"
						+ (querys.length > 0 ? ("?" + querys.join("&")) : "");
				open(url, '_self', 'height=100,width=400, top=0,left=0');
			});

	function showReasonDialog(title, msg, iconCls, okHandler) {
		$('#alarm-reason-dialog').dialog({
			iconCls : iconCls,
			title : title,
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : 'alarm/active-alarm/alarm-reason-dialog.html',
			onLoad : function() {
				$('#message-txt').text(msg);
			},
			modal : true,
			onClose : function() {
				$('#alarm-reason-dialog').empty();
			},
			buttons : [ {
				text : '确定',
				handler : function() {
					okHandler($('#reason-txt').val(), $('#password-txt').val());
					$('#alarm-reason-dialog').dialog("close");
				}
			}, {
				text : '取消',
				handler : function() {
					$('#alarm-reason-dialog').dialog("close");
				}
			} ]
		});
	}
	$('#alarm-filter-ack-btn').click(function() {
		var checkeds = $node.datagrid("getChecked");
		var actives = [];
		checkeds.forEach(function(record) {
			if (!record.is_acked) {
				actives.push(record);
			}
		});
		if (actives.length > 0) {
			showReasonDialog("告警处理", "请输入告警原因", 'icon-use', function(reason, password) {
				var alarms = [];
				for (var i = 0; i < actives.length; i++) {
					var obj = {
						object_id : actives[i].object_id,
						signal_id : actives[i].signal_id,
						alarm_begin : actives[i].alarm_begin,
						reason : reason
					};
					alarms.push(obj);
				}

				WUI.ajax.put(alarmAckUrl, {
					alarms : alarms,
					password : password
				}, function() {
					seachAlarm();
				}, function() {
					$.messager.alert('失败', "确认告警失败！");
				});
			});

		} else {
			$.messager.alert('提示', "请选择未处理告警！");
		}
	});
	$('#alarm-filter-reason-btn').click(function() {
		var checkeds = $node.datagrid("getChecked");
		if (checkeds.length > 0) {
			showReasonDialog("告警原因", "确定要设置告警原因吗？", 'icon-edit', function(reason, password) {
				var alarms = [];
				for (var i = 0; i < checkeds.length; i++) {
					var obj = {
						object_id : checkeds[i].object_id,
						signal_id : checkeds[i].signal_id,
						alarm_begin : checkeds[i].alarm_begin,
						reason : reason
					};
					alarms.push(obj);
				}

				WUI.ajax.put(alarmReasonUrl, {
					alarms : alarms,
					password : password
				}, function() {
					seachAlarm();
				}, function() {
					$.messager.alert('失败', "设置告警原因失败！");
				});
			});

		} else {
			$.messager.alert('提示', "请选择告警！");
		}
	});
	$('#alarm-filter-cancel-btn').click(function() {
		var checkeds = $node.datagrid("getChecked");
		var actives = [];
		checkeds.forEach(function(record) {
			if (!record.is_finished) {
				actives.push(record);
			}
		});
		if (actives.length > 0) {
			showReasonDialog("取消告警", "确定要强制取消选中的告警吗？", 'icon-cancel', function(reason, password) {
				var alarms = [];
				for (var i = 0; i < actives.length; i++) {
					var obj = {
						object_id : actives[i].object_id,
						signal_id : actives[i].signal_id,
						alarm_begin : actives[i].alarm_begin,
						reason : reason
					};
					alarms.push(obj);
				}

				WUI.ajax.put(finishAlarmUrl, {
					alarms : alarms,
					password : password
				}, function() {
					seachAlarm();
				}, function() {
					$.messager.alert('失败', "结束告警失败！");
				});
			});

		} else {
			$.messager.alert('提示', "请选择未结束告警！");
		}
	});
	WUI.activeAlarm = WUI.activeAlarm || {};
	function isAlarmInArray(row, records) {
		for (var i = 0; i < records.length; i++) {
			if (records[i] === row) {
				return true;
			}
		}
		return false;
	}
	function checkAlarmDiff() {
		if (WUI.activeAlarm.TimeDiffTimer) {
			clearTimeout(WUI.activeAlarm.TimeDiffTimer);
			WUI.activeAlarm.TimeDiffTimer = null;
		}
		var datas = $node.datagrid("getRows");
		var endTime = new Date();
		var checkeds = $node.datagrid("getChecked");
		for (var i = 0; i < datas.length; i++) {
			if (!datas[i].is_finished) {
				var row = $node.datagrid("getRows")[i];
				$node.datagrid('updateRow', {
					index : i,
					row : {
						continued : WUI.timeDiff(WUI.date_parse(row.alarm_begin), endTime),
					}
				});
				if (isAlarmInArray(datas[i], checkeds)) {
					$node.datagrid("checkRow", i);
				}
			}
		}
		WUI.activeAlarm.TimeDiffTimer = setTimeout(checkAlarmDiff, 1000);
	}

	$node.datagrid({
		url : alarmUrl,
		fit : true,
		border : false,
		method : "get",
		sortName : "alarm_begin",
		sortOrder : "desc",
		singleSelect : true,
		checkOnSelect : true,
		selectOnCheck : false,
		onLoadError : WUI.onLoadError,
		toolbar : '#active-alarm-tool',
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
					field : 'ck',
					checkbox : true,
				},
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
					field : 'action',
					align : 'center',
					formatter : function(value, row, index) {
						var d = '<div class="icon-detail operator-tool" title="查看详情" '
								+ ' onclick="WUI.activeAlarm.viewDetail(this)"></div>';
						return d;
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
					title : "开始时间",
					field : "alarm_begin",
					width : 130,
					sortable : true,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.alarm_begin);
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
					field : "is_finished",
					title : "结束时间",
					width : 130,
					formatter : function(value, row, index) {
						if (row.is_finished) {
							return WUI.timeformat(row.alarm_end);
						} else {
							return "<活动告警>";
						}
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
					field : "continued"
				}, {
					width : 130,
					title : "处理时间",
					field : "is_acked",
					sortable : true,
					formatter : function(value, row, index) {
						if (row.is_acked) {
							return WUI.timeformat(row.ack_time);
						} else {
							return "<未处理>";
						}
					}
				}, {
					width : 150,
					title : "原因描述",
					field : "reason"
				} ] ]
	});
	checkAlarmDiff();

	var ws = new WebSocket('ws://' + location.host + '/alarm/alarm-ws');
	ws.onmessage = function(e) {
		console.log(e.data);
		// ws.send('data');
	};
	ws.onerror = function(err) {
		console.log('_error');
		console.log(err);
	};
	ws.onopen = function() {
		console.log('_connect');
		ws.send('data');
	};
	ws.onclose = function() {
		console.log('_close');
	};
});
