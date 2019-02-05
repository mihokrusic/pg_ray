import { State } from './../state';
import { Vector } from './../vector';
import { Ray, ISegment } from './../ray';
import Constants from './../../constants';
import drawingHelper from '../../helpers/drawing.helper';
import geometryHelper from '../../helpers/geometry.helper';
import obstacles from './../../obstacles';

export class RunningState extends State {

    private running: boolean;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.running = true;
    }

    activate() {
        this.rays = [];
    }

    onKeyUp(event: KeyboardEvent) {
        super.onKeyUp(event);
        switch (event.keyCode)
        {
            case 32: // SPACE
                this.running = !this.running;
                break;
        }
    }

    onUpdate(dt: number) {
        // Fire ray
        if (this.pointerUpEvent) {
            this.fireRay(dt);
        }

        this.calculateRayPositions(dt);
    }

    fireRay(dt: number) {
        // Calculate next ray properties
        var angle = Math.atan2(this.pointerUpEvent.y - this.pointerDownEvent.y, this.pointerUpEvent.x - this.pointerDownEvent.x);
        var newRayVector = new Vector(Math.cos(angle), Math.sin(angle)).normalize(); // TODO: double creation, blah

        var interSectionCheck = newRayVector.multiplyByScalar(Constants.ray.intersectionCheckLineLength).add(this.pointerDownEvent);
        var closestIntersection = geometryHelper.getClosestIntersectionLine(this.pointerDownEvent, interSectionCheck, obstacles);

        if (!closestIntersection.obstacle) {
            console.error("Can't find next intersection!");
        }

        var newRaySegment: ISegment = {
            finished: false,
            bounced: false,
            vector: newRayVector,
            startPosition: this.pointerDownEvent,
            endPosition: this.pointerDownEvent,
            intersectionPoint: closestIntersection.point,
            nextObstacle: closestIntersection.obstacle,
        };

        newRaySegment.sideOfObstacle = geometryHelper.checkSideOfLine(newRaySegment.nextObstacle, newRaySegment.startPosition);

        // Normal vector
        var normalVector = geometryHelper.getNormalVector(newRaySegment.nextObstacle, newRaySegment.intersectionPoint, newRaySegment.sideOfObstacle);
        newRaySegment.normalVector = normalVector.vector;
        newRaySegment.normalVectorEndPoint = normalVector.endPoint;

        // Reflection vector
        var reflectionVector = geometryHelper.getReflectionVector(newRaySegment.vector, newRaySegment.normalVector, newRaySegment.intersectionPoint);
        newRaySegment.reflectionVector = reflectionVector.vector;
        newRaySegment.reflectionVectorEndPoint = reflectionVector.endPoint;

        var newRay = new Ray();
        newRay.addSegment(newRaySegment);

        this.rays.push(newRay);

        this.pointerUpEvent = null;
        this.pointerDownEvent = null;
    }

    calculateRayPositions(dt: number) {
        this.rays.forEach((ray: Ray) => {
            ray.move(dt);
        });

        this.rays = this.rays.filter((ray) => ray.segments.length > 0);
    }

    onRender(dt: number) {
        drawingHelper.drawObstacles(this.context, obstacles);

        // Rays
        this.rays.forEach((ray) => {
            ray.segments.forEach((segment) => {
                drawingHelper.drawRaySegment(this.context, segment, "green");

                if (Constants.debugLines) {
                    drawingHelper.drawLine(this.context, segment.intersectionPoint, segment.normalVectorEndPoint, "orange", 1);
                    drawingHelper.drawLine(this.context, segment.intersectionPoint, segment.reflectionVectorEndPoint, "blue", 1);
                    drawingHelper.drawCircle(this.context, segment.intersectionPoint, 4, "#91C8FF");
                }
            });
        });

        if (this.pointerMoveEvent && this.pointerDownEvent && !this.pointerUpEvent) {
            drawingHelper.drawLine(this.context, this.pointerDownEvent, this.pointerMoveEvent, "#44E500", 1);
        }
    }
}
