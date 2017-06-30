$(function() {
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	$node = $('#device-model-grid');
	var venders = [];

	function initGrid() {
		$node.datagrid({
			url : deviceModelUrl,
			method : "get",
			singleSelect : true,
			onLoadError : WUI.onLoadError,
			toolbar : [ {
				iconCls : 'icon-add',
				handler : function() {
					deviceModelDialog();
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
									+ ' onclick="WUI.deviceModel.editrow(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.deviceModel.deleterow(this)"></div>';
							return e + s + d;
						}
					}, {
						field : 'CODE',
						title : '编码',
						width : 100
					}, {
						field : 'NAME',
						title : '名称',
						width : 200
					}, {
						field : 'DEVICE_TYPE',
						title : '设备类型',
						width : 60,
						formatter : function(value, row, index) {
							for (var i = 0; i < WUI.deviceTypes.length; i++) {
								if (WUI.deviceTypes[i].type === row.DEVICE_TYPE) {
									return WUI.deviceTypes[i].name;
								}
							}
							return "";
						}
					}, {
						field : 'VENDER',
						title : '设备型号',
						formatter : function(value, row, index) {
							for (var i = 0; i < venders.length; i++) {
								if (venders[i].ID === row.VENDER) {
									return venders[i].NAME;
								}
							}
							return "";
						}
					}, {
						field : 'MAX_USE_AGE',
						title : '最大使用年限',
						align : 'right',
						formatter : function(value, row, index) {
							return row.MAX_USE_AGE+" 年";
						}
					}, {
						field : 'DESCRIPTION',
						title : '描述',
						width : 400
					} ] ]
		});
	}

	WUI.ajax.get(deviceVenderUrl, {}, function(results) {
		venders = results;
		initGrid();
	}, function() {
		$.messager.alert('失败', "读取设备型号失败，请重试！");
	});

	WUI.deviceModel = {};
	WUI.deviceModel.editrow = function(target) {
		var deviceModel = WUI.getDatagridRow($node, target);
		deviceModelDialog(deviceModel);
	};
	WUI.deviceModel.deleterow = function(target) {
		var deviceModel = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除设备型号【' + deviceModel.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(deviceModelUrl + "/" + deviceModel.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除设备型号！");
				});
			}
		});
	};

	function deviceModelDialog(deviceModel) {
		var dialogNode = $('#device-model-dialog');
		var cfg = {
			iconCls : deviceModel ? "icon-edit" : "icon-add",
			title : deviceModel ? "修改设备型号" : "添加设备型号",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 400) * 0.5,
			width : 550,
			closed : false,
			cache : false,
			href : 'device-model/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				for (var i = 0; i < WUI.deviceTypes.length; i++) {
					$('#model-device-type-sel').append(
							'<option value="' + WUI.deviceTypes[i].type + '">' + WUI.deviceTypes[i].name + '</option>');
				}
				for (var j = 0; j < venders.length; j++) {
					$('#model-vender-sel').append(
							'<option value="' + venders[j].ID + '">' + venders[j].NAME + '</option>');
				}
				if (deviceModel) {
					$('#model-name-txt').val(deviceModel.NAME);
					$('#model-code-txt').val(deviceModel.CODE);
					$('#model-device-type-sel').val(deviceModel.DEVICE_TYPE);
					$('#model-vender-sel').val(deviceModel.VENDER);
					$('model-max-use-age-txt').numberbox("setValue", deviceModel.MAX_USE_AGE);
					$('#model-desc-txt').textbox("setValue", deviceModel.DESCRIPTION);
					$('#model-name-txt').validatebox("isValid");
					$('#model-code-txt').validatebox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#model-name-txt').validatebox("isValid");
					isValid = isValid && $('#model-device-type-sel').val();
					isValid = isValid && $('#model-vender-sel').val();
					isValid = isValid && $('#model-max-use-age-txt').numberbox("getValue");
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#model-name-txt').val(),
						CODE : $('#model-code-txt').val(),
						DEVICE_TYPE : parseInt($('#model-device-type-sel').val(), 10),
						VENDER : parseInt($('#model-vender-sel').val(), 10),
						MAX_USE_AGE : parseInt($('#model-max-use-age-txt').numberbox("getValue"), 10),
						DESCRIPTION : $('#model-desc-txt').textbox("getValue")
					};

					if (deviceModel) {
						var ID = deviceModel.ID;
						WUI.ajax.put(deviceModelUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改设备型号失败！");
						});
					} else {
						WUI.ajax.post(deviceModelUrl, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "添加设备型号失败！");
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
