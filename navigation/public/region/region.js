$(document).ready(function() {
	var $treeNode = $('#nav-object-tree');
	var showTypes = [ WUI.objectTypeDef.CSC, WUI.objectTypeDef.LSC, WUI.objectTypeDef.REGION ];
	window.WUI.createNavTree($treeNode, showTypes, WUI.objectTypeDef.REGION);
});