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
                        position: this.pointerDownEvent,
                        endPosition: null,
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
            while (segmentIndex < ray.segments.length) {
                segment = ray.segments[segmentIndex];

                var newPosition = segment.vector.multiplyByScalar(frameMoveAmount).addVector(segment.position);

                var distanceToIntersection = helpers.distanceBetweenTwoPoints(newPosition, segment.intersectionPoint);
                var maxMoveSegmentAmount = Math.min(distanceToIntersection, RAY_LENGTH);

                if (maxMoveSegmentAmount < segment.length && !segment.bounced) {
                    ray.bounces++;

                    segment.bounced = true;

                    if (ray.bounces < RAY_MAX_BOUNCES) {
                        var interSectionCheck = segment.reflectionVector.multiplyByScalar(INTERSECTION_CHECK_LINE_LENGTH).addVector(segment.intersectionPoint);
                        var closestIntersection = helpers.getClosestIntersectionLine(segment.intersectionPoint, interSectionCheck, this.obstacles);

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
            }

            ray.segments = ray.segments.filter((segment) => !segment.finished);
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
