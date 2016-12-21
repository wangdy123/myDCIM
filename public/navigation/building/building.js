$(document).ready(
		function() {
			var $treeNode = $('#nav-building-tree');
			var showTypes = [ WUI.objectTypeDef.CSC, WUI.objectTypeDef.LSC, WUI.objectTypeDef.REGION,
					WUI.objectTypeDef.STATION_BASE, WUI.objectTypeDef.BUILDDING ];
			window.WUI.createNavTree($treeNode, showTypes, WUI.objectTypeDef.BUILDDING);
		});