window.WUI = window.WUI || {};
WUI.navObjectTree = {
	append : function() {
		var t = $('#nav-object-tree');
		var node = t.tree('getSelected');
		t.tree('append', {
			parent : (node ? node.target : null),
			data : [ {
				id : 1521,
				text : 'new item1'
			} ]
		});
	},
	removeit : function() {
		var node = $('#nav-object-tree').tree('getSelected');
		$('#nav-object-tree').tree('remove', node.target);
	},
	reload : function() {
		var node = $('#nav-object-tree').tree('getSelected');
		$('#nav-object-tree').tree('reload', node.target);
	},
	add : function() {
		var node = $('#nav-object-tree').tree('getSelected');
		if (node) {
			$('#nav-object-tree').tree('insert', {
				before : node.target,
				data : {
					id : 21,
					text : 'node text'
				}
			});
		} else {
			$('#nav-object-tree').tree('insert', {
				data : {
					id : 21,
					text : 'node text'
				}
			});
		}
	},
	reloadAll : function() {
		$('#nav-object-tree').tree('reload');
	}
};

$(document).ready(function() {
	$('#nav-object-tree').tree({
		url : '/monitor/treeNode',
		method : 'get',
		lines : true,
		checkbox : true,
		dnd : true,
		animate : true,
		onClick : function(node) {
			alert(node.attributes.data);
		},
		onContextMenu : function(e, node) {
			e.preventDefault();
			$(this).tree('select', node.target);
			$('#nav-tree-menu').menu('show', {
				left : e.pageX,
				top : e.pageY
			});
		},
		loadFilter : function(datas, parent) {
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				if (!data.id) {
					data.id = "id is not";
				}
				if (!data.attributes || !data.attributes.data) {
					data.attributes = data.attributes ? data.attributes : {};
					data.attributes.data = data;
				}
				data.state = "closed";
			}
			return datas;
		},
		toolbar : [ {
			text : 'Add',
			iconCls : 'icon-add',
			handler : function() {
				alert('add')
			}
		}, '-', {
			text : 'Save',
			iconCls : 'icon-save',
			handler : function() {
				alert('save')
			}
		} ]
	});

	$tree = $('#nav-object-tree');
	var nodes = $tree.tree("getRoots");
	for (var i = 0; i < nodes.length; i++) {
		$tree.tree("expand", nodes[i].target);
	}

});