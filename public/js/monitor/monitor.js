window.WUI = window.WUI || {};

$(document).ready(function() {
	$('#monitor-tabs').tabs({
		tools : [ {
			iconCls : 'icon-add',
			handler : function() {
				$('#monitor-tabs').tabs('add', {
					title : 'New Tab',
					content : 'Tab Body',
					closable : true,
					index : 2,
					tools : [ {
						iconCls : 'icon-mini-refresh',
						handler : function() {
							alert('refresh');
						}
					} ]
				});
			}
		}, {
			iconCls : 'icon-save',
			handler : function() {
				alert('save')
			}
		} ],
		toolPosition : "right",
		onSelect : function(title) {
			alert(title + ' is selected');
		}
	});
	$tab = $('#monitor-tabs').tabs("getTab", 1);
	$('#monitor-tabs').tabs("getTab", 0).load("/monitor/page.html", function(responseTxt, statusTxt, xhr) {
		if (statusTxt == "success") {
			// alert("外部内容加载成功!");
		} else if (statusTxt == "error") {
			// alert("Error: " + xhr.status + ": " + xhr.statusText);
		}
	});
	$('#monitor-tabs').tabs("getTab", 1).load("/NewFile.html", function(responseTxt, statusTxt, xhr) {
		if (statusTxt == "success") {
			// alert("外部内容加载成功!");
		} else if (statusTxt == "error") {
			// alert("Error: " + xhr.status + ": " + xhr.statusText);
		}
	});

});