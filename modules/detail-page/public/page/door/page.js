$(document).ready(function() {
	var publisherName = "detail";
	var objectNodeUrl = 'logicobject/objectNodes';
	var doorStatusUrl = "door/doorStatus";
	var doorRecordUrl = "door/doorRecords";
	var doorAuthUrl = "door/doorAuths";
	var openDoorUrl = "door/openDoor";

	var currentObject = null;
	WUI.door = WUI.door ? WUI.door : {};

	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;
		requestDoorStatus();
		reloadRecord();
		reloadDoorAuth();
	}
	function requestDoorStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		if (!currentObject) {
			WUI.detail.realtimeValueTimer = setTimeout(requestDoorStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			return;
		}
		WUI.ajax.get(doorStatusUrl + "/" + currentObject.ID, {}, function(doorStatus) {
			WUI.detail.realtimeValueTimer = setTimeout(requestDoorStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			setDoorStatus(doorStatus);
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestDoorStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}

	function setDoorStatus(doorStatus) {
		if (doorStatus.openStatus == 0) {
			$('#imgDoor').html("<div class=\"door_closed_bmp\"></div>");
			$('#imgDoorStatus').html("<div class=\"door_closed_icon\"></div>");
		} else if (doorStatus.openStatus == 1) {
			$('#imgDoor').html("<div class=\"door_opened_bmp\"></div>");
			$('#imgDoorStatus').html("<div class=\"door_opened_icon\"></div>");
		} else {
			$('#imgDoor').html("<div class=\"door_invalid_bmp\"></div>");
			$('#imgDoorStatus').html("<div class=\"door_invalid_icon\"></div>");
		}

		var lastEvent = doorStatus.lastEvent;
		if (lastEvent) {
			$('#lblDoorUserName').text(lastEvent.userName);
			$('#lblCardNo').text(lastEvent.cardNo);
			$('#lblDoorEventTypeName').text(lastEvent.eventTypeName);
			$('#lblDoorRecordTime').text(lastEvent.recordTime);
		}
	}

	function reloadRecord() {
		if (!currentObject) {
			return;
		}
		$('#record-datagrid').datagrid("reload", {
			url : doorRecordUrl,
			doorId : currentObject.ID
		});
	}
	function reloadDoorAuth() {
		if (!currentObject) {
			return;
		}
		$('#door-auth-datagrid').datagrid("reload", {
			url : doorAuthUrl,
			doorId : currentObject.ID
		});
	}

	function initDoorStatus() {
		WUI.door.openDoor = function() {
			if (!currentObject) {
				$.messager.alert('失败', "请选择要打开的门禁设备！");
				return;
			}
			$.messager.confirm('远程开门', '确认要远程开门吗？', function(r) {
				if (r) {
					WUI.ajax.postJson(openDoorUrl + "/" + currentObject.ID, {}, function() {
						$.messager.alert('成功', "开门指令发送成功！");
					}, function() {
						$.messager.alert('失败', "开门指令发送失败！");
					});
				}
			});
		};
	}

	function initRecordGrid() {
		$('#record-datagrid').datagrid({
			method : "get",
			toolbar : [ {
				iconCls : 'icon-reload',
				handler : function() {
					reloadRecord();
				}
			} ],
			singleSelect : true,
			columns : [ [ {
				field : 'RECORD_TIME',
				title : '时间',
				width : 100
			}, {
				field : 'EVENT_TYPE_NAME',
				title : '事件类型',
				width : 150
			}, {
				field : 'CARD_NO',
				title : '卡号',
				width : 150
			}, {
				field : 'PERSONNEL',
				title : '持卡人姓名',
				width : 150
			}, {
				field : 'DEPARTMENT',
				title : '持卡人部门',
				width : 150
			} ] ]
		});
	}

	function initDoorAuthGrid() {
		$('#door-auth-datagrid').datagrid({
			method : "get",
			toolbar : [ {
				iconCls : 'icon-reload',
				handler : function() {
					reloadDoorAuth();
				}
			} ],
			singleSelect : true,
			columns : [ [ {
				field : 'action',
				title : '操作',
				width : 100,
				align : 'center',
				formatter : function(value, row, index) {
					if (row.AUTH_STATUS) {
						return '<div class="card-unauth" title="解除授权" onclick="WUI.door.doorRemoveAuth(this)"></div> ';
					} else {
						return '<div class="card-auth" title="授权" onclick="WUI.door.doorAddAuth(this)"></div>';
					}
				}
			}, {
				field : 'CARD_NO',
				title : '卡号',
				width : 150
			}, {
				field : 'PERSONNEL',
				title : '持卡人姓名',
				width : 150
			}, {
				field : 'DEPARTMENT',
				title : '持卡人部门',
				width : 150
			}, {
				field : 'AUTH_TIME',
				title : '授权时间',
				width : 150
			}, {
				field : 'AUTH_STATUS',
				title : '授权状态',
				width : 150
			} ] ]
		});

		WUI.door.doorAddAuth = function(target) {
			var auth = WUI.getDatagridRow($('#door-auth-datagrid'), target);
			$.messager.confirm('确认', '确定要授权卡【' + auth.CARD_NO + '】吗?', function(r) {
				if (r) {
					WUI.ajax.postJson(doorAuthUrl + "/" + currentObject.ID, {
						CARD_NO : auth.CARD_NO
					}, function() {
						reloadDoorAuth();
					}, function() {
						$.messager.alert('失败', "授权失败！");
					});
				}
			});
		};
		WUI.door.doorAddAuth = function(target) {
			var auth = WUI.getDatagridRow($('#door-auth-datagrid'), target);
			$.messager.confirm('确认', '确定要解除卡【' + auth.CARD_NO + '】的授权吗?', function(r) {
				if (r) {
					WUI.ajax.remove(doorAuthUrl + "/" + currentObject.ID, {
						CARD_NO : auth.CARD_NO
					}, function() {
						reloadDoorAuth();
					}, function() {
						$.messager.alert('失败', "解除卡授权失败！");
					});
				}
			});
		};
	}
	initDoorStatus();
	initDoorAuthGrid();
	initRecordGrid();
	window.WUI.publishEvent("request_current_object", {
		publisher : publisherName,
		cbk : function(object) {
			openObject(object);
		}
	});
});