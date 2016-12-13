$(function() {
	window.WUI = window.WUI || {};
	window.WUI.createNavTree = function($treeNode, showTypes, leafType, url) {
		$treeNode.tree({
			url : url ? url : '/navigation/treeNode',
			method : 'get',
			lines : true,
			dnd : true,
			animate : true,
			onClick : function(node) {
				WUI.publishEvent('open_object', node.attributes.data);
			},
			loadFilter : function(datas, parent) {
				var objects = [];
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					if (showTypes.indexOf(datas[i].OBJECT_TYPE) < 0) {
						continue;
					}
					objects.push({
						id : datas[i].ID,
						text : datas[i].NAME,
						state : (leafType && datas[i].OBJECT_TYPE < leafType) ? "closed" : "open",
						iconCls : WUI.objectTypes[datas[i].OBJECT_TYPE].iconCls,
						attributes : {
							data : datas[i]
						}
					});
				}
				return objects;
			},
			onLoadSuccess : function(node, data) {
				if (!node) {
					$treeNode.tree("expand", $treeNode.tree("getRoot").target);
				} else {
					$treeNode.tree("expand", node.target);
				}
			}
		});
		var reload = function(object) {
			var node = $treeNode.tree('find', object.ID);

			if (node) {
				$treeNode.tree('reload', node.target);
			}
		};
		WUI.subscribe('reload_object', reload);
		WUI.subscribe('open_object', function(object) {
			var node = $treeNode.tree('find', object.ID);
			if (node) {
				$treeNode.tree('select', node.target);
			}
		});
		WUI.subscribe('current_object', function(cbk) {
			var node = $treeNode.tree('getSelected');
			if (node) {
				cbk(node.attributes.data);
			}
		});
	}
});
