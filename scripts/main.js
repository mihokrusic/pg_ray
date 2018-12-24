(function() {

	const MOUSE_POINTER_ID = 255;

	const LINE_LENGTH = 50;
	const RAY_SPEED = 150; // px per second

	const INTERSECTION_CHECK_LINE_LENGTH = 10000;

	const START_POSITION = { x: 50, y: 200 };

	var obstacles = [
		// outer
		{ fromX: 50, fromY: 50, toX: 550, toY: 50, selected: false },
		{ fromX: 550, fromY: 50, toX: 550, toY: 550, selected: false },
		{ fromX: 550, fromY: 550, toX: 50, toY: 550, selected: false },
		{ fromX: 50, fromY: 550, toX: 50, toY: 50, selected: false },
		// inner
		{ fromX: 400, fromY: 200, toX: 400, toY: 400, selected: false },
	];

	var canvas, context;

	var app = new PLAYGROUND.Application({

		create: function() {
			canvas = this.layer.canvas;
			context = this.layer.context;

			this.pointerEvent = null;

			this.currentRay = {};

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

			// Get current ray & intersection
			if (this.pointerEvent) {
				this.currentRay.angle = Math.atan2(this.pointerEvent.y - START_POSITION.y, this.pointerEvent.x - START_POSITION.x);
				this.currentRay.x = (Math.round(START_POSITION.x + (LINE_LENGTH * Math.cos(this.currentRay.angle))));
				this.currentRay.y = (Math.round(START_POSITION.y + (LINE_LENGTH * Math.sin(this.currentRay.angle))));

				var interSectionCheck = {
					x: Math.round(START_POSITION.x + (INTERSECTION_CHECK_LINE_LENGTH * Math.cos(this.currentRay.angle))),
					y: Math.round(START_POSITION.y + (INTERSECTION_CHECK_LINE_LENGTH * Math.sin(this.currentRay.angle)))
				};

				var closestIntersection = helpers.markClosestIntersectLines(START_POSITION, obstacles, interSectionCheck);
				this.currentRay.intersectionPoint = closestIntersection.point;
				this.currentRay.intersectionObstacle = closestIntersection.obstacle;
			}

			if (this.fireRay) {
				this.fireRay = false;

				var ray = {
					enabled: true,
					angle: this.currentRay.angle,
					position: START_POSITION,
					endPosition: { x: 0, y: 0 },
					nextIntersectionPoint: this.currentRay.intersectionPoint,
					nextIntersectionObstacle: this.currentRay.intersectionObstacle,
				};
				ray.initialDistanceToObstacle = helpers.distanceBetweenTwoPoints(START_POSITION, ray.nextIntersectionPoint);

				this.rays.push(ray);
			}

		    // Calculate ray positions
		    this.rays.forEach((ray) => {
		    	if (!ray.enabled)
		    		return;

		    	ray.position = {
		    		x: ray.position.x + (RAY_SPEED * dt * Math.cos(ray.angle)),
		    		y: ray.position.y + (RAY_SPEED * dt * Math.sin(ray.angle))
		    	};

		    	var maxDistance = helpers.distanceBetweenTwoPoints(ray.position, ray.nextIntersectionPoint);
		    	var distance = Math.min(maxDistance, LINE_LENGTH);

		    	if (distance < 0) {
		    		ray.enabled = false;
		    	}

		    	ray.endPosition = {
		    		x: ray.position.x + (distance * Math.cos(ray.angle)),
		    		y: ray.position.y + (distance * Math.sin(ray.angle))
		    	};
		    });
		},

		render: function() {

			// Drawing
		    this.layer.clear("#FFFFFF");
		    helpers.drawObstacles(context, obstacles);

		    // Text
		    helpers.drawText(context, 50, 30, this.lastFpsCounter, '18px Verdana', 'gray');

		    // Aiming
		    if (this.pointerEvent) {
				helpers.drawLine(context, START_POSITION.x, START_POSITION.y, this.currentRay.x, this.currentRay.y, "gray");
				helpers.drawCircle(context, this.currentRay.x, this.currentRay.y, 4, "#FF4444");
		    }

		    if (this.currentRay.intersectionPoint) {
				helpers.drawLine(context, this.currentRay.x, this.currentRay.y, this.currentRay.intersectionPoint.x, this.currentRay.intersectionPoint.y, "gray");
		    	helpers.drawCircle(context, this.currentRay.intersectionPoint.x, this.currentRay.intersectionPoint.y, 4, "#91C8FF");
		    }

		    // Rays
		    this.rays.forEach((ray) => {
		    	helpers.drawRay(context, ray, "green");
		    });

		    helpers.drawCircle(context, START_POSITION.x, START_POSITION.y, 4, "#70FFAE");
		},

		pointermove: function(event) {
			this.pointerEvent = event;
		},

		pointerup: function(event) {
			this.fireRay = true;
	    },
	});
})();

