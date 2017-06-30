$(function() {
	var cabinetModelUrl = "cabinet-model/cabinetModels";
	$node = $('#cabinet-model-grid');

	$node.datagrid({
		url : cabinetModelUrl,
		method : "get",
		singleSelect : true,
		onLoadError : WUI.onLoadError,
		toolbar : [ {
			iconCls : 'icon-add',
			handler : function() {
				cabinetModelDialog();
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
								+ ' onclick="WUI.cabinetModel.editrow(this)"></div> ';
						var s = '<div class="separater"></div> ';
						var d = '<div class="icon-remove operator-tool" title="删除" '
								+ ' onclick="WUI.cabinetModel.deleterow(this)"></div>';
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

	WUI.cabinetModel = {};
	WUI.cabinetModel.editrow = function(target) {
		var cabinetModel = WUI.getDatagridRow($node, target);
		cabinetModelDialog(cabinetModel);
	};
	WUI.cabinetModel.deleterow = function(target) {
		var cabinetModel = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除机柜型号【' + cabinetModel.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(cabinetModelUrl + "/" + cabinetModel.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除机柜型号失败！");
				});
			}
		});
	};

	function cabinetModelDialog(cabinetModel) {
		var dialogNode = $('#cabinet-model-dialog');
		dialogNode.dialog({
			iconCls : cabinetModel ? "icon-edit" : "icon-add",
			title : cabinetModel ? "修改机柜型号" : "添加机柜型号",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 450,
			closed : false,
			cache : false,
			href : 'cabinet-model/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				if (cabinetModel) {
					$('#model-name-txt').val(cabinetModel.NAME);
					$('#model-ABBREVIATION-txt').val(cabinetModel.ABBREVIATION);
					$('#model-u1_position-txt').val(cabinetModel.U1_POSITION);
					$('#model-u-count-txt').numberbox("setValue", cabinetModel.U_COUNT);
					$('#model-depth-txt').numberbox("setValue", cabinetModel.DEPTH);
					$('model-max-use-age-txt').numberbox("setValue", cabinetModel.MAX_USE_AGE);
					$('#model-name-txt').validatebox("isValid");
					$('#model-ABBREVIATION-txt').validatebox("isValid");
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
					isValid = isValid && $('#model-u-count-txt').numberbox("getValue");
					isValid = isValid && $('#model-depth-txt').numberbox("getValue");
					isValid = isValid && $('#model-max-use-age-txt').numberbox("getValue");
					if (!isValid) {
						return;
					}
					var newObject = {
						NAME : $('#model-name-txt').val(),
						ABBREVIATION : $('#model-ABBREVIATION-txt').val(),
						U1_POSITION : $('#model-u1_position-txt').val(),
						U_COUNT : parseInt($('#model-u-count-txt').numberbox("getValue"), 10),
						DEPTH : parseFloat($('#model-depth-txt').numberbox("getValue")),
						MAX_USE_AGE : parseInt($('#model-max-use-age-txt').numberbox("getValue"), 10)
					};

					if (cabinetModel) {
						var ID = cabinetModel.ID;
						WUI.ajax.put(cabinetModelUrl + "/" + ID, newObject, function() {
							$node.datagrid("reload");
							dialogNode.dialog("close");
						}, function() {
							$.messager.alert('失败', "修改机柜型号失败！");
						});
					} else {
						WUI.ajax.post(cabinetModelUrl, newObject, function() {
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
