$(function() {
	var rackModelUrl = "rack-model/rackModels";
	$node = $('#rack-model-grid');

	$node.datagrid({
		url : rackModelUrl,
		method : "get",
		singleSelect : true,
		onLoadError : WUI.onLoadError,
		toolbar : [ {
			iconCls : 'icon-add',
			handler : function() {
				rackModelDialog();
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
								+ ' onclick="WUI.rackModel.editrow(this)"></div> ';
						var s = '<div class="separater"></div> ';
						var d = '<div class="icon-remove operator-tool" title="删除" '
								+ ' onclick="WUI.rackModel.deleterow(this)"></div>';
						return e + s + d;
					}
				}, {
					field : 'ID',
					title : '类型ID',
					align : 'right',
					width : 80
				}, {
					field : 'NAME',
					title : '名称',
					width : 100
				}, {
					field : 'ABBREVIATION',
					title : '简称',
					width : 80
				}, {
					field : 'U1_POSITION',
					title : 'U1位置',
					width : 60,
					formatter : function(value, row, index) {
						return row.U1_POSITION === 0 ? "顶部" : "底部";
					}
				}, {
					field : 'U_COUNT',
					title : '总U数'
				}, {
					field : 'DEPTH',
					title : '机柜深度',
					align : 'right',
					formatter : function(value, row, index) {
						return row.DEPTH.toFixed(3) + " 米";
					}
				}, {
					field : 'MAX_USE_AGE',
					title : '最大使用年限',
					align : 'right',
					formatter : function(value, row, index) {
						return row.MAX_USE_AGE + " 年";
					}
				} ] ]
	});

	WUI.rackModel = {};
	WUI.rackModel.editrow = function(target) {
		var rackModel = WUI.getDatagridRow($node, target);
		rackModelDialog(rackModel);
	};
	WUI.rackModel.deleterow = function(target) {
		var rackModel = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除机柜型号【' + rackModel.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(rackModelUrl + "/" + rackModel.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除机柜型号失败！");
				});
			}
		});
	};

	function rackModelDialog(rackModel) {
		var dialogNode = $('#rack-model-dialog');
		dialogNode.dialog({
			iconCls : rackModel ? "icon-edit" : "icon-add",
			title : rackModel ? "修改机柜型号" : "添加机柜型号",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 450,
			closed : false,
			cache : false,
			href : 'rack-model/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				if (rackModel) {
					$('#model-name-txt').textbox("setValue",rackModel.NAME);
					$('#model-ABBREVIATION-txt').textbox("setValue",rackModel.ABBREVIATION);
					$('#model-u1_position-txt').combobox("setValue",rackModel.U1_POSITION);
					$('#model-u-count-txt').numberbox("setValue", rackModel.U_COUNT);
					$('#model-depth-txt').numberbox("setValue", rackModel.DEPTH);
					$('model-max-use-age-txt').numberbox("setValue", rackModel.MAX_USE_AGE);
					$('#model-name-txt').textbox("isValid");
					$('#model-ABBREVIATION-txt').textbox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#model-name-txt').textbox("isValid");
					isValid = isValid && $('#model-u-count-txt').numberbox("getValue");
					isValid = isValid && $('#model-depth-txt').numberbox("getValue");
					isValid = isValid && $('#model-max-use-age-txt').numberbox("getValue");
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#model-name-txt').textbox("getValue"),
						ABBREVIATION : $('#model-ABBREVIATION-txt').textbox("getValue"),
						U1_POSITION : $('#model-u1_position-txt').combobox("getValue"),
						U_COUNT : parseInt($('#model-u-count-txt').numberbox("getValue"), 10),
						DEPTH : parseFloat($('#model-depth-txt').numberbox("getValue")),
						MAX_USE_AGE : parseInt($('#model-max-use-age-txt').numberbox("getValue"), 10)
					};

					if (rackModel) {
						var ID = rackModel.ID;
						WUI.ajax.put(rackModelUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改机柜型号失败！");
						});
					} else {
						WUI.ajax.post(rackModelUrl, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "添加机柜型号失败！");
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
