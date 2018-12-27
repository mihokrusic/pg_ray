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
		{ from: { x: 100, y: 50 }, to: { x: 400, y: -150 }, selected: false },
	];

	// Move to class
	var canvas, context;
	var animationHandle;
	var lastTimestamp;

	var running = false;
	var mouseLocked = false;
	var pointerEvent = null;
	var pointerUpEvent = null;

	var currentRay = {
		vector: {},
		position: {}
	};

	var rays = [];
	var fireRay = false;

	// Create & start
	onCreate();

	function onCreate() {
		// Create canvas
		canvas = document.getElementById('gameCanvas');
		context = canvas.getContext('2d');
		context.transform(1, 0, 0, -1, canvas.width / 2, canvas.height / 2);

		canvas.addEventListener("mousemove", (event) => onMouseMove(event));
		canvas.addEventListener("mouseup", (event) => onMouseUp(event));
		canvas.addEventListener("keyup", (event) => onKeyUp(event));

		running = true;
		animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));
	}

	function onMouseMove(event) {
		if (mouseLocked)
			return;

		pointerEvent = {
			x: event.clientX - canvas.width / 2,
			y: (event.clientY * -1) + canvas.height / 2
		};
	}

	function onMouseUp(event) {
		pointerUpEvent = event;
		fireRay = true;
	};

	function onKeyUp(event) {
		switch (event.keyCode) {
			case 32: // SPACE
				running = !running;
				break;
			case 76: // L
				mouseLocked = !mouseLocked;
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

		calculateStep(dt);
	  	render(dt);

	  	lastTimestamp = timestamp;
		animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));
	}

	function calculateStep(dt) {
		console.log(dt);
		if (!running)
			return;

		// Get current ray & intersection
		if (pointerEvent) {
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
	    	ray.segments.forEach((segment) => {
				var newPosition = segment.vector.multiplyByScalar(frameMoveAmount).addVector(segment.position);

		    	var distanceToIntersection = helpers.distanceBetweenTwoPoints(newPosition, segment.intersectionPoint);
		    	var maxMoveSegmentAmount = Math.min(distanceToIntersection, RAY_LENGTH);

		    	if (maxMoveSegmentAmount < RAY_LENGTH && !segment.bounced) {
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

				    	// TODO: potential problem here, handle immediatte intersection after we've created new segment
				    	newSegment.endPosition = newSegment.vector.multiplyByScalar(newSegment.length).addVector(newSegment.position);

			    		ray.segments.push(newSegment);
					}
				}

				if (!segment.bounced) {
					segment.length += frameMoveAmount;
					if (segment.length > RAY_LENGTH)
						segment.length = RAY_LENGTH;
				} else {
					segment.length = maxMoveSegmentAmount;
				}

				var currentSideOfObstacle = helpers.checkSideOfLine(segment.nextObstacle, newPosition);
		    	if (segment.sideOfObstacle !== currentSideOfObstacle) {
		    		segment.finished = true;
		    	}

		    	if ((!segment.bounced && segment.length === RAY_LENGTH) || (segment.bounced))
		    		segment.position = newPosition;
		    	segment.endPosition = segment.vector.multiplyByScalar(segment.length).addVector(segment.position);
	    	});

	    	ray.segments = ray.segments.filter((segment) => !segment.finished);
	    });

	    rays = rays.filter((ray) => ray.bounces < RAY_MAX_BOUNCES && ray.segments.length > 0);
	}

	function render(dt) {
	    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	    helpers.drawGrid(context, canvas);
	    helpers.drawObstacles(context, obstacles);

		// Aiming
	    if (currentRay.position) {
			helpers.drawLine(context, START_POSITION, currentRay.position, "gray", 1);
			helpers.drawCircle(context, currentRay.position, 4, "#70FFAE");

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

})();

