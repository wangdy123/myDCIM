$(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';
	var driverUrl = "driver-configer/drivers";
	var restartDriverUrl = "driver-configer/restartDriver/";
	var fsuUrl = "fsu-configer/fsus";
	var driverModelUrl = "driver-configer/models";
	var driverSignalUrl = "driver-configer/signals";
	var driverParamUrl = "driver-configer/params/";
	$node = $('#driver-grid');

	var fsus = [];
	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		reloadFsu(event.object);
	}, "driver-configer");
	WUI.publishEvent('request_current_object', {
		publisher : 'driver-configer',
		cbk : reloadFsu
	});

	function reloadFsu(object) {
		if (!object) {
			return;
		}
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}

		currentObject = object;
		WUI.ajax.get(fsuUrl, {
			position : currentObject.ID
		}, function(results) {
			fsus = results;
			fsus.unshift({
				ID : 0,
				NAME : "空"
			});
			openObject();
		}, function() {
			$.messager.alert('失败', "读取FSU信息失败，请重试！");
		});
	}
	function openObject() {
		var $panel = $("#bread-crumbs-panel");
		WUI.initBreadCrumbs($panel, objectNodeUrl, currentObject);

		$node.datagrid({
			url : driverUrl,
			method : "get",
			singleSelect : true,
			queryParams : {
				position : currentObject.ID
			},
			onLoadError : WUI.onLoadError,
			toolbar : [ {
				iconCls : 'icon-add',
				handler : function() {
					driverDialog();
				}
			}, '-', {
				iconCls : 'icon-reload',
				handler : function() {
					$node.datagrid("reload");
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
									+ ' onclick="WUI.driver.editrow(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.driver.deleterow(this)"></div>';
							return e + s + d;
						}
					},
					{
						field : 'restart',
						title : '重启驱动',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							return '<a  href="#" class="easyui-linkbutton" onclick="WUI.driver.restart(this)">重启</a> ';
						}
					},
					{
						field : 'view_signal',
						title : '查看信号',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							return '<a  href="#" class="easyui-linkbutton" '
									+ 'onclick="WUI.driver.viewSignals(this)">查看信号</a> ';
						}
					}, {
						field : 'NAME',
						title : '驱动名称',
						width : 150
					}, {
						field : 'MODEL',
						title : '驱动模块',
						width : 150
					}, {
						field : 'FSU',
						title : '所属FSU',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < fsus.length; i++) {
								if (fsus[i].ID === row.FSU) {
									return fsus[i].NAME;
								}
							}
							return "";
						}
					}, {
						field : 'params',
						title : '参数',
						formatter : function(value, row, index) {
							return JSON.stringify(row.params);
						}
					} ] ]
		});
	}

	WUI.driver = {};
	WUI.driver.restart = function(target) {
		var driver = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要重启驱动【' + driver.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.put(restartDriverUrl + driver.ID, {}, function() {
					$.messager.alert('成功', "重启驱动成功！");
				}, function() {
					$.messager.alert('失败', "重启驱动失败！");
				});
			}
		});
	};
	WUI.driver.viewSignals = function(target) {
		var driver = WUI.getDatagridRow($node, target);
		$('#driver-signal-dialog').dialog('open');
		$("#driver-signal-content").datagrid({
			url : driverSignalUrl,
			method : "get",
			singleSelect : true,
			queryParams : {
				driverId : driver.ID
			},
			onLoadError : WUI.onLoadError,
			columns : [ [ {
				field : 'OBJECT_NAME',
				title : '所属设备',
				width : 230
			}, {
				field : 'SIGNAL_ID',
				title : '信号编码',
				align : 'right',
				width : 80
			}, {
				field : 'SIGNAL_NAME',
				title : '名称',
				width : 150
			}, {
				field : 'SIGNAL_TYPE',
				title : '信号类型',
				width : 60,
				formatter : function(value, row, index) {
					var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
					if (type) {
						return type.name;
					}
					return "";
				}
			} ] ]
		});
	};
	WUI.driver.editrow = function(target) {
		var driver = WUI.getDatagridRow($node, target);
		driverDialog(driver);
	};
	WUI.driver.deleterow = function(target) {
		var driver = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除驱动【' + driver.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(driverUrl + "/" + driver.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除驱动失败！");
				});
			}
		});
	};

	function driverDialog(driver) {
		var dialogNode = $('#driver-dialog');
		var properties = [];
		var cfg = {
			iconCls : driver ? "icon-edit" : "icon-add",
			title : driver ? "修改驱动" : "添加驱动",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 500) * 0.5,
			width : 400,
			closed : false,
			cache : false,
			href : 'driver-configer/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#driver-fsu-sel').combobox({
					valueField : 'ID',
					textField : 'NAME',
					editable : false,
					required : true,
					data : fsus,
					keyHandler : {
						down : function(e) {
							$('#driver-fsu-sel').combobox("showPanel");
						}
					}
				});

				$('#driver-model-sel').combobox({
					valueField : 'model',
					textField : 'name',
					editable : false,
					required : true,
					url : driverModelUrl,
					method : 'get',
					keyHandler : {
						down : function(e) {
							$('#driver-model-sel').combobox("showPanel");
						}
					},
					onSelect : function(rec) {
						var $propTable = $("#driver-extprop-panel");
						$propTable.empty();
						properties = [];
						WUI.ajax.get(driverParamUrl + rec.model, {}, function(results) {
							results.forEach(function(param) {
								var $tr = $(document.createElement("tr"));
								$propTable.append($tr);
								properties.push(WUI.createProperty($tr, param, 80, 200));
							});
							if (driver) {
								WUI.setPropertiesValue(properties, driver.params);
							}
						}, function() {
							$.messager.alert('失败', "读取驱动运行参数失败，请重试！");
						});
					}
				});

				if (driver) {
					$('#driver-name-txt').textbox("setValue", driver.NAME);
					$('#driver-fsu-sel').combobox("setValue", driver.FSU);
					$('#driver-model-sel').combobox("setValue", driver.MODEL);
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#driver-name-txt').textbox("isValid");
					isValid = isValid && $('#driver-fsu-sel').combobox("isValid");
					isValid = isValid && $('#driver-model-sel').combobox("isValid");
					isValid = isValid && WUI.isPropertiesValueValid(properties);
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#driver-name-txt').textbox("getValue"),
						FSU : $('#driver-fsu-sel').combobox("getValue"),
						MODEL : $('#driver-model-sel').combobox("getValue"),
						POSTION : currentObject.ID,
						params : WUI.getPropertiesValue(properties)
					};
					if (!newObject.FSU) {
						newObject.FSU = 0;
					}
					if (driver) {
						var ID = driver.ID;
						WUI.ajax.put(driverUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改驱动失败！");
						});
					} else {
						WUI.ajax.post(driverUrl, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "添加驱动失败！");
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
