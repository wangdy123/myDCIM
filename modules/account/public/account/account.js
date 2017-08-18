$(function() {
	var accountUrl = "account/accounts";
	var personnelUrl = "account/personnels";
	var departmentUrl = "account/departments";
	var personnelsNotAccountUrl = "account/personnelsNotAccount";
	var roleUrl = "account/roles";
	var themesUrl = "account/themes";
	$node = $('#account-grid');

	$node.datagrid({
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
		columns : [ [ {
			field : 'action',
			title : '操作',
			width : 100,
			align : 'center',
			formatter : function(value, row, index) {
				if (!row.PERSONNEL_ENABLE) {
					return "";
				}
				var e = '<div class="icon-edit operator-tool" title="修改" onclick="WUI.account.editrow(this)"></div> ';
				var s = '<div class="separater"></div> ';
				var d = "";
				if (row.ENABLE) {
					d = '<div class="icon-no operator-tool" title="禁用" onclick="WUI.account.disablerow(this)"></div>';
				} else {
					d = '<div class="icon-ok operator-tool" title="启用" onclick="WUI.account.enablerow(this)"></div>';
				}
				return e + s + d;
			}
		}, {
			field : 'ID',
			title : '编码',
			align : 'right',
			width : 80
		}, {
			field : 'JOB_NUMBER',
			title : '工号',
			width : 150
		}, {
			field : 'NAME',
			title : '姓名',
			width : 150
		}, {
			field : 'ACCOUNT',
			title : '帐号',
			width : 150
		}, {
			field : 'ROLE_NAME',
			title : '角色',
			resizable : true,
			formatter : function(value, row, index) {
				var roleNames = [];
				for (var i = 0; i < row.roles.length; i++) {
					roleNames.push(row.roles[i].NAME);
				}
				return roleNames.join('，');
			}
		}, {
			field : 'DEFAULT_THEME',
			title : '主题',
			width : 100
		}, {
			field : 'DEPARTMENT_NAME',
			title : '所在部门',
			width : 150
		}, {
			field : 'ENABLE',
			title : '是否启用',
			width : 100,
			formatter : function(value, row, index) {
				return '<div class="' + (row.ENABLE ? 'icon-ok' : 'icon-no') + ' operator-tool"></div> ';
			}
		}, {
			field : 'HOME_PAGE',
			title : '主页',
			width : 150,
			formatter : function(value, row, index) {
				for (var i = 0; i < WUI.menus.length; i++) {
					var childMenus = WUI.menus[i].childMenus;
					for (var j = 0; j < childMenus.length; j++) {
						if (childMenus[j].id === row.HOME_PAGE) {
							return childMenus[j].name;
						}
					}
				}
				return '';
			}
		} ] ]
	});

	WUI.account = {};
	WUI.account.editrow = function(target) {
		var account = WUI.getDatagridRow($node, target);
		accountDialog(account);
	};
	WUI.account.enablerow = function(target) {
		var account = WUI.getDatagridRow($node, target);
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
	};
	WUI.account.disablerow = function(target) {
		var account = WUI.getDatagridRow($node, target);
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
	};

	function accountDialog(account) {
		var cfg = {
			iconCls : account ? "icon-edit" : "icon-add",
			title : account ? "修改帐号" : "添加帐号",
			left : ($(window).width() - 500) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 650,
			closed : false,
			cache : false,
			href : 'account/account/account-dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#account-department-sel').combobox({
					url : departmentUrl,
					editable : false,
					method : 'get',
					disabled : account ? true : false,
					valueField : 'ID',
					textField : 'NAME',
					onSelect : function(rec) {
						var url = account ? personnelUrl : (personnelsNotAccountUrl + '?departmentId=' + rec.ID);
						$('#account-personnel-sel').combobox('reload', url);
					},
					onLoadSuccess : function() {
						if (account) {
							$('#account-department-sel').combobox("setValue", account.DEPARTMENT);
						} else {
							var departments = $('#account-department-sel').combobox("getData");
							if (departments.length > 0) {
								$('#account-department-sel').combobox("setValue", departments[0].ID);
							} else {
								$('#account-department-sel').combobox("clear");
							}
						}
					},
					keyHandler : {
						down : function(e) {
							$('#account-department-sel').combobox("showPanel");
						}
					}

				});
				$('#account-personnel-sel').combobox({
					url : account ? personnelUrl : personnelsNotAccountUrl,
					editable : false,
					keyHandler : {
						down : function(e) {
							$('#account-personnel-sel').combobox("showPanel");
						}
					},
					disabled : account ? true : false,
					method : 'get',
					valueField : 'ID',
					textField : 'NAME',
					onLoadSuccess : function() {
						if (account) {
							$('#account-personnel-sel').combobox("setValue", account.ID);
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

				var menus = [];
				for (var i = 0; i < WUI.menus.length; i++) {
					var childMenus = WUI.menus[i].childMenus;
					for (var j = 0; j < childMenus.length; j++) {
						childMenus[j].group=WUI.menus[i].name;
						menus.push(childMenus[j]);
					}
				}
				$('#account-home-page').combobox({
					valueField : 'id',
					textField : 'name',
					groupField : "group",
					singleSelect : true,
					editable : false,
					data : menus
				});

				WUI.ajax.get(roleUrl, {}, function(roloes) {
					function isAccountRole(role) {
						if (!account) {
							return false;
						}
						for (var i = 0; i < account.roles.length; i++) {
							if (role.ID === account.roles[i].ROLE_ID) {
								return true;
							}
						}
						return false;
					}
					for (var i = 0; i < roloes.length; i++) {
						var role = roloes[i];
						var item = '<div style="display: inline-block; min-width: 150px;">'
								+ '<input type="checkbox" class="account-role-item" '
								+ (isAccountRole(role) ? "checked" : "") + ' value="' + role.ID + '">' + role.NAME
								+ '</div>';
						$('#account-roles-td').append(item);
					}
				});

				$('#account-theme').combobox({
					url : themesUrl,
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
					$('#account-txt').textbox("setValue", account.ACCOUNT);
					$('#account-home-page').combobox("setValue", account.HOME_PAGE);
					$('#account-txt').textbox({
						disabled : true
					});
					$('#account-password').textbox({
						disabled : true
					});
					$('#account-password-confirm').textbox({
						disabled : true
					});
				} else {
					$('#account-txt').textbox({
						validType : 'username'
					});
					$('#account-password').textbox({
						required : true,
						validType : 'password'
					});
					$('#account-password-confirm').textbox({
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
					isValid = isValid && $('#account-theme').combobox("getValue");
					isValid = isValid && $('#account-personnel-sel').combobox('getValue');
					if (!account) {
						isValid = isValid && $('#account-password').textbox("isValid");
						isValid = isValid && $('#account-password-confirm').textbox("isValid");
						if ($('#account-password').val() !== $('#account-password-confirm').val()) {
							isValid = false;
						}
					}
					if (!isValid) {
						return;
					}

					var newAccount = {
						DEFAULT_THEME : $('#account-theme').combobox("getValue"),
						ID : parseInt($("#account-personnel-sel").combobox("getValue"), 10),
						HOME_PAGE : parseInt($('#account-home-page').combobox("getValue")),
						roles : []
					};
					var roleItems = $(".account-role-item");
					for (var i = 0; i < roleItems.length; i++) {
						if ($(roleItems[i]).prop('checked')) {
							newAccount.roles.push({
								ROLE_ID : parseInt($(roleItems[i]).val(), 10)
							});
						}
					}
					if (account) {
						WUI.ajax.put(accountUrl, newAccount, function() {
							$('#account-dialog').dialog("close");
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "修改帐号失败！");
						});
					} else {
						newAccount.ACCOUNT = $('#account-txt').val();
						newAccount.LOGIN_PASSWORD = $('#account-password').val();
						WUI.ajax.post(accountUrl, newAccount, function() {
							$('#account-dialog').dialog("close");
							$node.datagrid("reload");
						}, function() {
							$.messager.alert('失败', "添加帐号失败！");
						});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					$('#account-dialog').dialog("close");
				}
			} ]
		};
		$('#account-dialog').dialog(cfg);
	}
});