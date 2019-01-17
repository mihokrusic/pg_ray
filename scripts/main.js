(function() {

	var obstacles = [
		// outer
		{ from: { x: -490, y: -290 }, to: { x: 490, y: -290 }, selected: false },
		{ from: { x: 490, y: -290 }, to: { x: 490, y: 290 }, selected: false },
		{ from: { x: 490, y: 290 }, to: { x: -490, y: 290 }, selected: false },
		{ from: { x: -490, y: 290 }, to: { x: -490, y: -290 }, selected: false },
		// inner
		{ from: { x: -100, y: -150 }, to: { x: -50, y: 50 }, selected: false },
		{ from: { x: -400, y: 50 }, to: { x: -100, y: 150 }, selected: false },
		{ from: { x: 150, y: 50 }, to: { x: 400, y: -150 }, selected: false },
		{ from: { x: 400, y: -130 }, to: { x: 300, y: -130 }, selected: false },
		{ from: { x: 50, y: -50 }, to: { x: 300, y: 100 }, selected: false },
	];

	// Move to class
	var canvas, context;
	var animationHandle;
	var lastTimestamp;

	// TODO: state machine for different states (running, editing, paused...)
	var running = false;

	var editing = false;
	var firstTouchPoint = null;

	var circleRays = false;

	var pointerEvent = null;
	var pointerUpEvent = null;

	var currentRay = {
		vector: {},
		position: {}
	};

	var rays = [];
	var allowNextRay = true;
	var fireRay = false;


	// Create & start
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');
	context.transform(1, 0, 0, -1, canvas.width / 2, canvas.height / 2);

	canvas.addEventListener("mousemove", (event) => onMouseMove(event));
	canvas.addEventListener("mouseup", (event) => onMouseUp(event));
	canvas.addEventListener("keyup", (event) => onKeyUp(event));

	running = true;
	animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));


	function onMouseMove(event) {
		pointerEvent = {
			x: event.clientX - canvas.width / 2,
			y: (event.clientY * -1) + canvas.height / 2
		};
	}


	function onMouseUp(event) {
		pointerUpEvent = event;
		if (!editing)
			fireRay = true;
	};


	function onKeyUp(event) {
		//console.log(event.keyCode);
		switch (event.keyCode) {
			case 32: // SPACE
				running = !running;
				firstTouchPoint = null;
				break;
			case 67: // C
				circleRays = true;
				break;
			case 69: // E
				editing = !editing;
				firstTouchPoint = null;
				rays = [];
				break;
			case 82: // R
				rays = [];
				break;
		}
	};


	function onUpdate(timestamp) {
		if (!lastTimestamp)
			lastTimestamp = timestamp;

		var dt = (timestamp - lastTimestamp) / 1000;

		allowNextRay = true;//(rays.length === 0);

		if (running) {
			if (!editing)
				calculateRays(dt);
			if (editing)
				editObstacles(dt);
		}
	  	render(dt);

	  	lastTimestamp = timestamp;
		animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));
	}


	function editObstacles(dt) {
		if (pointerUpEvent) {
			if (!firstTouchPoint)
				firstTouchPoint = pointerEvent;
			else {
				obstacles.push({
					from: {
						x: firstTouchPoint.x,
						y: firstTouchPoint.y
					},
					to: {
						x: pointerEvent.x,
						y: pointerEvent.y
					},
					selected: false
				});
				firstTouchPoint = null;
			}
			pointerUpEvent = null;
		}
	}


	function calculateRays(dt) {
		if (pointerEvent && allowNextRay) {
			var angle = Math.atan2(pointerEvent.y - START_POSITION.y, pointerEvent.x - START_POSITION.x);
			currentRay.vector = new Vector(Math.cos(angle), Math.sin(angle)).normalize(); // TODO: double creation, blah
			currentRay.position = currentRay.vector.multiplyByScalar(RAY_LENGTH).addVector(START_POSITION);

			var interSectionCheck = currentRay.vector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(START_POSITION);
			var closestIntersection = helpers.getClosestIntersectionLine(START_POSITION, interSectionCheck, obstacles);
			currentRay.intersectionPoint = closestIntersection.point;
			currentRay.nextObstacle = closestIntersection.obstacle;

			if (currentRay.nextObstacle) {
				currentRay.sideOfObstacle = helpers.checkSideOfLine(currentRay.nextObstacle, currentRay.position);

		    	// Normal vector
				var normalVector = helpers.getNormalVector(currentRay.nextObstacle, currentRay.intersectionPoint, currentRay.sideOfObstacle);

		    	currentRay.normalVector = normalVector.vector;
		    	currentRay.normalVectorEndPoint = normalVector.endPoint;

		    	// Reflection vector
		    	var reflectionVector = helpers.getReflectionVector(currentRay.vector, currentRay.normalVector, currentRay.intersectionPoint);
		    	currentRay.reflectionVector = reflectionVector.vector;
		    	currentRay.reflectionVectorEndPoint = reflectionVector.endPoint;
			} else {
		    	currentRay.normalVector = null;
		    	currentRay.normalVectorEndPoint = null;
		    	currentRay.reflectionVector = null;
		    	currentRay.reflectionVectorEndPoint = null;
			}
		}

		// Fire circle rays
		if (circleRays) {
			circleRays = false;

			// for (var i = 0; i < 8; i++) {

			// }

			// var ray = {
			// 	bounces: 0,
			// 	segments: [{
			// 		finished: false,
			// 		bounced: false,
			// 		vector: currentRay.vector,
			// 		length: 0,
			// 		position: START_POSITION,
			// 		endPosition: null,
			// 		intersectionPoint: currentRay.intersectionPoint,
			// 		nextObstacle: currentRay.nextObstacle,
			// 		sideOfObstacle: currentRay.sideOfObstacle,
			// 		normalVector: currentRay.normalVector,
			// 		normalVectorEndPoint: currentRay.normalVectorEndPoint,
			// 		reflectionVector: currentRay.reflectionVector,
			// 		reflectionVectorEndPoint: currentRay.reflectionVectorEndPoint
			// 	}]
			// };

			// rays.push(ray);
		}

		// Fire ray
		if (fireRay) {
			fireRay = false;

			if (!currentRay.intersectionPoint || pointerUpEvent.button !== 0)
				return;

			var ray = {
				bounces: 0,
				segments: [{
					finished: false,
					bounced: false,
					vector: currentRay.vector,
					length: 0,
					position: START_POSITION,
					endPosition: null,
					intersectionPoint: currentRay.intersectionPoint,
					nextObstacle: currentRay.nextObstacle,
					sideOfObstacle: currentRay.sideOfObstacle,
					normalVector: currentRay.normalVector,
					normalVectorEndPoint: currentRay.normalVectorEndPoint,
					reflectionVector: currentRay.reflectionVector,
					reflectionVectorEndPoint: currentRay.reflectionVectorEndPoint
				}]
			};

			rays.push(ray);
		}

	    // Calculate ray positions
		var frameMoveAmount = dt * RAY_SPEED;
	    rays.forEach((ray) => {
	    	var segmentIndex = 0;
	    	var segment;
	    	while (segmentIndex < ray.segments.length) {
	    		segment = ray.segments[segmentIndex];

				var newPosition = segment.vector.multiplyByScalar(frameMoveAmount).addVector(segment.position);

		    	var distanceToIntersection = helpers.distanceBetweenTwoPoints(newPosition, segment.intersectionPoint);
		    	var maxMoveSegmentAmount = Math.min(distanceToIntersection, RAY_LENGTH);

		    	if (maxMoveSegmentAmount < segment.length && !segment.bounced) {
		    		ray.bounces++;

		    		segment.bounced = true;

					var interSectionCheck = segment.reflectionVector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(segment.intersectionPoint);
					var closestIntersection = helpers.getClosestIntersectionLine(segment.intersectionPoint, interSectionCheck, obstacles);

					if (closestIntersection.obstacle) {
						var newSegmentSideofObstacle = helpers.checkSideOfLine(closestIntersection.obstacle, segment.intersectionPoint);

						var newSegment = {
							finished: false,
							bounced: false,
							vector: segment.reflectionVector,
							length: 0,
							position: segment.intersectionPoint,
							endPosition: null,
							intersectionPoint: closestIntersection.point,
							nextObstacle: closestIntersection.obstacle,
							sideOfObstacle: newSegmentSideofObstacle,
			    		};

						// Normal vector
						var normalVector = helpers.getNormalVector(newSegment.nextObstacle, newSegment.intersectionPoint, newSegmentSideofObstacle);
				    	newSegment.normalVector = normalVector.vector;
				    	newSegment.normalVectorEndPoint = normalVector.endPoint;

				    	// Reflection vector
				    	var reflectionVector = helpers.getReflectionVector(newSegment.vector, newSegment.normalVector, newSegment.intersectionPoint);
				    	newSegment.reflectionVector = reflectionVector.vector;
				    	newSegment.reflectionVectorEndPoint = reflectionVector.endPoint;

			    		ray.segments.push(newSegment);
					}
				}

				if (!segment.bounced) {
					segment.length += frameMoveAmount;
					if (segment.length > maxMoveSegmentAmount)
						segment.length = maxMoveSegmentAmount;
				} else {
					segment.length = maxMoveSegmentAmount;
				}

				var currentSideOfObstacle = helpers.checkSideOfLine(segment.nextObstacle, newPosition);
		    	if (segment.sideOfObstacle !== currentSideOfObstacle) {
		    		segment.finished = true;
		    	}

		    	if (segmentIndex === 0 && (segment.length === RAY_LENGTH || segment.bounced))
		    		segment.position = newPosition;
		    	segment.endPosition = segment.vector.multiplyByScalar(segment.length).addVector(segment.position);

		    	segmentIndex++;
	    	};

	    	ray.segments = ray.segments.filter((segment) => !segment.finished);
	    });

	    rays = rays.filter((ray) => ray.bounces < RAY_MAX_BOUNCES && ray.segments.length > 0);
	}


	function render(dt) {
	    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	    helpers.drawGrid(context, canvas);
	    helpers.drawObstacles(context, obstacles);

	    if (editing) {
	    	if (firstTouchPoint) {
		    	helpers.drawCircle(context, firstTouchPoint, 4, "green");
		    	helpers.drawLine(context, firstTouchPoint, pointerEvent, "green", 1);
		    	helpers.drawCircle(context, pointerEvent, 4, "green");
	    	}
	    }

	    if (!editing) {
			// Aiming
		    if (currentRay.position && allowNextRay) {
				helpers.drawLine(context, START_POSITION, currentRay.position, "gray", 1);

		    	// Intersection points
			    if (currentRay.intersectionPoint && DRAW_DEBUG_LINES) {
					helpers.drawLine(context, currentRay.position, currentRay.intersectionPoint, "gray", 1);
			    	helpers.drawCircle(context, currentRay.intersectionPoint, 4, "#91C8FF");
					helpers.drawLine(context, currentRay.intersectionPoint, currentRay.normalVectorEndPoint, "orange", 1);
					helpers.drawLine(context, currentRay.intersectionPoint, currentRay.reflectionVectorEndPoint, "green", 1);
			    }
		    }


		    // Rays
		    rays.forEach((ray) => {
	    		ray.segments.forEach((segment) => {
			    	helpers.drawRay(context, segment, "green");

			    	if (DRAW_DEBUG_LINES) {
						helpers.drawLine(context, segment.intersectionPoint, segment.normalVectorEndPoint, "orange", 1);
			    		helpers.drawCircle(context, segment.intersectionPoint, 4, "#91C8FF");
			    	}
	    		});
		    });

		    helpers.drawCircle(context, START_POSITION, 4, "#FF4444");
	    }
	}

})();

