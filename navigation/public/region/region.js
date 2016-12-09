$(function() {
	$(document).ready(function() {
		$('#nav-object-tree').tree({
			url : '/navigation/treeNode',
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
					objects.push({
						id : datas[i].ID,
						text : datas[i].NAME,
						state : datas[i].OBJECT_TYPE < WUI.objectTypeDef.REGION ? "closed" : "open",
						iconCls : WUI.objectTypes[datas[i].OBJECT_TYPE].iconCls,
						attributes : {
							data : datas[i]
						}
					});
				}
				return objects;
			}
		});

		WUI.subscribe('reload_object', function(object) {
			var node = $('#nav-object-tree').tree('find', object.ID);
			if (node) {
				$('#nav-object-tree').tree('reload', node.target);
			}
		});
		WUI.subscribe('open_object', function(object) {
			var node = $('#nav-object-tree').tree('find', object.ID);
			if (node) {
				$('#nav-object-tree').tree('select', node.target);
			}
		});
		WUI.subscribe('current_object', function(cbk) {
			var node = $('#nav-object-tree').tree('getSelected');
			if (node) {
				cbk(node.attributes.data);
			}
		});
	});
});