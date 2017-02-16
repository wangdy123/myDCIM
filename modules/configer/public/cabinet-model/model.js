$(function() {
	var cabinetModelUrl = WUI.urlPath + "/configer/cabinetModels";
	$node = $('#model-grid');
	$node.datagrid({
		url : cabinetModelUrl,
		method : "get",
		singleSelect : true,
		onLoadError : function(s) {
			$.messager.alert('失败', "加载失败");
		},
		toolbar : [ {
			iconCls : 'icon-add',
			handler : function() {
				modelDialog();
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
					field : 'CODE',
					title : '编码',
					align : 'right',
					width : 80
				}, {
					field : 'NAME',
					title : '型号名',
					width : 150
				}, {
					field : 'ABBREVIATION',
					title : '简称',
					width : 100
				}, {
					field : 'U_COUNT',
					title : '总U数',
					width : 100
				}, {
					field : 'U1_POSITION',
					title : 'U1位置',
					width : 100,
					formatter : function(value, row, index) {
						return row.U1_POSITION ? "顶部" : "底部";
					}
				}, {
					field : 'DEPTH',
					title : '机柜深度(米)',
					width : 150
				}, {
					field : 'MAX_USE_YEAR',
					title : '使用年限(年)',
					width : 100
				} ] ]
	});

	function getRowIndex(target) {
		var tr = $(target).closest('tr.datagrid-row');
		return parseInt(tr.attr('datagrid-row-index'));
	}

	WUI.cabinetModel = {};
	WUI.cabinetModel.editrow = function(target) {
		var cabinetModel = $node.datagrid("getRows")[getRowIndex(target)];
		modelDialog(cabinetModel);
	}
	WUI.cabinetModel.deleterow = function(target) {
		var cabinetModel = $node.datagrid("getRows")[getRowIndex(target)];
		$.messager.confirm('确认', '确定要删除机柜型号【' + cabinetModel.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(cabinetModelUrl + "/" + cabinetModel.ID, {}, function() {
					reload(true);
				}, function() {
					$.messager.alert('失败', "删除机柜型号失败！");
				});
			}
		});
	}

	function modelDialog(cabinetModel) {
		$('#model-dialog').dialog({
			iconCls : cabinetModel ? "icon-edit" : "icon-add",
			title : cabinetModel ? "修改机柜型号" : "添加机柜型号",
			left : ($(window).width() - 600) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 300,
			closed : false,
			cache : false,
			href : 'configer/cabinet-model/dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				if (cabinetModel) {
					$('#model-code-txt').val(cabinetModel.CODE);
					$('#model-name-txt').val(cabinetModel.NAME);
					$('#model-abbreviation-txt').val(cabinetModel.ABBREVIATION);
					$('#model-U-count-txt').numberbox("setValue", cabinetModel.U_COUNT);
					$('#model-U-position-txt').val(cabinetModel.U1_POSITION);
					$('#model-depth-txt').numberbox("setValue", cabinetModel.DEPTH);
					$('#model-max-year-txt').numberbox("setValue", cabinetModel.MAX_USE_YEAR);

					$('#model-code-txt').validatebox("isValid");
					$('#model-name-txt').validatebox("isValid");
					$('#model-abbreviation-txt').validatebox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				$("#model-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $("#model-name-txt").validatebox("isValid");
					isValid = isValid && $("#model-code-txt").validatebox("isValid");
					isValid = isValid && $("#model-abbreviation-txt").validatebox("isValid");
					isValid = isValid && $("#model-U-count-txt").val();
					isValid = isValid && $("#model-depth-txt").val();
					isValid = isValid && $("#model-max-year-txt").val();
					if (!isValid) {
						return;
					}

					var newObject = {
						CODE : $('#model-code-txt').val(),
						NAME : $('#model-name-txt').val(),
						ABBREVIATION : $('#model-abbreviation-txt').val(),
						U_COUNT : $('#model-U-count-txt').val(),
						U1_POSITION : $('#model-U-position-txt').val(),
						DEPTH : $('#model-depth-txt').val(),
						MAX_USE_YEAR : $('#model-max-year-txt').val()
					};

					if (cabinetModel) {
						WUI.ajax.put(cabinetModelUrl + "/" + cabinetModel.ID, newObject, function() {
							$node.datagrid("reload");
							$('#model-dialog').dialog("close");
						}, function() {
							$.messager.alert('失败', "修改机柜型号失败！");
						});
					} else {
						WUI.ajax.post(cabinetModelUrl, newObject, function() {
							$node.datagrid("reload");
							$('#model-dialog').dialog("close");
						}, function() {
							$.messager.alert('失败', "添加机柜型号失败！");
						});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					$('#model-dialog').dialog("close");
				}
			} ]
		});
	}
});