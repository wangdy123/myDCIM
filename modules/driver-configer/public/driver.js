$(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';
	var driverUrl = "driver-configer/drivers";
	var fsuUrl = "fsu-configer/fsus";
	var driverModelUrl = "driver-configer/models";
	var driverParamUrl = "driver-configer/params/";
	$node = $('#driver-grid');

	var driverModels = [];
	var fsus = [];
	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		reloadFsu(event.object);
	}, "driver-configer");

	WUI.ajax.get(driverModelUrl, {}, function(results) {
		driverModels = results;
		WUI.publishEvent('request_current_object', {
			publisher : 'driver-configer',
			cbk : reloadFsu
		});
	}, function() {
		$.messager.alert('失败', "读取驱动型号失败，请重试！");
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
					}, {
						field : 'NAME',
						title : '驱动名称',
						width : 150
					}, {
						field : 'MODEL',
						title : '驱动模块',
						width : 100,
						formatter : function(value, row, index) {
							for (var i = 0; i < driverModels.length; i++) {
								if (driverModels[i].model === row.MODEL) {
									return driverModels[i].name;
								}
							}
							return "";
						}
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
					} ] ]
		});
	}

	WUI.driver = {};
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
					data : driverModels,
					keyHandler : {
						down : function(e) {
							$('#driver-model-sel').combobox("showPanel");
						}
					},
					onSelect : function(rec) {
						var $propTable = $("#driver-extprop-panel");
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
						newObject.FSU = null;
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
