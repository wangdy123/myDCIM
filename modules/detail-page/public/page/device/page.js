$(function() {
	var signalUrl = 'logicobject/signals';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var statusUrl = 'detail/deviceStatus';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var requestIds = [];

	var $node = $("#child-signal-panel");
	function openObject(deviceObject) {
		currentObject = deviceObject;
		$('#device-name-txt').text(currentObject.NAME);
		$('#device-code-txt').text(currentObject.CODE);
		for (var i = 0; i < WUI.businessTypes.length; i++) {
			if (WUI.businessTypes[i].type === currentObject.BUSINESS_TYPE) {
				$('#device-business-type-txt').text(WUI.businessTypes[i].name);
				break;
			}
		}
		for (var i = 0; i < WUI.deviceTypes.length; i++) {
			if (WUI.deviceTypes[i].type === currentObject.DEVICE_TYPE) {
				$('#device-type-txt').text(WUI.deviceTypes[i].name);
				break;
			}
		}

		$('#device-start-use-date').text(WUI.dateFormat(currentObject.START_USE_DATE));
		$('#device-expect-end-date').text(WUI.dateFormat(currentObject.EXPECT_END_DATE));

		WUI.ajax.get(deviceModelUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.MODEL) {
					var model = results[i];
					$('#device-model-txt').text(model.NAME);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取设备型号失败，请重试！");
		});
		WUI.ajax.get(deviceVenderUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.VENDER) {
					var model = results[i];
					$('#device-vender-txt').text(model.NAME);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取设备厂家失败，请重试！");
		});

		$node.datagrid({
			url : signalUrl,
			queryParams : {
				parentId : currentObject.ID
			},
			fit : true,
			border : false,
			method : "get",
			singleSelect : true,
			onLoadError : WUI.onLoadError,
			onLoadSuccess : function(data) {
				signals = data.rows;
				signals.forEach(function(item) {
					requestIds.push({
						objectId : item.OBJECT_ID,
						signalId : item.SIGNAL_ID
					});
				});
				requestStatus();
			},
			columns : [ [
					{
						field : 'icon',
						align : 'center',
						width : 40,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
							if (type) {
								return '<div class="' + type.iconCls + '" title="' + type.name + '"></div> ';
							}
						}
					},
					{
						field : 'SIGNAL_ID',
						title : '信号编码',
						align : 'right',
						width : 80
					},
					{
						field : 'SIGNAL_NAME',
						title : '名称',
						width : 120
					},
					{
						field : 'SIGNAL_TYPE',
						title : '信号类型',
						align : 'center',
						width : 60,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
							if (type) {
								return type.name;
							}
							return "";
						}
					},
					{
						field : 'value',
						title : '当前值',
						width : 120,
						formatter : function(value, row, index) {

							return "";
						}
					},
					{
						field : 'status',
						title : '状态',
						width : 120,
						formatter : function(value, row, index) {

							return "";
						}
					},
					{
						field : 'action',
						title : '操作',
						width : 120,
						align : 'center',
						formatter : function(value, row, index) {
							if (row.SIGNAL_TYPE == 3) {
								return '<a href="#" class="easyui-linkbutton" data-options="iconCls:\'icon-AO\'" '
										+ 'onclick="WUI.detail.remoteCtrlValue(this)">遥调</a>';
							}
							if (row.SIGNAL_TYPE == 4) {
								return '<a href="#" class="easyui-linkbutton" data-options="iconCls:\'icon-DO\'" '
										+ 'onclick="WUI.detail.remoteCtrlValue(this)">遥控</a>';
							}
						}
					} ] ]
		});
	}

	WUI.detail.remoteCtrlValue = function(target) {
		var signal = WUI.getDatagridRow($node, target);

	};
	
	function setAlarmCount(alarmCount) {
		if (alarmCount) {
			$("#device-alarmLevel1-count").text(alarmCount.alarmLevel1Count);
			$("#device-alarmLevel2-count").text(alarmCount.alarmLevel2Count);
			$("#device-alarmLevel3-count").text(alarmCount.alarmLevel3Count);
			$("#device-alarmLevel4-count").text(alarmCount.alarmLevel4Count);
		}
	}
	function setValue(signalValues) {
		var rows=$node.datagrid('getRows');
		signalValues.forEach(function(value){
			for(var i=0;i<rows.length;i++){
				var row=rows[i];
				row.value=value;
				if (row.OBJECT_ID === value.objectId && row.SIGNAL_ID === value.signalId) {
					$node.datagrid('updateRow',{
						index: i,
						row
					});
				}
			}
		});
	}
	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		if (requestIds.length <= 0) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			return;
		}

		WUI.ajax.post(statusUrl, {
			objectId : currentObject.ID,
			requestIds : requestIds
		}, function(result) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			if (result.alarmCount) {
				setAlarmCount(result.alarmCount);
			}
			if (result.signalValues) {
				setValue(result.signalValues);
			}
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			openObject(object);
		}
	});

});
