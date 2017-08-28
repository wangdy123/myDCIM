$(function() {
	var deviceVenderUrl = "device-vender/deviceVenders";
	$node = $('#device-vender-grid');

	$node.datagrid({
		url : deviceVenderUrl,
		method : "get",
		singleSelect : true,
		onLoadError : WUI.onLoadError,
		toolbar : [ {
			iconCls : 'icon-add',
			handler : function() {
				deviceVenderDialog();
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
								+ ' onclick="WUI.deviceVender.editrow(this)"></div> ';
						var s = '<div class="separater"></div> ';
						var d = '<div class="icon-remove operator-tool" title="删除" '
								+ ' onclick="WUI.deviceVender.deleterow(this)"></div>';
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
					field : 'ABBREVIATION',
					title : '简称',
					width : 80
				}, {
					field : 'DESCRIPTION',
					title : '描述',
					width : 400
				} ] ]
	});

	WUI.deviceVender = {};
	WUI.deviceVender.editrow = function(target) {
		var deviceVender = WUI.getDatagridRow($node, target);
		deviceVenderDialog(deviceVender);
	}
	WUI.deviceVender.deleterow = function(target) {
		var deviceVender = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除设备厂家【' + deviceVender.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(deviceVenderUrl + "/" + deviceVender.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除设备厂家失败！");
				});
			}
		});
	}

	function deviceVenderDialog(deviceVender) {
		var dialogNode = $('#device-vender-dialog');
		dialogNode.dialog({
			iconCls : deviceVender ? "icon-edit" : "icon-add",
			title : deviceVender ? "修改设备厂家" : "添加设备厂家",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 450,
			closed : false,
			cache : false,
			href : 'device-vender/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				if (deviceVender) {
					$('#vender-name-txt').textbox("setValue", deviceVender.NAME);
					$('#vender-code-txt').textbox("setValue", deviceVender.CODE);
					$('#vender-ABBREVIATION-txt').textbox("setValue", deviceVender.ABBREVIATION);
					$('#vender-desc-txt').textbox("setValue", deviceVender.DESCRIPTION);
					$('#model-name-txt').textbox("isValid");
					$('#model-ABBREVIATION-txt').textbox("isValid");
					$('#vender-code-txt').textbox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#vender-name-txt').textbox("isValid");
					isValid = isValid && $('#vender-code-txt').textbox("isValid");
					isValid = isValid && $('#vender-ABBREVIATION-txt').textbox("isValid");
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#vender-name-txt').textbox("getValue"),
						CODE : $('#vender-code-txt').textbox("getValue"),
						ABBREVIATION : $('#vender-ABBREVIATION-txt').textbox("getValue"),
						DESCRIPTION : $('#vender-desc-txt').textbox("getValue")
					};

					if (deviceVender) {
						var ID = deviceVender.ID;
						WUI.ajax.put(deviceVenderUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改设备厂家失败！");
						});
					} else {
						WUI.ajax.post(deviceVenderUrl, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "添加设备厂家失败！");
						});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					dialogNode.dialog("close");
				}
			} ]
		});
	}
});
