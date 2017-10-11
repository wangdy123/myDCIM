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
			}, "navigation");
			var currentObject = null;
			WUI.subscribe('open_object', function(event) {
				if (event.publisher === publisherName) {
					return;
				}
				if (currentObject && currentObject.ID === event.object.ID) {
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
			}, "navigation");

			WUI.subscribe('request_root_object', function(event) {
				var node = $treeNode.tree('getRoot');
				if (node) {
					event.cbk(node.attributes.data);
				}
			}, "navigation");
		}
	};
	window.WUI.createLogicObjectCombotree = function(config) {
		var objectNodeUrl = 'logicobject/objectNodes';
		function isLeaf(data) {
			try {
				if (!WUI.objectTypes[data.OBJECT_TYPE].childTypes
						|| WUI.objectTypes[data.OBJECT_TYPE].childTypes.length === 0) {
					return true;
				}
				return false;
			} catch (e) {
				console.log(e);
				return false;
			}
		}
		var cfg = {
			url : objectNodeUrl,
			method : 'get',
			lines : true,
			dnd : true,
			animate : true,
			loadFilter : function(datas, parent) {
				var objects = [];
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					objects.push({
						id : data.ID,
						text : data.NAME,
						state : isLeaf(data) ? "open" : "closed",
						iconCls : WUI.objectTypes[data.OBJECT_TYPE].iconCls,
						attributes : {
							data : data
						}
					});
				}
				return objects;
			}
		};
		if (config.onChange) {
			cfg.onChange = config.onChange;
		}
		config.$node.combotree(cfg);
		this.getValue = function() {
			return config.$node.combotree("getValue");
		};

		this.setValue = function(objectId) {
			config.$node.combotree('setValue', objectId);
			WUI.ajax.get(objectNodeUrl + "/" + objectId, {}, function(obj) {
				config.$node.combotree('setText', obj.NAME);
			});
		};
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
				field : 'OBJECT_TYPE',
				title : '类型',
				formatter : function(value, row, index) {
					return WUI.objectTypes[row.OBJECT_TYPE].name;
				}
			}, {
				field : 'FULL_NAME',
				title : '名称',
			} ] ],
			onDblClickRow : function(index, row) {
				config.selectChange(row);
			}
		});
	};

	window.WUI.openNodeSelectDialog = function($dialogNode, config) {
		var cfg = {
			title : "选择要的节点对象",
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
		};
		$dialogNode.dialog(cfg);
	};
	window.WUI.openSignalSelectDialog = function($dialogNode, config) {
		var cfg = {
			title : "选择信号",
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : 'navigation/signal-select-dialog.html',
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

				$('#object-select-combotree').combotree({
					url : 'logicobject/objectNodes',
					method : 'get',
					queryParams : config.object ? {
						id : config.object.ID
					} : {},
					lines : true,
					dnd : true,
					animate : true,
					iconWidth : 22,
					loadFilter : function(datas, parent) {
						var objects = [];
						for (var i = 0; i < datas.length; i++) {
							var data = datas[i];
							objects.push({
								id : data.ID,
								text : data.NAME,
								state : isLeaf(data) ? "open" : "closed",
								iconCls : WUI.objectTypes[data.OBJECT_TYPE].iconCls,
								attributes : {
									data : data
								}
							});
						}
						return objects;
					},
					onChange : function(rc) {
						$('#signal-select-list').datalist({
							url : 'logicobject/signals/',
							queryParams : {
								parentId : rc
							}
						});
					}
				});
				$('#signal-select-list').datalist({
					method : "get",
					valueField : "SIGNAL_ID",
					textField : "SIGNAL_NAME",
					groupField : "SIGNAL_TYPE",
					singleSelect : true,
					textFormatter : function(value, row) {
						return value + "( " + row.SIGNAL_ID + " )";
					},
					groupFormatter : function(value) {
						return WUI.findFromArray(WUI.signalType, "type", value).name;
					},
					lines : true,
					onDblClickRow : function(index, row) {
						$dialogNode.dialog("close");
						config.onSelect(row);
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
					var signal = $('#signal-select-list').datalist("getSelected");
					if (signal) {
						$dialogNode.dialog("close");
						config.onSelect(signal);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					$dialogNode.dialog("close");
				}
			} ]
		};
		$dialogNode.dialog(cfg);
	};
});