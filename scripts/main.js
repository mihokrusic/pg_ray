(function() {

	const MOUSE_POINTER_ID = 255;

	const LINE_LENGTH = 50;
	const RAY_SPEED = 500; // px per second

	const NORMAL_LINE_LENGTH = 50;
	const REFLECTION_LINE_LENGTH = 100;

	const INTERSECTION_CHECK_LINE_LENGTH = 10000;

	const START_POSITION = new Vector(500, 700);

	var obstacles = [
		// outer
		{ from: { x: 50, y: 50 }, to: { x: 1000, y: 50 }, selected: false },
		{ from: { x: 1000, y: 50 }, to: { x: 1000, y: 700 }, selected: false },
		{ from: { x: 1000, y: 700 }, to: { x: 50, y: 700 }, selected: false },
		{ from: { x: 50, y: 700 }, to: { x: 50, y: 50 }, selected: false },
		// inner
		{ from: { x: 400, y: 200 }, to: { x: 400, y: 400 }, selected: false },
		{ from: { x: 100, y: 400 }, to: { x: 400, y: 500 }, selected: false },
	];

	var canvas, context;

	var app = new PLAYGROUND.Application({

		create: function() {
			canvas = this.layer.canvas;
			context = this.layer.context;

			this.running = true;

			this.pointerEvent = null;
			this.pointerUpEvent = null;

			this.currentRay = {
				vector: {},
				position: {}
			};


			this.rays = [];
			this.fireRay = false;

			this.lastFpsCounter = 0;
			this.fpsCounter = 0;
			this.dtCounter = 0;
		},

		step: function(dt) {

			if (this.dtCounter < 1) {
				this.dtCounter += dt;
				this.fpsCounter++;
			} else {
				this.lastFpsCounter = this.fpsCounter;
				this.dtCounter = this.dtCounter - 1;
				this.fpsCounter = 0;
			}

			if (!this.running)
				return;

			// Get current ray & intersection
			if (this.pointerEvent) {
				var angle = Math.atan2(this.pointerEvent.y - START_POSITION.y, this.pointerEvent.x - START_POSITION.x);
				this.currentRay.vector = new Vector(Math.cos(angle), Math.sin(angle));
		    	//console.log(angle, this.currentRay.vector);

				this.currentRay.position = this.currentRay.vector.multiplyByScalar(LINE_LENGTH).addVector(START_POSITION);

				var interSectionCheck = this.currentRay.vector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(START_POSITION);
				var closestIntersection = helpers.getClosestIntersectionLine(START_POSITION, obstacles, interSectionCheck);
				this.currentRay.intersectionPoint = closestIntersection.point;
				this.currentRay.nextObstacle = closestIntersection.obstacle;

				if (this.currentRay.nextObstacle) {
					this.currentRay.sideOfObstacle = helpers.checkSideOfLine(this.currentRay.nextObstacle, this.currentRay.position);

			    	// Normal vector
			    	var normalVectorSlope = helpers.slopeForTwoPoints(this.currentRay.nextObstacle.from, this.currentRay.nextObstacle.to);
				    var normalVector = (normalVectorSlope === undefined)
				    	? new Vector(1, 0)
					   	: new Vector(normalVectorSlope, -1);

			    	var normalVectorEnd = normalVector.multiplyByScalar(NORMAL_LINE_LENGTH).addVector(this.currentRay.intersectionPoint);
			    	var normalSideOfObstacle = helpers.checkSideOfLine(this.currentRay.nextObstacle, normalVectorEnd);
			    	if (this.currentRay.sideOfObstacle !== normalSideOfObstacle) {
				    	normalVector = normalVector.multiplyByScalar(-1);
				    	normalVectorEnd = normalVector.multiplyByScalar(NORMAL_LINE_LENGTH).addVector(this.currentRay.intersectionPoint);
			    	}
			    	this.currentRay.normalVector = normalVector;
			    	this.currentRay.normalVectorEnd = normalVectorEnd;

			    	// Reflection vector
			    	var dot = helpers.dotProduct(this.currentRay.vector, normalVector);
			    	//console.log(this.currentRay.vector, normalVector);

			    	var reflectionVector = normalVector.multiplyByScalar(dot * 2).substract(this.currentRay.vector);
			    	var reflectionVectorEnd = reflectionVector.multiplyByScalar(REFLECTION_LINE_LENGTH).substract(this.currentRay.intersectionPoint);
			    	this.currentRay.reflectionVector = reflectionVector;
			    	this.currentRay.reflectionVectorEnd = reflectionVectorEnd;
				} else {
			    	this.currentRay.normalVector = null;
			    	this.currentRay.normalVectorEnd = null;
			    	this.currentRay.reflectionVector = null;
			    	this.currentRay.reflectionVectorEnd = null;
				}
			}


			// Fire ray
			if (this.fireRay) {
				this.fireRay = false;

				if (!this.currentRay.intersectionPoint || this.pointerUpEvent.button !== "left")
					return;

				var ray = {
					enabled: true,
					vector: this.currentRay.vector,
					position: START_POSITION,
					endPosition: new Vector(0, 0),
					intersectionPoint: this.currentRay.intersectionPoint,
					nextObstacle: this.currentRay.nextObstacle,
					sideOfObstacle: this.currentRay.sideOfObstacle,
					normalVector: normalVector,
					normalVectorEnd: normalVectorEnd
				};

				this.rays.push(ray);
			}


		    // Calculate ray positions
		    this.rays.forEach((ray) => {
		    	if (!ray.enabled)
		    		return;

				var newPosition = ray.vector.multiplyByScalar(dt * RAY_SPEED).addVector(ray.position);

		    	var maxDistance = helpers.distanceBetweenTwoPoints(newPosition, ray.intersectionPoint);
		    	var distance = Math.min(maxDistance, LINE_LENGTH);
				var sideOfObstacle = helpers.checkSideOfLine(ray.nextObstacle, newPosition);

		    	if (ray.sideOfObstacle !== sideOfObstacle) {
		    		ray.enabled = false;
		    		return;
		    	}

		    	ray.position = newPosition;
		    	ray.endPosition = ray.vector.multiplyByScalar(distance).addVector(ray.position);
		    });
		},

		render: function() {
			// Drawing
		    this.layer.clear("#FFFFFF");
		    helpers.drawObstacles(context, obstacles);

		    // Text
		    helpers.drawText(context, 50, 30, this.lastFpsCounter, '18px Verdana', 'gray');

		    // Aiming
		    if (this.currentRay.position) {
				helpers.drawLine(context, START_POSITION, this.currentRay.position, "gray");
				helpers.drawCircle(context, this.currentRay.position, 4, "#FF4444");
		    }

		    if (this.currentRay.intersectionPoint) {
				helpers.drawLine(context, this.currentRay.position, this.currentRay.intersectionPoint, "gray");
		    	helpers.drawCircle(context, this.currentRay.intersectionPoint, 4, "#91C8FF");
				helpers.drawLine(context, this.currentRay.intersectionPoint, this.currentRay.normalVectorEnd, "orange");
				helpers.drawLine(context, this.currentRay.intersectionPoint, this.currentRay.reflectionVectorEnd, "maroon");
		    }

		    // Rays
		    this.rays.forEach((ray) => {
		    	if (ray.enabled) {
			    	helpers.drawRay(context, ray, "green");
					helpers.drawLine(context, ray.intersectionPoint, ray.normalVectorEnd, "orange");
		    	}
		    });

		    helpers.drawCircle(context, START_POSITION, 4, "#70FFAE");
		},

		keyup: function(event) {
			switch (event.key) {
				case "space":
					this.running = !this.running;
					break;
			}
		},

		pointermove: function(event) {
			this.pointerEvent = event;
		},

		pointerup: function(event) {
			this.pointerUpEvent = event;
			this.fireRay = true;
	    },
	});
})();

