$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var deviceUrl = "logicobject/devices";
	var $node = $('#device-datagrid');
	var typeName = WUI.objectTypes[WUI.objectTypeDef.DEVICE].name;
	var deviceModels = [];
	var deviceVenders = [];
	WUI.device = WUI.device || {};

	var currentObject = null;
	function reload(publish) {
		$node.datagrid("reload");
		if (publish) {
			WUI.publishEvent('reload_object', {
				publisher : "device-configer",
				object : currentObject
			});
		}
	}

	function openObject(object) {
		currentObject = object;
		$node.datagrid({
			url : deviceUrl,
			queryParams : {
				parentId : currentObject.ID
			},
			fit : true,
			border : false,
			method : "get",
			singleSelect : true,
			onLoadError : WUI.onLoadError,
			toolbar : [ {
				iconCls : 'icon-add',
				text : '添加设备',
				handler : function() {
					deviceDialog(null, currentObject);
				}
			}, '-', {
				iconCls : 'icon-reload',
				text : '刷新',
				handler : function() {
					reload(true);
				}
			} ],
			columns : [ [
					{
						field : 'action',
						title : '操作',
						width : 100,
						align : 'center',
						formatter : function(value, row, index) {
							var e = '<div class="icon-edit operator-tool" title="修改" '
									+ ' onclick="WUI.device.editrow(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.device.deleterow(this)"></div>';
							return e + s + d;
						}
					}, {
						field : 'CODE',
						title : '编码',
						align : 'right',
						width : 100
					}, {
						field : 'NAME',
						title : '名称',
						width : 150
					}, {
						field : 'BUSINESS_TYPE',
						title : '专业类别',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < WUI.businessTypes.length; i++) {
								if (WUI.businessTypes[i].type === row.BUSINESS_TYPE) {
									return WUI.businessTypes[i].name;
								}
							}
							return "";
						}
					}, {
						field : 'DEVICE_TYPE',
						title : '设备类型',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < WUI.deviceTypes.length; i++) {
								if (WUI.deviceTypes[i].type === row.DEVICE_TYPE) {
									return WUI.deviceTypes[i].name;
								}
							}
							return "";
						}
					}, {
						field : 'vender',
						title : '设备厂家',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < deviceVenders.length; i++) {
								if (deviceVenders[i].ID === row.VENDER) {
									return deviceVenders[i].NAME;
								}
							}
							return "";
						}
					}, {
						field : 'MODEL',
						title : '设备型号',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < deviceModels.length; i++) {
								if (deviceModels[i].ID === row.MODEL) {
									return deviceModels[i].NAME;
								}
							}
							return "";
						}
					}, {
						field : 'START_USE_DATE',
						title : '投产日期',
						width : 100,
						formatter : function(value, row, index) {
							return WUI.dateFormat(row.START_USE_DATE);
						}
					}, {
						field : 'EXPECT_END_DATE',
						title : '预计报废日期',
						width : 100,
						formatter : function(value, row, index) {
							return WUI.dateFormat(row.EXPECT_END_DATE);
						}
					}, WUI.pageConfiger.createConfigerColumn("device") ] ]
		});
	}
	WUI.device.editPage = function(target) {
		var device = WUI.getDatagridRow($node, target);
		WUI.pageConfiger.pageDialog(device);
	};

	WUI.parallel([ function(cbk) {
		WUI.ajax.get(deviceVenderUrl, {}, function(results) {
			deviceVenders = results;
			cbk();
		}, function() {
			$.messager.alert('失败', "读取设备厂家失败，请重试！");
			cbk("fail");
		});
	}, function(cbk) {
		WUI.ajax.get(deviceModelUrl, {}, function(results) {
			deviceModels = results;
			cbk();
		}, function() {
			$.messager.alert('失败', "读取设备型号失败，请重试！");
			cbk("fail");
		});
	} ], function(err) {
		window.WUI.publishEvent('request_current_object', {
			publisher : 'device-configer',
			cbk : openObject
		});
	});

	WUI.device.editrow = function(target) {
		var device = WUI.getDatagridRow($node, target);
		deviceDialog(device, currentObject);
	};
	WUI.device.deleterow = function(target) {
		var device = WUI.getDatagridRow($node, target);
		var typeName = WUI.objectTypes[WUI.objectTypeDef.DEVICE].name;
		$.messager.confirm('确认', '确定要删除' + typeName + '【' + device.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(objectNodeUrl + "/" + device.ID, {}, function() {
					reload(true);
				}, function() {
					$.messager.alert('失败', "删除" + typeName + "失败！");
				});
			}
		});
	};

	function deviceDialog(device, parentObject) {
		var typeName = "设备";
		var selectedDeviceType = null;
		var dialogNode = $("#configer-dialog");
		var cfg = {
			iconCls : device ? "icon-edit" : "icon-add",
			title : (device ? "修改" : "添加") + "设备",
			left : ($(window).width() - 600) * 0.5,
			top : ($(window).height() - 500) * 0.5,
			width : 620,
			closed : false,
			cache : false,
			href : "position-configer/device/dialog.html",
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#device-type-sel').combobox({
					data : WUI.deviceTypes,
					loadFilter : function(data) {
						var result = [];
						data.forEach(function(item) {
							if (item.parentNodeTypes.indexOf(parentObject.OBJECT_TYPE) >= 0) {
								result.push(item);
							}
						});
						return result;
					},
					onSelect : function(rec) {
						var venderId = $('#device-vender-sel').combobox("getValue");
						updateModel(rec.type, parseInt(venderId));
						typeName = rec.name;
						selectedDeviceType = rec;
						$('#device-extprop-panel').panel({
							href : 'position-configer/device/' + rec.namespace + '.html',
							onLoad : function() {
								WUI.deviceConfiger[rec.namespace].init(device, parentObject, rec);
							}
						});
					}
				});

				$('#device-vender-sel').combobox({
					data : deviceVenders,
					onSelect : function(rec) {
						var deviceType = $('#device-type-sel').combobox("getValue");
						updateModel(parseInt(deviceType), rec.ID);
					}
				});
				$('#device-model-sel').combobox({
					data : [],
					onSelect : function(rec) {
						var startTime = $('#device-start-use-date').datebox("getValue");
						updateTime(rec.ID, startTime);
					}
				});
				function updateModel(deviceType, vender) {
					$('#device-model-sel').combobox({
						data : deviceModels,
						loadFilter : function(data) {
							var result = [];
							data.forEach(function(item) {
								if (item.VENDER === vender && item.DEVICE_TYPE === deviceType) {
									result.push(item);
								}
							});
							return result;
						}
					});
					if (device) {
						$('#device-model-sel').combobox("setValue", device.MODEL);
					}
				}

				function updateTime(model, startTime) {
					if (!model || !startTime) {
						return;
					}

					model = parseInt(model, 10);
					for (var i = 0; i < deviceModels.length; i++) {
						if (deviceModels[i].ID === model) {
							var endDate = new Date(startTime);
							endDate.setFullYear(endDate.getFullYear() + deviceModels[i].MAX_USE_AGE);
							$('#device-expect-end-date').datebox("setValue", WUI.dateFormat(endDate));
						}
					}
				}

				$('#device-start-use-date').datebox({
					required : true,
					parser : WUI.date_parse,
					formatter : WUI.dateFormat,
					onSelect : updateTime
				});
				$('#device-expect-end-date').datebox({
					required : true,
					parser : WUI.date_parse,
					formatter : WUI.dateFormat
				});
				$('#device-start-use-date').datebox("setValue", WUI.dateFormat(new Date()));

				if (device) {
					$('#device-name-txt').textbox("setValue", device.NAME);
					$('#device-type-sel').combobox("setValue", device.DEVICE_TYPE);
					$('#device-code-txt').textbox("setValue", device.CODE);
					$('#device-vender-sel').combobox("setValue", device.VENDER);
					$('#device-model-sel').combobox("setValue", device.MODEL);
					$('#device-start-use-date').datebox("setValue", device.START_USE_DATE);
					$('#device-expect-end-date').datebox("setValue", device.EXPECT_END_DATE);
					$('#device-desc-txt').textbox("setValue", device.DESCRIPTION);
					$('#device-name-txt').textbox("isValid");
					$('#device-code-txt').textbox("isValid");
					$('#device-type-sel').combobox("disable");
				}
			},
			modal : true,
			onClose : function() {
				$("#configer-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#device-name-txt').textbox("isValid");
					isValid = isValid && $('#device-code-txt').textbox("isValid");
					isValid = isValid && $('#device-model-sel').combobox("isValid");
					isValid = isValid && $('#device-vender-sel').combobox("isValid");
					isValid = isValid && $('#device-type-sel').combobox("isValid");
					isValid = isValid && WUI.deviceConfiger[selectedDeviceType.namespace].checkValid();
					if (!isValid) {
						return;
					}

					var newdevice = {
						NAME : $('#device-name-txt').textbox("getValue"),
						CODE : $('#device-code-txt').textbox("getValue"),
						BUSINESS_TYPE : selectedDeviceType.businessType,
						DEVICE_TYPE : parseInt($('#device-type-sel').combobox("getValue"), 10),
						VENDER : parseInt($('#device-vender-sel').combobox("getValue"), 10),
						MODEL : parseInt($('#device-model-sel').combobox("getValue"), 10),
						START_USE_DATE : WUI.timeformat_t($('#device-start-use-date').datebox("getValue")),
						EXPECT_END_DATE : WUI.timeformat_t($('#device-expect-end-date').datebox("getValue")),
						DESCRIPTION : $('#device-desc-txt').textbox("getValue"),
						OBJECT_TYPE : WUI.objectTypeDef.DEVICE,
						PARENT_ID : parentObject.ID,
						properties : []
					};
					newdevice.properties = WUI.deviceConfiger[selectedDeviceType.namespace].getExProperties();
					if (device) {
						newdevice.ID = device.ID;
						WUI.ajax.put(objectNodeUrl + "/" + newdevice.ID, newdevice, function() {
							dialogNode.dialog("close");
							reload(true);
						}, function() {
							$.messager.alert('失败', "修改" + typeName + "失败！");
						});
					} else {
						WUI.ajax.post(objectNodeUrl, newdevice, function() {
							dialogNode.dialog("close");
							reload(true);
						}, function() {
							$.messager.alert('失败', "添加" + typeName + "失败！");
						});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					dialogNode.dialog("close");
				}
			} ]
		};
		dialogNode.dialog(cfg);
	}
});
