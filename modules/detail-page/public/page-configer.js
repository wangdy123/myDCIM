WUI.pageConfiger = WUI.pageConfiger || {};
WUI.pageConfiger.pageDialog = function(nodeObject) {
	var pageConfigUrl = 'detail/pageConfig/';
	var $dialog = $('#page-configer-dialog');
	var oldConfig = null;
	var cfg = {
		title : "显示页面配置",
		left : ($(window).width() - 400) * 0.5,
		top : ($(window).height() - 300) * 0.5,
		width : 500,
		closed : false,
		cache : false,
		href : "detail/page-configer-dialog.html",
		onLoadError : function() {
			$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
		},
		onLoad : function() {
			$('#node-page-sel').combobox({
				url : "detail/detailPage",
				queryParams : {
					objectType : nodeObject.OBJECT_TYPE,
					deviceType : nodeObject.DEVICE_TYPE
				},
				editable : false,
				keyHandler : {
					down : function(e) {
						$('#node-page-sel').combobox("showPanel");
					}
				},
				method : 'get',
				valueField : 'pageName',
				textField : 'name',
				onLoadSuccess : function() {
					if (oldConfig) {
						$('#node-page-sel').combobox("setValue", oldConfig.PAGE_NAME);
					}
				},
				onSelect : function(rec) {
					$('#page-configer-panel').panel({
						href : 'detail/page/' + rec.pageName + '/configer.html',
						onLoad : function() {
							WUI.pageConfiger.init(nodeObject, oldConfig ? oldConfig.CONFIG : null);
						}
					});
				}
			});
		},
		modal : true,
		onClose : function() {
			$dialog.empty();
		},
		buttons : [ {
			text : '保存',
			handler : function() {
				var isValid = $('#node-page-sel').combobox("getValue");
				isValid = isValid && WUI.pageConfiger.pageConfigIsValid();
				if (!isValid) {
					return;
				}

				var config = {
					PAGE_NAME : $('#node-page-sel').combobox("getValue"),
					CONFIG : WUI.pageConfiger.getConfiger()
				};

				WUI.ajax.put(pageConfigUrl + nodeObject.ID, config, function() {
					$dialog.dialog("close");
					$.messager.alert('成功', "页面配置保存成功！");
				}, function() {
					$.messager.alert('失败', "修改页面配置失败！");
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$dialog.dialog("close");
			}
		} ]
	};
	WUI.ajax.get(pageConfigUrl + nodeObject.ID, {}, function(result) {
		oldConfig = result;
		$dialog.dialog(cfg);
	}, function() {
		$dialog.dialog(cfg);
	});
};

WUI.pageConfiger.createConfigerColumn = function() {
	return {
		field : 'edit-page',
		title : '配置页面',
		width : 100,
		align : 'center',
		formatter : function(value, row, index) {
			var e = '<a id="btn" href="#" class="easyui-linkbutton" onclick="WUI.pageConfiger.editPage(this)">配置</a>';
			return e;
		}
	};
};
