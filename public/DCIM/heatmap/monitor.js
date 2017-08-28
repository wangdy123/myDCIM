$(document).ready(function() {
	var heatmapInstance = h337.create({
		container : document.getElementById('heatmapContainer'),
		radius : 100,
		maxOpacity : .5,
		minOpacity : 0,
		blur : .75
	});

	// heatmapInstance.addData(dataPoints);
	var data = {
		max : 50,
		min : -20,
		data : []
	};
	heatmapInstance.setData(data);
	var d = document.getElementById('heatmapContainer');

	for (var i = 0; i <= $("#heatmapContainer").width(); i = i + 100) {
		for (j = 0; j <= $("#heatmapContainer").height(); j = j + 100) {
			heatmapInstance.addData({
				x : i,
				y : j,
				value : Math.random() * 70 - 20
			});
		}
	}

	$("#heatmapContainer").click(function(e) {
		var $dom=$("#heatmapContainer");
		console.log((e.pageX-$dom.offset().left)+":"+(e.pageY-$dom.offset().top));
		var v = heatmapInstance.getValueAt({
			x : e.pageX-$dom.offset().left,
			y : e.pageY-$dom.offset().top
		});
		console.log(v ? v-20 : "null");
	});

	WUI.subscribe('open_object', function(event) {
		if (!event.object) {
			return;
		}
		$("#workspace-title").text(event.object.NAME);

	},"heatmap");
});
