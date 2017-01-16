$(document).ready(
		function() {
			var $treeNode = $("#nav-floor-tree");
			var showTypes = [ WUI.objectTypeDef.CSC, WUI.objectTypeDef.LSC, WUI.objectTypeDef.REGION,
					WUI.objectTypeDef.STATION_BASE, WUI.objectTypeDef.BUILDDING, WUI.objectTypeDef.FLOOR ];
			window.WUI.createNavTree($treeNode, showTypes, WUI.objectTypeDef.FLOOR);
		});