$(document).ready(
		function() {
			var $treeNode = $('#nav-station-tree');
			var showTypes = [ WUI.objectTypeDef.CSC, WUI.objectTypeDef.LSC, WUI.objectTypeDef.REGION,
					WUI.objectTypeDef.STATION_BASE ];
			window.WUI.createNavTree($treeNode, showTypes, WUI.objectTypeDef.STATION_BASE);
		});
