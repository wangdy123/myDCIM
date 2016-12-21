$(function() {
	var itemUrl = WUI.urlPath+"/dashboard/items";
	var userItemUrl = WUI.urlPath+"/dashboard/userItems";
	var itemIdPrefix = "dashboard-item-";
	$node = $('#dashboard-pannel');
	var columnCount = 3;
	$node.panel({	
		fit:true,
	});
	$node.portal({
		onStateChange : saveItems
	});
	
	$(window).resize(function() {
		$node.portal('resize');
	});
	

	function saveItems() {
		var userItems = [];
		for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
			var panels = $node.portal('getPanels', columnIndex);
			for (var i = 0; i < panels.length; i++) {
				userItems.push({
					index : panels[i].attr('id').substring(itemIdPrefix.length),
					columnIndex : columnIndex
				});
			}
		}
		WUI.ajax.post(userItemUrl, {
			items : userItems
		});
		return userItems;
	}

	function isInDashboard(index) {
		for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
			var panels = $node.portal('getPanels', columnIndex);
			for (var i = 0; i < panels.length; i++) {
				if (parseInt(panels[i].attr('id').substring(itemIdPrefix.length), 10) === index) {
					return true;
				}
			}
		}
		return false;
	}
	
	$("#arrange-dashboard-bt").click(function() {
		WUI.ajax.get(itemUrl, {}, function(data, status) {
			$('#dashboard-dialog').dialog({
				title : '桌面整理',
				left : ($(window).width() - 300) * 0.5,
				top : ($(window).height() - 400) * 0.5,
				width : 300,
				closed : false,
				cache : false,
				href : WUI.urlPath+'/dashboard/dialog.html',
				modal : true,
				onClose : function() {
					$("#dashboard-dialog").empty();
				},
				onLoad : function() {
					$(".dashboard-item").click(function(evt) {
						var index = parseInt($(evt.target).val(), 10);
						if (isInDashboard(index)) {
							for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
								var panels = $node.portal('getPanels', columnIndex);
								for (var i = 0; i < panels.length; i++) {
									if (panels[i].attr('id') === (itemIdPrefix + index)) {
										$node.portal('remove',panels[i]);
										$(evt.target).removeAttr("checked");
										saveItems();
										return;
									}
								}
							}
						} else {
							var items = data.items;
							$(evt.target).attr("checked","checked");
							for (var i = 0; i < items.length; i++) {
								if (index === items[i].index) {
									var columnIndex = items[i].columnIndex;
									if (columnIndex >= columnCount) {
										columnIndex = columnCount - 1;
									}
									addPanel(data.items[i], columnIndex);
									saveItems();
									return;
								}
							}
						}
						// $node.portal('resize');
					});
				}
			});
		});
	});

	function addPanel(option, columnIndex) {
		option.id = itemIdPrefix + option.index;
		var p = $('<div/>').attr('id', option.id).appendTo('body');
		p.panel(option);
		$node.portal('add', {
			panel : p,
			columnIndex : columnIndex
		});
	}
	WUI.ajax.get(userItemUrl, {}, function(data, status) {
		columnCount = data.columnCount;
		for (var i = 0; i < data.items.length; i++) {
			if (data.items[i].columnIndex >= columnCount) {
				data.items[i].columnIndex = columnCount - 1;
			}
			addPanel(data.items[i], data.items[i].columnIndex);
		}
		$node.portal('resize');
	}, function(status) {
		alert("\n状态: " + status);
	});

});