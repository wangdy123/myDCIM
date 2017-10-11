$(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';
	var fsuUrl = "fsu-configer/fsus";
	var restartFsuUrl = "fsu-configer/restartFsu/";
	var fsuDriverUrl = "fsu-configer/fsuDrivers/";
	var fsuModelUrl = "fsu-configer/models";
	var fsuParamUrl = "fsu-configer/params/";
	$node = $('#fsu-grid');

	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	}, "fsu-configer");

	function openObject(object) {
		if (!object) {
			return;
		}
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;
		var $panel = $("#bread-crumbs-panel");
		WUI.initBreadCrumbs($panel, objectNodeUrl, object);

		$node.datagrid({
			url : fsuUrl,
			method : "get",
			singleSelect : true,
			queryParams : {
				position : currentObject.ID
			},
			onLoadError : WUI.onLoadError,
			toolbar : [ {
				iconCls : 'icon-add',
				handler : function() {
					fsuDialog();
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
									+ ' onclick="WUI.fsu.editrow(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.fsu.deleterow(this)"></div>';
							return e + s + d;
						}
					},
					{
						field : 'restart',
						title : '重启FSU',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							return '<a  href="#" class="easyui-linkbutton" onclick="WUI.fsu.restart(this)">重启</a> ';
						}
					},
					{
						field : 'view_driver',
						title : '查看驱动',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							return '<a  href="#" class="easyui-linkbutton" '
									+ 'onclick="WUI.fsu.viewDrivers(this)">查看驱动</a> ';
						}
					}, {
						field : 'CODE',
						title : '编码',
						width : 100
					}, {
						field : 'NAME',
						title : 'FSU名称',
						width : 150
					}, {
						field : 'MODEL',
						title : 'FSU型号',
						width : 150
					}, {
						field : 'params',
						title : '参数',
						formatter : function(value, row, index) {
							return JSON.stringify(row.params);
						}
					} ] ]
		});
	}

	WUI.fsu = {};
	WUI.fsu.restart = function(target) {
		var fsu = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要重启FSU【' + fsu.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.put(restartFsuUrl + fsu.ID, {}, function() {
					$.messager.alert('成功', "重启FSU成功！");
				}, function() {
					$.messager.alert('失败', "重启FSU失败！");
				});
			}
		});
	};
	WUI.fsu.viewDrivers = function(target) {
		var fsu = WUI.getDatagridRow($node, target);
		$('#fsu-driver-dialog').dialog('open');
		$("#fsu-driver-content").datagrid({
			url : fsuDriverUrl,
			method : "get",
			singleSelect : true,
			queryParams : {
				fsuId : fsu.ID
			},
			onLoadError : WUI.onLoadError,
			columns : [ [ {
				field : 'NAME',
				title : '驱动名称',
				width : 150
			}, {
				field : 'MODEL',
				title : '驱动模块',
				width : 150
			}, {
				field : 'params',
				title : '参数',
				width : 250,
				formatter : function(value, row, index) {
					return JSON.stringify(row.params);
				}
			} ] ]
		});
	};
	WUI.fsu.editrow = function(target) {
		var fsu = WUI.getDatagridRow($node, target);
		fsuDialog(fsu);
	};
	WUI.fsu.deleterow = function(target) {
		var fsu = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除FSU【' + fsu.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(fsuUrl + "/" + fsu.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除FSU失败！");
				});
			}
		});
	};

	function fsuDialog(fsu) {
		var dialogNode = $('#fsu-dialog');
		var properties = [];
		var cfg = {
			iconCls : fsu ? "icon-edit" : "icon-add",
			title : fsu ? "修改FSU" : "添加FSU",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 400) * 0.5,
			width : 400,
			closed : false,
			cache : false,
			href : 'fsu-configer/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#fsu-model-sel').combobox({
					valueField : 'model',
					textField : 'name',
					editable : false,
					required : true,
					url : fsuModelUrl,
					method : 'get',
					onSelect : function(rec) {
						var $propTable = $("#fsu-extprop-panel");
						$propTable.empty();
						properties = [];
						WUI.ajax.get(fsuParamUrl + rec.model, {}, function(results) {
							results.forEach(function(param) {
								var $tr = $(document.createElement("tr"));
								$propTable.append($tr);
								properties.push(WUI.createProperty($tr, param, 100, 200));
							});
							if (fsu) {
								WUI.setPropertiesValue(properties, fsu.params);
							}
						}, function() {
							$.messager.alert('失败', "读取FSU运行参数失败，请重试！");
						});
					}
				});

				if (fsu) {
					$('#fsu-name-txt').textbox("setValue", fsu.NAME);
					$('#fsu-code-txt').textbox("setValue", fsu.CODE);
					$('#fsu-model-sel').combobox("setValue", fsu.MODEL);
					$('#fsu-name-txt').textbox("isValid");
					$('#fsu-code-txt').textbox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#fsu-name-txt').textbox("isValid");
					isValid = isValid && $('#fsu-code-txt').textbox("isValid");
					isValid = isValid && $('#fsu-model-sel').combobox("isValid");
					isValid = isValid && WUI.isPropertiesValueValid(properties);
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#fsu-name-txt').textbox("getValue"),
						CODE : $('#fsu-code-txt').textbox("getValue"),
						MODEL : $('#fsu-model-sel').combobox("getValue"),
						POSTION : currentObject.ID,
						params : WUI.getPropertiesValue(properties)
					};

					if (fsu) {
						var ID = fsu.ID;
						WUI.ajax.put(fsuUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改FSU失败！");
						});
					} else {
						WUI.ajax.post(fsuUrl, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "添加FSU失败！");
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
