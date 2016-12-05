$(function() {
	var departmentUrl = "/account/departments";
	$node = $('#department-grid');

	$node.datagrid({
		url : departmentUrl,
		method : "get",
		singleSelect : true,
		onLoadError : function(s) {
			$.messager.alert('失败', "加载失败");
		},
		toolbar : [ {
			iconCls : 'icon-add',
			handler : function() {
				departmentDialog(false);
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
								+ ' onclick="WUI.department.editrow(this)"></div> ';
						var s = '<div class="separater"></div> ';
						var d = '<div class="icon-remove operator-tool" title="删除" '
								+ ' onclick="WUI.department.deleterow(this)"></div>';
						return e + s + d;
					}
				}, {
					field : 'ID',
					title : '部门编码',
					align : 'right',
					width : 80
				}, {
					field : 'NAME',
					title : '部门名称',
					width : 180
				}, {
					field : 'DESCRIPTION',
					title : '描述',
					width : 200
				} ] ]
	});

	function getRowIndex(target) {
		var tr = $(target).closest('tr.datagrid-row');
		return parseInt(tr.attr('datagrid-row-index'));
	}
	WUI.department = {};
	WUI.department.editrow = function(target) {
		var department = $node.datagrid("getRows")[getRowIndex(target)];
		departmentDialog(true, department.ID);
	}
	WUI.department.deleterow = function(target) {
		var department = $node.datagrid("getRows")[getRowIndex(target)];
		$.messager.confirm('确认', '确定要删除部门【' + department.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(departmentUrl + "/" + department.ID, {}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "删除部门失败！");
				});
			}
		});
	}

	function departmentDialog(isEdit, departmentId) {
		$('#department-dialog').dialog({
			iconCls : isEdit ? "icon-edit" : "icon-add",
			title : isEdit ? "修改部门" : "添加部门",
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 300,
			closed : false,
			cache : false,
			href : '/account/department-dialog.html' + (isEdit ? ("?departmentId=" + departmentId) : ""),
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			modal : true,
			onClose : function() {
				$("#department-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					if (!$('#department-name-txt').val()) {
						return;
					}
					var department = {
						NAME : $('#department-name-txt').val(),
						DESCRIPTION : $('#department-description-txt').val()
					};

					if (isEdit) {
						var ID = $('#department-id-txt').val();
						WUI.ajax.put(departmentUrl + "/" + ID, department, function() {
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "修改部门失败！");
						});
					} else {
						WUI.ajax.post(departmentUrl, department, function() {
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "添加部门失败！");
						});
					}
					$('#department-dialog').dialog("close");
				}
			}, {
				text : '取消',
				handler : function() {
					$('#department-dialog').dialog("close");
				}
			} ]
		});
	}
});