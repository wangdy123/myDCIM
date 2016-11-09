
	var panels = [ {
		id : 'p1',
		title : 'Tutorials',
		height : 200,
		collapsible : true,
		href : '/monitor/page.html'
	}, {
		id : 'p2',
		title : 'Clock',
		href : '/monitor/page.html'
	}, {
		id : 'p3',
		title : 'PropertyGrid',
		height : 200,
		collapsible : true,
		closable : true,
		href : '/monitor/page.html'
	}, {
		id : 'p4',
		title : 'DataGrid',
		height : 200,
		closable : true,
		href : '/monitor/page.html'
	}, {
		id : 'p5',
		title : 'Searching',
		href : '/monitor/page.html'
	}, {
		id : 'p6',
		title : 'Graph',
		href : '/monitor/page.html'
	} ];
	function getCookie(name) {
		var cookies = document.cookie.split(';');
		if (!cookies.length)
			return '';
		for (var i = 0; i < cookies.length; i++) {
			var pair = cookies[i].split('=');
			if ($.trim(pair[0]) == name) {
				return $.trim(pair[1]);
			}
		}
		return '';
	}
	function getPanelOptions(id) {
		for (var i = 0; i < panels.length; i++) {
			if (panels[i].id == id) {
				return panels[i];
			}
		}
		return undefined;
	}
	function getPortalState() {
		var aa = [];
		for (var columnIndex = 0; columnIndex < 3; columnIndex++) {
			var cc = [];
			var panels = $('#pp').portal('getPanels', columnIndex);
			for (var i = 0; i < panels.length; i++) {
				cc.push(panels[i].attr('id'));
			}
			aa.push(cc.join(','));
		}
		return aa.join(':');
	}
	function addPanels(portalState) {
		var columns = portalState.split(':');
		for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
			var cc = columns[columnIndex].split(',');
			for (var j = 0; j < cc.length; j++) {
				var options = getPanelOptions(cc[j]);
				if (options) {
					var p = $('<div/>').attr('id', options.id).appendTo('body');
					p.panel(options);
					$('#pp').portal('add', {
						panel : p,
						columnIndex : columnIndex
					});
				}
			}
		}

	}

	$(function() {
		$('#pp').portal({
			onStateChange : function() {
				var state = getPortalState();
				var date = new Date();
				date.setTime(date.getTime() + 24 * 3600 * 1000);
				document.cookie = 'portal-state=' + state + ';expires=' + date.toGMTString();
			}
		});
		var state = getCookie('portal-state');
		if (!state) {
			state = 'p1,p2:p3,p4:p5,p6'; // the default portal state
		}
		addPanels(state);
		$('#pp').portal('resize');
	});