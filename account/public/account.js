$(function() {
	var accountUrl = "/account/accounts";
	$node = $('#account-grid');

	$node
			.datagrid({
				url : accountUrl,
				method : "get",
				singleSelect : true,
				onLoadError : function(s) {
					$.messager.alert('失败', "加载失败");
				},
				toolbar : [ {
					iconCls : 'icon-add',
					handler : function() {
						accountDialog();
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
								var e = '<div class="icon-edit operator-tool" title="修改" onclick="WUI.account.editrow(this)"></div> ';
								var s = '<div class="separater"></div> ';
								var d = "";
								if (row.ENABLE) {
									d = '<div class="icon-no operator-tool" title="禁用" onclick="WUI.account.disablerow(this)"></div>';
								} else {
									if (row.PERSONNEL_ENABLE) {
										d = '<div class="icon-ok operator-tool" title="启用" onclick="WUI.account.enablerow(this)"></div>';
									}
								}
								return e + s + d;
							}
						},
						{
							field : 'ID',
							title : '编码',
							align : 'right',
							width : 80
						},
						{
							field : 'NAME',
							title : '姓名',
							width : 150
						},
						{
							field : 'ACCOUNT',
							title : '帐号',
							width : 150
						},
						{
							field : 'ROLE_NAME',
							title : '角色',
							width : 100
						},
						{
							field : 'DEFAULT_THEME',
							title : '主题',
							width : 100
						},
						{
							field : 'DEPARTMENT_NAME',
							title : '所在部门',
							width : 150
						},
						{
							field : 'ENABLE',
							title : '是否启用',
							width : 100,
							formatter : function(value, row, index) {
								return '<div class="' + (row.ENABLE ? 'icon-ok' : 'icon-no')
										+ ' operator-tool"></div> ';
							}
						} ] ]
			});

	function getRowIndex(target) {
		var tr = $(target).closest('tr.datagrid-row');
		return parseInt(tr.attr('datagrid-row-index'));
	}
	function getRowData(target) {
		return $node.datagrid("getRows")[getRowIndex(target)];
	}

	WUI.account = {};
	WUI.account.editrow = function(target) {
		var account = getRowData(target);
		accountDialog(account);
	}
	WUI.account.enablerow = function(target) {
		var account = getRowData(target);
		$.messager.confirm('确认', '确定要启用帐号【' + account.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.put(accountUrl + "/enable/" + account.ID, {
					ENABLE : true
				}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "启用帐号失败！");
				});
			}
		});
	}
	WUI.account.disablerow = function(target) {
		var account = getRowData(target);
		$.messager.confirm('确认', '确定要禁用帐号【' + account.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.put(accountUrl + "/enable/" + account.ID, {
					ENABLE : false
				}, function() {
					$node.datagrid("reload");
				}, function() {
					$.messager.alert('失败', "禁用帐号失败！");
				});
			}
		});
	}

	function accountDialog(account) {
		$('#account-dialog').dialog({
			iconCls : account ? "icon-edit" : "icon-add",
			title : account ? "修改帐号" : "添加帐号",
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : '/account/account-dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#account-department-sel').combobox({
					url : '/account/departments',
					method : 'get',
					valueField : 'ID',
					textField : 'NAME',
					onSelect : function(rec) {
						var url = '/account/personnelsNotAccount?departmentId=' + rec.ID;
						$('#account-personnel-sel').combobox('reload', url);
					},
					onLoadSuccess : function() {
						if (account) {
							$('#account-department-sel').combobox("setValue", account.DEPARTMENT);
							$('#account-department-sel').combobox('disable');
						} else {
							var departments = $('#account-department-sel').combobox("getData");
							if (departments.length > 0) {
								$('#account-department-sel').combobox("setValue", departments[0].ID);
							} else {
								$('#account-department-sel').combobox("clear");
							}
						}
					}
				});
				$('#account-personnel-sel').combobox({
					method : 'get',
					valueField : 'ID',
					textField : 'NAME',
					onLoadSuccess : function() {
						if (account) {
							$('#account-personnel-sel').combobox("setValue", account.ID);
							$('#account-personnel-sel').combobox('disable');
						} else {
							var personnels = $('#account-personnel-sel').combobox("getData");
							if (personnels.length > 0) {
								$('#account-personnel-sel').combobox("setValue", personnels[0].ID);
							} else {
								$('#account-personnel-sel').combobox("clear");
							}
						}
					}
				});
				$('#account-role').combobox({
					url : '/account/roles',
					method : 'get',
					valueField : 'ID',
					textField : 'NAME',
					onLoadSuccess : function() {
						if (account) {
							$('#account-role').combobox("setValue", account.ROLE_ID);
						} else {
							var roles = $('#account-role').combobox("getData");
							if (roles.length > 0) {
								$('#account-role').combobox("setValue", roles[0].ID);
							}
						}
					}
				});
				$('#account-theme').combobox({
					url : '/account/themes',
					method : 'get',
					valueField : 'type',
					textField : 'name',
					onLoadSuccess : function() {
						if (account) {
							$('#account-theme').combobox("setValue", account.DEFAULT_THEME);
						} else {
							$('#account-theme').combobox("setValue", 'default');
						}
					}
				});
				if (account) {
					$('#account-txt').val(account.ACCOUNT);
					$('#account-txt').validatebox({
						'readonly' : true
					});
					$('#account-password').validatebox({
						readonly : true
					});
					$('#account-password-confirm').validatebox({
						readonly : true
					});
				} else {
					$('#account-txt').validatebox({
						validType : 'username'
					});
					$('#account-password').validatebox({
						required : true,
						validType : 'length[1,32]'
					});
					$('#account-password-confirm').validatebox({
						required : true,
						validType : "equalTo['#account-password']",
						invalidMessage : "两次输入密码不匹配"
					});
				}
			},
			modal : true,
			onClose : function() {
				$("#account-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#account-txt').val();
					isValid = isValid && $("#account-personnel-sel").combobox("getValue");
					isValid = isValid && $("#account-role").combobox("getValue");
					isValid = isValid && $('#account-theme').combobox("getValue");
					isValid = isValid && $('#account-personnel-sel').combobox('getValue');
					if (!account) {
						isValid = isValid && $('#account-password').val();
						isValid = isValid && $('#account-password-confirm').val();
						if ($('#account-password').val() !== $('#account-password-confirm').val()) {
							isValid = false;
						}
					}
					if (!isValid) {
						return;
					}

					var newAccount = {
						ROLE_ID : $('#account-role').combobox("getValue"),
						DEFAULT_THEME : $('#account-theme').combobox("getValue"),
						ID : $("#account-personnel-sel").combobox("getValue")
					};

					if (account) {
						WUI.ajax.put(accountUrl, newAccount, function() {
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "修改帐号失败！");
						});
					} else {
						newAccount.ACCOUNT = $('#account-txt').val();
						newAccount.LOGIN_PASSWORD = $('#account-password').val();
						WUI.ajax.post(accountUrl, newAccount, function() {
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "添加帐号失败！");
						});
					}
					$('#account-dialog').dialog("close");
				}
			}, {
				text : '取消',
				handler : function() {
					$('#account-dialog').dialog("close");
				}
			} ]
		});
	}
});