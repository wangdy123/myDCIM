$(function() {
	var alarmUrl = "alarm/activeAlarms";
	var $node = $('#active-alarm-datagrid');
	if (WUI.alarmWs_init) {
		return;
	}
	WUI.alarmWs_init = true;

	function isLeaf(data) {
		if (!WUI.objectTypes[data.OBJECT_TYPE].childTypes) {
			return true;
		}
		return false;
	}

	function getIconCls(data) {
		try {
			return WUI.objectTypes[data.OBJECT_TYPE].iconCls;
		} catch (e) {
			console.log(data.OBJECT_TYPE);
			console.log(e);
			return "";
		}
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
				$('#alarm-filter-level').combobox("clear");
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
					iconCls : getIconCls(data),
					attributes : {
						data : data
					}
				});
			}
			console.log(objects);
			return objects;
		}
	});

	$('#alarm-filter-type').combobox({
		editable : false,
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

	}
	$('#alarm-filter-search-btn').click(seachAlarm);
	$('#alarm-filter-export-btn').click(function() {

	});
	$('#alarm-filter-ack-btn').click(function() {

	});
	$('#alarm-filter-reason-btn').click(function() {

	});
	$('#alarm-filter-cancel-btn').click(function() {

	});
	$node.datagrid({
		url : alarmUrl,
		fit : true,
		border : false,
		method : "get",
		sortName : "alarm_begin",
		sortOrder : "desc",
		singleSelect : true,
		checkOnSelect : true,
		onLoadError : WUI.onLoadError,
		toolbar : '#active-alarm-tool',
		columns : [ [
				{
					field : 'ck',
					checkbox : true,
				},
				{
					title : "告警类型",
					width : 100,
					field : "alarm_type"
				},
				{
					title : "开始时间",
					field : "alarm_begin",
					width : 100,
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
						return "<a href=\"index.html?objectId=" + row.OBJECT_ID + "\">" + row.object_name + "</a>";
					}
				},
				{
					title : "告警名称",
					sortable : true,
					width : 100,
					field : "alarm_name"
				},
				{
					field : "alarm_end",
					title : "结束时间",
					width : 100,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.alarm_end);
					}
				},
				{
					width : 100,
					title : "告警描述",
					field : "alarm_desc"
				},
				{
					width : 100,
					title : "告警级别",
					sortable : true,
					field : "alarm_level"
				},
				{
					width : 100,
					title : "告警值",
					align : 'right',
					field : "alarm_value"
				},
				{
					width : 100,
					title : "持续时间",
					field : "alarmBegin",
					formatter : function(value, row, index) {
						var endTime = new Date();
						return WUI.timediffFormat(WUI.date_parse(row.alarm_begin), endTime);
					}
				},
				{
					width : 100,
					title : "确认时间",
					field : "ack_time",
					sortable : true,
					formatter : function(value, row, index) {
						return WUI.timeformat(row.ack_time);
					}
				},
				{
					width : 100,
					title : "原因描述",
					field : "reason"
				},
				{
					field : 'action',
					title : '操作',
					width : 100,
					align : 'center',
					formatter : function(value, row, index) {
						var d = '<div class="icon-detail operator-tool" title="查看详情" '
								+ ' onclick="WUI.activeAlarm.viewDetail(this)"></div>';
						return d;
					}
				} ] ]
	});

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
