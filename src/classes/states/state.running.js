import { State } from './../state';
import { Vector } from './../vector';
import Constants from './../../constants';
import Helpers from './../../helpers';

export class RunningState extends State {

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
            // case 49: // 1
            //     this.pointerUpEvent = { x: 434, y: -139};
            //     this.pointerDownEvent = { x: 64, y: -80};
            //     this.pointerMoveEvent = this.pointerUpEvent;
            //     break;
        }
    }

    /*
    MOVE
    */
    getRayLength(ray) {
        return _.sumBy(ray.segments, function(segment) { return segment.finished ? 0 : Helpers.distanceBetweenTwoPoints(segment.startPosition, segment.endPosition); });
    }

    onUpdate(dt) {
        // Fire ray
        if (this.pointerUpEvent) {
            this.fireRay(dt);
        }

        this.calculateRayPositions(dt);
    }

    fireRay(dt) {
        // Calculate next ray properties
        var angle = Math.atan2(this.pointerUpEvent.y - this.pointerDownEvent.y, this.pointerUpEvent.x - this.pointerDownEvent.x);
        this.currentRay.vector = new Vector(Math.cos(angle), Math.sin(angle)).normalize(); // TODO: double creation, blah
        this.currentRay.position = this.currentRay.vector.multiplyByScalar(Constants.ray.length).addVector(this.pointerDownEvent);

        var interSectionCheck = this.currentRay.vector.multiplyByScalar(Constants.ray.intersectionCheckLineLength).addVector(this.pointerDownEvent);
        var closestIntersection = Helpers.getClosestIntersectionLine(this.pointerDownEvent, interSectionCheck, this.obstacles);

        if (!closestIntersection.obstacle) {
            console.error("Can't find next intersection!");
        }

        this.currentRay.intersectionPoint = closestIntersection.point;
        this.currentRay.nextObstacle = closestIntersection.obstacle;

        if (this.currentRay.nextObstacle) {
            this.currentRay.sideOfObstacle = Helpers.checkSideOfLine(this.currentRay.nextObstacle, this.currentRay.position);

            // Normal vector
            var normalVector = Helpers.getNormalVector(this.currentRay.nextObstacle, this.currentRay.intersectionPoint, this.currentRay.sideOfObstacle);

            this.currentRay.normalVector = normalVector.vector;
            this.currentRay.normalVectorEndPoint = normalVector.endPoint;

            // Reflection vector
            var reflectionVector = Helpers.getReflectionVector(this.currentRay.vector, this.currentRay.normalVector, this.currentRay.intersectionPoint);
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

    calculateRayPositions(dt) {
        var frameMoveAmount = dt * Constants.ray.speed;
        var newSegments = [];
        this.rays.forEach((ray) => {

            let currentRayLength = this.getRayLength(ray);

            ray.segments.forEach((segment, index, array) => {
                let currentSegmentLength = Helpers.distanceBetweenTwoPoints(segment.startPosition, segment.endPosition);
                let distanceToIntersection = Helpers.distanceBetweenTwoPoints(segment.endPosition, segment.intersectionPoint);

                let maxSegmentMoveAmount = Math.min(frameMoveAmount, distanceToIntersection);
                let remainderMove = frameMoveAmount - maxSegmentMoveAmount;

                let moveStartPosition = 0;
                if (index === 0) {
                    moveStartPosition = Math.max(0, (currentRayLength + frameMoveAmount) - Constants.ray.length);
                    if (moveStartPosition > currentSegmentLength) {
                        segment.finished = true;
                    }
                }

                let justBounced = false;
                if (!segment.bounced && (distanceToIntersection - maxSegmentMoveAmount < 0.001)) {
                    justBounced = true;

                    while (remainderMove > 0) {
                        var newSegment = {
                            finished: false,
                            bounced: false,
                            vector: segment.reflectionVector,
                            startPosition: segment.intersectionPoint,
                        };
                        var interSectionCheck = newSegment.vector.multiplyByScalar(Constants.ray.intersectionCheckLineLength).addVector(newSegment.startPosition);
                        var closestIntersection = Helpers.getClosestIntersectionLine(newSegment.startPosition, interSectionCheck, this.obstacles);

                        if (!closestIntersection.obstacle) {
                            console.error("Can't find next intersection!");
                        }

                        newSegment.intersectionPoint = closestIntersection.point;
                        newSegment.nextObstacle = closestIntersection.obstacle;
                        newSegment.sideOfObstacle = Helpers.checkSideOfLine(closestIntersection.obstacle, newSegment.startPosition);

                        var newSegmentDistanceToIntersection = Helpers.distanceBetweenTwoPoints(newSegment.startPosition, newSegment.intersectionPoint);
                        var newSegmentMoveAmount = Math.min(remainderMove, newSegmentDistanceToIntersection);

                        newSegment.endPosition = newSegment.vector.multiplyByScalar(newSegmentMoveAmount).addVector(newSegment.startPosition);

                        // Normal vector
                        var normalVector = Helpers.getNormalVector(newSegment.nextObstacle, newSegment.intersectionPoint, newSegment.sideOfObstacle);
                        newSegment.normalVector = normalVector.vector;
                        newSegment.normalVectorEndPoint = normalVector.endPoint;

                        // Reflection vector
                        var reflectionVector = Helpers.getReflectionVector(newSegment.vector, newSegment.normalVector, newSegment.intersectionPoint);
                        newSegment.reflectionVector = reflectionVector.vector;
                        newSegment.reflectionVectorEndPoint = reflectionVector.endPoint;

                        newSegments.push(newSegment);
                        remainderMove -= newSegmentMoveAmount;
                    }
                }

                if (!segment.finished && moveStartPosition > 0) {
                    segment.startPosition = segment.vector.multiplyByScalar(moveStartPosition).addVector(segment.startPosition);
                }

                if (!segment.bounced) {
                    segment.endPosition = segment.vector.multiplyByScalar(maxSegmentMoveAmount).addVector(segment.endPosition);
                }

                if (!segment.bounced) {
                    segment.bounced = justBounced;
                }
            });

            ray.segments.push(...newSegments);
            ray.segments = ray.segments.filter((segment) => !segment.finished);
        });

        this.rays = this.rays.filter((ray) => ray.segments.length > 0);
    }

    onRender(dt) {
        Helpers.drawObstacles(this.context, this.obstacles);

        // Rays
        this.rays.forEach((ray) => {
            ray.segments.forEach((segment) => {
                Helpers.drawRay(this.context, segment, "green");

                if (Constants.debugLines) {
                    Helpers.drawLine(this.context, segment.intersectionPoint, segment.normalVectorEndPoint, "orange", 1);
                    Helpers.drawLine(this.context, segment.intersectionPoint, segment.reflectionVectorEndPoint, "blue", 1);
                    Helpers.drawCircle(this.context, segment.intersectionPoint, 4, "#91C8FF");
                }
            });
        });

        if (this.pointerMoveEvent && this.pointerDownEvent && !this.pointerUpEvent) {
            Helpers.drawLine(this.context, this.pointerDownEvent, this.pointerMoveEvent, "#44E500", 1);
        }
    }

}