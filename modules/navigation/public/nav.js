$(document).ready(function() {
	WUI.createNavTree($('#monitor-object-tree'), {
		eventEnable : true
	});
	WUI.createLogicObjectSeachBox({
		seachBox : $('#object-seach-box'),
		resultPanel : $('#seach-result-panel'),
		selectChange : function(object) {
			WUI.publishEvent('open_object', {
				publisher : "seach-box",
				object : object
			});
		},
		seachActive : function() {
			$('#navigation-tab').tabs('select', 1);
		}
	});
});
