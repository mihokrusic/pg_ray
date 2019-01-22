class RunningState extends State {

    constructor(canvas) {
        super(canvas);
        this.running = true;
    }

    activate() {
        this.rays = [];
    }

    onKeyUp(event) {
        super.onKeyUp(event);
        switch (event.keyCode)
        {
            case 32: // SPACE
                this.running = !this.running;
                break;
            // TESTS
            case 49: // 1
                this.pointerUpEvent = { x: 348, y: -142};
                this.pointerDownEvent = { x: 200, y: -52};
                this.pointerMoveEvent = this.pointerUpEvent;
                break;
            case 50: // 2
                this.pointerUpEvent = { x: 372, y: -135};
                this.pointerDownEvent = { x: 207, y: -91};
                this.pointerMoveEvent = this.pointerUpEvent;
                break;
        }
    }

    onUpdate(dt) {
        // Fire ray
        if (this.pointerUpEvent) {
            // Calculate next ray properties
            var angle = Math.atan2(this.pointerUpEvent.y - this.pointerDownEvent.y, this.pointerUpEvent.x - this.pointerDownEvent.x);
            this.currentRay.vector = new Vector(Math.cos(angle), Math.sin(angle)).normalize(); // TODO: double creation, blah
            this.currentRay.position = this.currentRay.vector.multiplyByScalar(RAY_LENGTH).addVector(this.pointerDownEvent);

            var interSectionCheck = this.currentRay.vector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(this.pointerDownEvent);
            var closestIntersection = helpers.getClosestIntersectionLine(this.pointerDownEvent, interSectionCheck, this.obstacles);
            this.currentRay.intersectionPoint = closestIntersection.point;
            this.currentRay.nextObstacle = closestIntersection.obstacle;

            if (this.currentRay.nextObstacle) {
                this.currentRay.sideOfObstacle = helpers.checkSideOfLine(this.currentRay.nextObstacle, this.currentRay.position);

                // Normal vector
                var normalVector = helpers.getNormalVector(this.currentRay.nextObstacle, this.currentRay.intersectionPoint, this.currentRay.sideOfObstacle);

                this.currentRay.normalVector = normalVector.vector;
                this.currentRay.normalVectorEndPoint = normalVector.endPoint;

                // Reflection vector
                var reflectionVector = helpers.getReflectionVector(this.currentRay.vector, this.currentRay.normalVector, this.currentRay.intersectionPoint);
                this.currentRay.reflectionVector = reflectionVector.vector;
                this.currentRay.reflectionVectorEndPoint = reflectionVector.endPoint;
            } else {
                this.currentRay.normalVector = null;
                this.currentRay.normalVectorEndPoint = null;
                this.currentRay.reflectionVector = null;
                this.currentRay.reflectionVectorEndPoint = null;
            }

            if (this.currentRay.intersectionPoint) {
                var newRay = {
                    bounces: 0,
                    segments: [{
                        finished: false,
                        bounced: false,
                        vector: this.currentRay.vector,
                        length: 0,
                        startPosition: this.pointerDownEvent,
                        endPosition: this.pointerDownEvent,
                        intersectionPoint: this.currentRay.intersectionPoint,
                        nextObstacle: this.currentRay.nextObstacle,
                        sideOfObstacle: this.currentRay.sideOfObstacle,
                        normalVector: this.currentRay.normalVector,
                        normalVectorEndPoint: this.currentRay.normalVectorEndPoint,
                        reflectionVector: this.currentRay.reflectionVector,
                        reflectionVectorEndPoint: this.currentRay.reflectionVectorEndPoint
                    }]
                };

                this.rays.push(newRay);
            }

            this.pointerUpEvent = null;
            this.pointerDownEvent = null;
        }

        // Calculate ray positions
        var frameMoveAmount = dt * RAY_SPEED;
        this.rays.forEach((ray) => {
            var segmentIndex = 0;
            var segment;
            var bounceOverflow;
            while (segmentIndex < ray.segments.length) {
                segment = ray.segments[segmentIndex];
                bounceOverflow = 0;

                var distanceToIntersection = helpers.distanceBetweenTwoPoints(segment.endPosition, segment.intersectionPoint);
                var maxMoveSegmentAmount = Math.min(distanceToIntersection, frameMoveAmount);
                bounceOverflow = frameMoveAmount > distanceToIntersection ? frameMoveAmount - distanceToIntersection : 0;

                if (!segment.bounced && bounceOverflow > 0) {
                    ray.bounces++;
                    segment.bounced = true;

                    if (ray.bounces < RAY_MAX_BOUNCES) {
                        var newSegment = {
                            finished: false,
                            bounced: false,
                            vector: segment.reflectionVector,
                            length: 0,
                            startPosition: segment.intersectionPoint,
                            endPosition: segment.intersectionPoint
                        };

                        var interSectionCheck = newSegment.vector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(newSegment.startPosition);
                        var closestIntersection = helpers.getClosestIntersectionLine(newSegment.startPosition, interSectionCheck, this.obstacles);

                        if (!closestIntersection.obstacle) {
                            console.error("Can't find next intersection!");
                        }

                        newSegment.intersectionPoint = closestIntersection.point;
                        newSegment.nextObstacle = closestIntersection.obstacle;
                        newSegment.sideOfObstacle = helpers.checkSideOfLine(closestIntersection.obstacle, newSegment.startPosition);

                        // Normal vector
                        var normalVector = helpers.getNormalVector(newSegment.nextObstacle, newSegment.intersectionPoint, newSegment.sideOfObstacle);
                        newSegment.normalVector = normalVector.vector;
                        newSegment.normalVectorEndPoint = normalVector.endPoint;

                        // Reflection vector
                        var reflectionVector = helpers.getReflectionVector(newSegment.vector, newSegment.normalVector, newSegment.intersectionPoint);
                        newSegment.reflectionVector = reflectionVector.vector;
                        newSegment.reflectionVectorEndPoint = reflectionVector.endPoint;

                        ray.segments.push(newSegment);
                    }
                }

                if (segment.bounced) {
                    if (segmentIndex === 0 || ray.segments[segmentIndex-1].finished) {
                        segment.length -= frameMoveAmount;
                    }
                } else {
                    segment.length += (bounceOverflow + frameMoveAmount);
                    if (segment.length > RAY_LENGTH)
                        segment.length = RAY_LENGTH;
                }

                //
                if (segmentIndex === 0 && (segment.length === RAY_LENGTH || segment.bounced)) {
                    segment.startPosition = segment.vector.multiplyByScalar(frameMoveAmount).addVector(segment.startPosition);
                }
                if (!segment.bounced) {
                    segment.endPosition = segment.vector.multiplyByScalar(segment.length).addVector(segment.startPosition);
                }

                var currentSideOfObstacle = helpers.checkSideOfLine(segment.nextObstacle, segment.startPosition);
                if (segment.sideOfObstacle !== currentSideOfObstacle) {
                    segment.finished = true;
                }

                segmentIndex++;
            }

            ray.segments = ray.segments.filter((segment) => !segment.finished);
            // console.log(ray.segments[0] && ray.segments[0].length);

            console.log(_.sumBy(ray.segments, function(segment) {
                return helpers.distanceBetweenTwoPoints(segment.startPosition, segment.endPosition);
            }));
        });

        this.rays = this.rays.filter((ray) => ray.segments.length > 0);
    }

    onRender(dt) {
        helpers.drawObstacles(this.context, this.obstacles);

        // Rays
        this.rays.forEach((ray) => {
            ray.segments.forEach((segment) => {
                helpers.drawRay(this.context, segment, "green");

                if (DRAW_DEBUG_LINES) {
                    helpers.drawLine(this.context, segment.intersectionPoint, segment.normalVectorEndPoint, "orange", 1);
                    helpers.drawCircle(this.context, segment.intersectionPoint, 4, "#91C8FF");
                }
            });
        });

        if (this.pointerMoveEvent && this.pointerDownEvent && !this.pointerUpEvent) {
            helpers.drawLine(this.context, this.pointerDownEvent, this.pointerMoveEvent, "#44E500", 1);
        }
    }

}
