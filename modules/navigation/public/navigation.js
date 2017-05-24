$(function() {
	window.WUI = window.WUI || {};
	var publisherName = "navigation";
	window.WUI.createNavTree = function($treeNode, config) {
		config.eventEnable = config.eventEnable ? config.eventEnable : false;
		function isLeaf(data) {
			if (config.isLeaf) {
				return config.isLeaf(data);
			}
			return false;
		}

		function getIconCls(data) {
			try {
				return WUI.objectTypes[data.OBJECT_TYPE].iconCls;
			} catch (e) {
				console.log(data.OBJECT_TYPE);
				console.log(e);
				return "";
			}
		}
		function showEable(data) {
			if (config.showEable) {
				return config.showEable(data);
			}
			return true;
		}
		$treeNode.tree({
			url : config.url ? config.url : 'navigation/objectNodes',
			method : 'get',
			lines : true,
			dnd : true,
			animate : true,
			onSelect : function(node) {
				if (config.eventEnable) {
					WUI.publishEvent('open_object', {
						publisher : publisherName,
						object : node.attributes.data
					});
				}
			},

			loadFilter : function(datas, parent) {
				var objects = [];
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					if (!showEable(data)) {
						continue;
					}
					objects.push({
						id : data.ID,
						text : data.NAME,
						state : isLeaf(data) ? "open" : "closed",
						iconCls : getIconCls(data),
						attributes : {
							data : data
						}
					});
				}
				return objects;
			},
			onLoadSuccess : function(node, data) {
				if (!node) {
					$treeNode.tree("expand", $treeNode.tree("getRoot").target);
				} else {
					if (node.attributes.data.OBJECT_TYPE === WUI.objectTypeDef.REGION) {
						$treeNode.tree("expand", node.target);
					}
				}
			}
		});
		function reload(object) {
			var node = $treeNode.tree('find', object.ID);
			if (node) {
				$treeNode.tree('reload', node.target);
			}
		}

		if (config.eventEnable) {
			WUI.subscribe('reload_object', function(event) {
				if (event.publisher === publisherName) {
					return;
				}
				reload(event.object);
			});
			WUI.subscribe('open_object', function(event) {
				if (event.publisher === publisherName) {
					return;
				}
				var node = $treeNode.tree('find', event.object.ID);
				if (node) {
					$treeNode.tree('scrollTo', node.target);
					$treeNode.tree('expandTo', node.target);
					$treeNode.tree('select', node.target);
				}
			});
			WUI.subscribe('request_current_object', function(event) {
				var node = $treeNode.tree('getSelected');
				if (node) {
					event.cbk(node.attributes.data);
				}
			});
		}
	}
});

window.WUI.openNodeSelectDialog = function($dialogNode, config) {
	$dialogNode.dialog({
		title : "选择要标记的对象",
		left : ($(window).width() - 300) * 0.5,
		top : ($(window).height() - 300) * 0.5,
		width : 350,
		closed : false,
		cache : false,
		href : 'navigation/object-select-dialog.html',
		onLoadError : function() {
			$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
		},
		onLoad : function() {
			function isLeaf(data) {
				if (config.isLeaf) {
					return config.isLeaf(data);
				}
				return false;
			}
			$("#object-select-tree").tree({
				url : config.url ? config.url : 'navigation/objectNodes',
				method : 'get',
				lines : true,
				dnd : true,
				animate : true,
				onDblClick : function(node) {
					$dialogNode.dialog("close");
					config.onSelect(node.attributes.data);
				},
				loadFilter : function(datas, parent) {
					var objects = [];
					for (var i = 0; i < datas.length; i++) {
						objects.push({
							id : datas[i].ID,
							text : datas[i].NAME,
							state : isLeaf(datas[i]) ? "open" : "closed",
							iconCls : WUI.objectTypes[datas[i].OBJECT_TYPE].iconCls,
							attributes : {
								data : datas[i]
							}
						});
					}
					return objects;
				},
				onLoadSuccess : function(node, data) {
					$("#object-select-tree").tree("expandAll");
				}
			});
		},
		modal : true,
		onClose : function() {
			$dialogNode.empty();
		},
		buttons : [ {
			text : '确定',
			handler : function() {
				var node = $("#object-select-tree").tree("getSelected");
				if (node) {
					$dialogNode.dialog("close");
					config.onSelect(node.attributes.data);
				}
			}
		}, {
			text : '取消',
			handler : function() {
				$dialogNode.dialog("close");
			}
		} ]
	});
};