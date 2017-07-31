$(function() {
	var screenDataUrl = "monitor/screenData/";
	make.Default.path = 'tw/make/';
	var box = new mono.DataBox();
	var network = new mono.Network3D(box, null, monoCanvas);

	var defaultInteraction = new mono.DefaultInteraction(network);
	var selectionInteraction = new mono.SelectionInteraction(network);
	defaultInteraction.maxDistance = 20000;
	defaultInteraction.minDistance = 30;
	defaultInteraction.zoomSpeed = 3;
	defaultInteraction.panSpeed = 0.2;
	network.setInteractions([ defaultInteraction, selectionInteraction ]);

	var camera = new mono.PerspectiveCamera(30, 1.5, 30, 30000);
	camera.setPosition(200, 4500, 3500);
	network.setCamera(camera);

	mono.Utils.autoAdjustNetworkBounds(network, $("#screen-container")[0], 'clientWidth', 'clientHeight');

	var pointLight = new mono.PointLight(0xFFFFFF, 0.1);
	pointLight.setPosition(8000, 8000, 8000);
	box.add(pointLight);

	box.add(new mono.AmbientLight('white'));

	$("#screen-container").panel({
		'onResize' : function() {
			mono.Utils.autoAdjustNetworkBounds(network, $("#screen-container")[0], 'clientWidth', 'clientHeight');
		}
	});

	var findFirstObjectByMouse = function(network, e) {
		var objects = network.getElementsByMouseEvent(e);
		if (objects.length) {
			for (var i = 0; i < objects.length; i++) {
				var first = objects[i];
				var object3d = first.element;
				if (!(object3d instanceof mono.Billboard)) {
					return first;
				}
			}
		}
		return null;
	}

	var animateCamera = function(camera, interaction, oldPoint, newPoint, onDone) {
		var offset = camera.getPosition().sub(camera.getTarget());
		var animation = new twaver.Animate({
			from : 0,
			to : 1,
			dur : 500,
			easing : 'easeBoth',
			onUpdate : function(value) {
				var x = oldPoint.x + (newPoint.x - oldPoint.x) * value;
				var y = oldPoint.y + (newPoint.y - oldPoint.y) * value;
				var z = oldPoint.z + (newPoint.z - oldPoint.z) * value;
				var target = new mono.Vec3(x, y, z);
				camera.lookAt(target);
				interaction.target = target;
				var position = new mono.Vec3().addVectors(offset, target);
				camera.setPosition(position);
			},
		});
		animation.onDone = onDone;
		animation.play();
	}

	network.getRootView().addEventListener('dblclick', function(e) {
		var firstClickObject = findFirstObjectByMouse(network, e);
		if (firstClickObject) {
			var element = firstClickObject.element;
			var oldPoint = camera.t();
			var newPoint = firstClickObject.point;
			var interaction = network.getDefaultInteraction()
			if (element.getClient('animation')) {
				make.Default.playAnimation(element, element.getClient('animation'));
			} else {
				animateCamera(camera, interaction, oldPoint, newPoint);
			}
		}
	});

	$("#screem-move-up-btn").click(function() {
		network.moveUp();
	});
	$("#screem-move-down-btn").click(function() {
		network.moveDown();
	});
	$("#screem-move-left-btn").click(function() {
		network.moveLeft();
	});
	$("#screem-move-right-btn").click(function() {
		network.moveRight();
	});

	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		if (!event.object) {
			return;
		}
		if (currentObject && currentObject.ID === event.object.ID) {
			return;
		}
		currentObject = event.object;
		openObject(currentObject);
	}, "screen");

	function openObject(object) {
		network.getDataBox().clear();
		if (!object) {
			return;
		}
		window.WUI.ajax.get(screenDataUrl + object.ID, {}, function(jsonObject) {
			var object3ds = make.Default.load({
				id : "twaver.combo",
				data : jsonObject
			});
			network.getDataBox().addByDescendant(object3ds);
			network.zoomEstimateOverview();
		});
	}

	WUI.publishEvent('request_current_object', {
		publisher : "screem_panel",
		cbk : function(object) {
			currentObject = object;
			openObject(currentObject);
		}
	});
});