(function() {

	const MOUSE_POINTER_ID = 255;
	const INITIAL_LINE_LENGTH = 50;
	const INTERSECTION_CHECK_LINE_LENGTH = 10000;

	const START_POSITION = { x: 50, y: 200 };

	var borders = [
		// outer
		{ fromX: 50, fromY: 50, toX: 550, toY: 50, selected: false },
		{ fromX: 550, fromY: 50, toX: 550, toY: 550, selected: false },
		{ fromX: 550, fromY: 550, toX: 50, toY: 550, selected: false },
		{ fromX: 50, fromY: 550, toX: 50, toY: 50, selected: false },
		// inner
		{ fromX: 400, fromY: 200, toX: 400, toY: 400, selected: false },
	];

	var canvas, context;

	function drawBox() {
		borders.forEach((item) => {
			context.beginPath();
			context.strokeStyle = (item.selected ? "red" : "gray");
			context.moveTo(item.fromX, item.fromY);
			context.lineTo(item.toX, item.toY);
			context.stroke();
		});
	}

	function drawCircle(x, y, radius, color) {
	    context.beginPath();
	    context.arc(x, y, radius, 0, Math.PI * 2, false);
	    context.fillStyle = color;
	    context.fill();
	}

	function drawLine(fromX, fromY, toX, toY, color) {
		context.beginPath();
		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.strokeStyle = color;
		context.stroke();
	}

	function getDistance(point1, point2) {
		return Math.sqrt(Math.abs(Math.pow(point1.y - point2.y, 2) + Math.pow(point1.x - point2.x, 2)));
	}

	function markClosestIntersectLines(pointerData) {
		var closestBorder = null, closestIntersectionPoint = null;
		var minimumDistance = null;
		borders.forEach((border) => {
			var pointOnLine = helpers.pointOnLine(START_POSITION, {x: border.fromX, y: border.fromY}, {x: border.toX, y: border.toY});
			var intersectPoint = !pointOnLine && helpers.intersect(
									START_POSITION.x, START_POSITION.y, pointerData.x, pointerData.y,
									border.fromX, border.fromY, border.toX, border.toY);

			if (!pointOnLine && intersectPoint) {
				var currentDistance = getDistance(START_POSITION, intersectPoint);
				if (!minimumDistance || minimumDistance > currentDistance) {
					closestBorder = border;
					closestIntersectionPoint = intersectPoint;
				}
			}

			border.selected = false;
		});

		if (closestBorder)
			closestBorder.selected = true;

		return closestIntersectionPoint;
	}

	var app = new PLAYGROUND.Application({

		create: function() {
			canvas = this.layer.canvas;
			context = this.layer.context;
		},

		render: function() {

		    var pointerData = this.pointers[MOUSE_POINTER_ID];
		    var intersectionPoint = null;
		    if (pointerData) {
				var angle = Math.atan2(pointerData.y - START_POSITION.y, pointerData.x - START_POSITION.x);
				var toX = (Math.round(START_POSITION.x + (INITIAL_LINE_LENGTH * Math.cos(angle))));
				var toY = (Math.round(START_POSITION.y + (INITIAL_LINE_LENGTH * Math.sin(angle))));

				var interSectionCheck = {
					x: Math.round(START_POSITION.x + (INTERSECTION_CHECK_LINE_LENGTH * Math.cos(angle))),
					y: Math.round(START_POSITION.y + (INTERSECTION_CHECK_LINE_LENGTH * Math.sin(angle)))
				};

				intersectionPoint = markClosestIntersectLines(interSectionCheck);
			}

			// Drawing
		    this.layer.clear("#FFFFFF");
		    drawBox();

		    if (pointerData) {
				drawLine(START_POSITION.x, START_POSITION.y, toX, toY, "gray");
				drawCircle(toX, toY, 4, "#FF4444");
		    }

		    if (intersectionPoint) {
				drawLine(toX, toY, intersectionPoint.x, intersectionPoint.y, "gray");
		    	drawCircle(intersectionPoint.x, intersectionPoint.y, 4, "#91C8FF");
		    }

		    drawCircle(START_POSITION.x, START_POSITION.y, 4, "#70FFAE");
		}
	});
})();

