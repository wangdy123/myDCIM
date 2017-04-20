$(function() {
	var testUrl = "uitests";
	$node = $('#test-grid');

	$node.datagrid({
		url : testUrl,
		method : "get",
		singleSelect : true,
		onLoadError : function(s) {
			$.messager.alert('失败', "加载失败");
		},
		toolbar : [ {
			iconCls : 'icon-reload',
			handler : function() {
				$node.datagrid("reload");
			}
		} ],
		columns : [ [ {
			field : 'name',
			title : '测试名称',
			formatter : function(value, row, index) {
				return '<a href="' + row.url + '">' + row.name + '</a> ';
			}
		}, {
			field : 'target',
			title : '测试目标'
		} ] ]
	});
});