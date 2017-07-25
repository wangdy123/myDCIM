$(function() {
	window.WUI = window.WUI || {};
	var publisherName = "navigation";
	var logicObjectSeachUrl = "logicobject/seach";
	window.WUI.createNavTree = function($treeNode, config) {
		var objectNodeUrl = config.url ? config.url : 'logicobject/objectNodes';
		config.eventEnable = config.eventEnable ? config.eventEnable : false;
		function isLeaf(data) {
			try {
				if (config.isLeaf) {
					return config.isLeaf(data);
				} else {
					if (!WUI.objectTypes[data.OBJECT_TYPE].childTypes
							|| WUI.objectTypes[data.OBJECT_TYPE].childTypes.length === 0) {
						return true;
					}
				}
				return false;
			} catch (e) {
				console.log(e);
				return false;
			}
		}

		function getIconCls(data) {
			try {
				return WUI.objectTypes[data.OBJECT_TYPE].iconCls;
			} catch (e) {
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

		function openObject(node) {
			if (config.eventEnable) {
				WUI.publishEvent('open_object', {
					publisher : publisherName,
					object : node.attributes.data
				});
			}
		}

		$treeNode.tree({
			url : objectNodeUrl,
			method : 'get',
			lines : true,
			dnd : true,
			animate : true,
			onSelect : openObject,
			loadFilter : function(datas, parent) {
				var objects = [];
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					if (!showEable(data)) {
						continue;
					}
					var item = {
						id : data.ID,
						text : data.NAME,
						state : isLeaf(data) ? "open" : "closed",
						iconCls : getIconCls(data),
						attributes : {
							data : data
						}
					};
					objects.push(item);
				}
				return objects;
			},
			onLoadSuccess : function(node, data) {
				if (!node) {
					var root = $treeNode.tree("getRoot");
					$treeNode.tree("expand", root.target);
					openObject(root);
					$treeNode.tree("select", root.target);
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

		function appendChildren(children) {
			for (var i = 0; i < children.length; i++) {
				if (children[i].children) {
					var node = $treeNode.tree('find', children[i].ID);
					if (node) {
						$treeNode.tree('append', {
							parent : node.target,
							data : children[i].children
						});
						appendChildren(children[i].children);
					}
				}
			}
		}
		function loadParentTree(obj, callback) {
			var node = $treeNode.tree('find', obj.ID);
			if (node) {
				$treeNode.tree('append', {
					parent : node.target,
					data : obj.children
				});
				appendChildren(obj.children);
				callback();
				return;
			}
			WUI.ajax.get(objectNodeUrl + "/" + obj.PARENT_ID, {}, function(parent) {
				WUI.ajax.get(objectNodeUrl, {
					id : parent.ID
				}, function(results) {
					parent.children = results;
					for (var i = 0; i < results.length; i++) {
						var result = results[i];
						var children = [];
						if (result.ID === obj.ID) {
							children = obj.children || [];
						}
						result.children = children;
					}
					loadParentTree(parent, callback);
				});
			});
		}
		if (config.eventEnable) {
			WUI.subscribe('reload_object', function(event) {
				if (event.publisher === publisherName) {
					return;
				}
				reload(event.object);
			},"navigation");

			WUI.subscribe('open_object', function(event) {
				if (event.publisher === publisherName) {
					return;
				}
				var node = $treeNode.tree('find', event.object.ID);
				if (node) {
					$treeNode.tree('scrollTo', node.target);
					$treeNode.tree('expand', node.target);
					$treeNode.tree('select', node.target);
				} else {
					loadParentTree(event.object, function() {
						var node = $treeNode.tree('find', event.object.ID);
						if (node) {
							$treeNode.tree('scrollTo', node.target);
							$treeNode.tree('expand', node.target);
							$treeNode.tree('select', node.target);
						}
					});
				}
			},"navigation");

			WUI.subscribe('request_root_object', function(event) {
				var node = $treeNode.tree('getRoot');
				if (node) {
					event.cbk(node.attributes.data);
				}
			},"navigation");
		}
	};
	window.WUI.createLogicObjectSeachBox = function(config) {
		config.seachBox.searchbox({
			searcher : function(value) {
				config.seachActive(value);
				config.resultPanel.datagrid({
					"data" : []
				});
				if (!value) {
					return;
				}
				WUI.ajax.get(logicObjectSeachUrl, {
					value : value
				}, function(objects) {
					config.resultPanel.datagrid({
						"data" : objects
					});
				}, function() {
					$.messager.alert('失败', "查询失败！");
				});
			},
			prompt : '名称或编码'
		});
		config.resultPanel.datagrid({
			fit : true,
			loadMsg : '正在查询...',
			emptyMsg : '无查询结果',
			border : false,
			singleSelect : true,
			columns : [ [ {
				field : 'CODE',
				title : '编码'
			}, {
				field : 'NAME',
				title : '名称',
			}, {
				field : 'OBJECT_TYPE',
				title : '类型',
				formatter : function(value, row, index) {
					return WUI.objectTypes[row.OBJECT_TYPE].name;
				}
			} ] ],
			onDblClickRow : function(index, row) {
				config.selectChange(row);
			}
		});
	};

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
					url : config.url ? config.url : 'logicobject/objectNodes',
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
});