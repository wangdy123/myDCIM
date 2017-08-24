var xlsx = require('node-xlsx');
var fs = require('fs');
// 读取文件内容
var obj = xlsx.parse(__dirname + '/doc/行政区.xlsx');
var excelObj = obj[0].data;
var areaCodes = [];
function getType(code) {
	if (code.slice(2, 6) == '0000') {
		return 1;
	}
	if (code.slice(4, 6) == '00') {
		return 2;
	}
	return 3;
}
function findParent(code, roots) {
	for (var i = 0; i < roots.length; i++) {
		if (code == roots[i].code) {
			return roots[i];
		}
	}
}
excelObj.forEach(function(item) {
	var areaS = item[0];
	var areaCode = {
		code : areaS.slice(0, 6),
		name : areaS.slice(6).replace(/^\s+|\s+$/g, "")
	};
	areaCode.type = getType(areaCode.code);
	if (areaCode.type === 1) {
		areaCodes.push(areaCode);
		return;
	}
	if (areaCode.type === 2) {
		var parent = findParent(areaCode.code.slice(0, 2) + "0000", areaCodes);
		if (!parent) {
			return;
		}
		if (!parent.children) {
			parent.children = [];
		}
		parent.children.push(areaCode);
		return;
	}

	var root = findParent(areaCode.code.slice(0, 2) + "0000", areaCodes);
	if (!root) {
		return;
	}
	var parent = findParent(areaCode.code.slice(0, 4) + "00", root.children);
	if (!parent) {
		return;
	}
	if (!parent.children) {
		parent.children = [];
	}
	parent.children.push(areaCode);
	return;

});
fs.writeFile(__dirname + '/conf/reginCode.json', JSON.stringify(areaCodes,null,4), function() {

});
