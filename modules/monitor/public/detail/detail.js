$(function() {
	var box = new twaver.ElementBox();
	var network = new twaver.vector.Network(box);
	var container = $("#detail-container")[0];
	container.appendChild(network.getView());
	network.adjustBounds({
		x : container.offsetLeft,
		y : container.offsetTop,
		width : container.offsetWidth,
		height : container.offsetHeight
	});
	var node1 = new twaver.Node();
	node1.setName("TWaver");
	node1.setLocation(100, 100);
	box.add(node1);
	var node2 = new twaver.Node();
	node2.setName("HTML5");
	node2.setLocation(300, 200);
	box.add(node2);
	var link = new twaver.Link(node1, node2);
	link.setName("Hello!");
	link.setToolTip("<b>Hello!</b>");
	box.add(link);

});