import { IVector, IPoint } from './vector';
import geometryHelper from '../helpers/geometry.helper';
import Constants from '../constants';
import obstacles from './../obstacles';

export interface ISegment {
    finished: boolean;
    bounced: boolean;
    vector: IVector;
    startPosition: IPoint;
    endPosition: IPoint,

    intersectionPoint?: IPoint,
    nextObstacle?: any;
    sideOfObstacle?: any;

    normalVector?: IVector;
    normalVectorEndPoint?: IPoint;

    reflectionVector?: IVector;
    reflectionVectorEndPoint?: IPoint;
}

export interface IRay {
    readonly segments: ISegment[];
    readonly length: number;

    addSegment(segment: ISegment): void;
    addSegments(segments: ISegment[]): void;
    removeFinishedSegments(): void;
}


export class Ray implements IRay {

    private _bounces: number;
    private _segments: ISegment[];
    private seed: number;

	constructor() {
        this._bounces = 0;
        this._segments = [];
    }

    get segments(): ISegment[] {
        return this._segments;
    }

    get length(): number {
        let length = 0;
        for (var i = 0; i < this._segments.length; i++) {
            length += (this._segments[i].finished ? 0 : geometryHelper.distanceBetweenTwoPoints(this._segments[i].startPosition, this._segments[i].endPosition));
        }
        return length;
    }

    move(dt: number) {
        var frameMoveAmount = dt * Constants.ray.speed;

        let currentRayLength = this.length;
        let newSegments: ISegment[] = [];

        this.segments.forEach((segment: ISegment, index: number) => {
            let currentSegmentLength = geometryHelper.distanceBetweenTwoPoints(segment.startPosition, segment.endPosition);
            let distanceToIntersection = geometryHelper.distanceBetweenTwoPoints(segment.endPosition, segment.intersectionPoint);

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

                    var newSegment: ISegment = {
                        finished: false,
                        bounced: false,
                        vector: segment.reflectionVector,
                        startPosition: segment.intersectionPoint,
                        endPosition: segment.intersectionPoint,
                    }

                    var interSectionCheck = newSegment.vector.multiplyByScalar(Constants.ray.intersectionCheckLineLength).add(newSegment.startPosition);
                    var closestIntersection = geometryHelper.getClosestIntersectionLine(newSegment.startPosition, interSectionCheck, obstacles);

                    if (!closestIntersection.obstacle) {
                        console.error("Can't find next intersection!");
                    }

                    newSegment.intersectionPoint = closestIntersection.point;
                    newSegment.nextObstacle = closestIntersection.obstacle;
                    newSegment.sideOfObstacle = geometryHelper.checkSideOfLine(closestIntersection.obstacle, newSegment.startPosition);

                    var newSegmentDistanceToIntersection = geometryHelper.distanceBetweenTwoPoints(newSegment.startPosition, newSegment.intersectionPoint);
                    var newSegmentMoveAmount = Math.min(remainderMove, newSegmentDistanceToIntersection);

                    newSegment.endPosition = newSegment.vector.multiplyByScalar(newSegmentMoveAmount).add(newSegment.startPosition);

                    // Normal vector
                    var normalVector = geometryHelper.getNormalVector(newSegment.nextObstacle, newSegment.intersectionPoint, newSegment.sideOfObstacle);
                    newSegment.normalVector = normalVector.vector;
                    newSegment.normalVectorEndPoint = normalVector.endPoint;

                    // Reflection vector
                    var reflectionVector = geometryHelper.getReflectionVector(newSegment.vector, newSegment.normalVector, newSegment.intersectionPoint);
                    newSegment.reflectionVector = reflectionVector.vector;
                    newSegment.reflectionVectorEndPoint = reflectionVector.endPoint;

                    newSegments.push(newSegment);
                    remainderMove -= newSegmentMoveAmount;
                }
            }

            if (!segment.finished && moveStartPosition > 0) {
                segment.startPosition = segment.vector.multiplyByScalar(moveStartPosition).add(segment.startPosition);
            }

            if (!segment.bounced) {
                segment.endPosition = segment.vector.multiplyByScalar(maxSegmentMoveAmount).add(segment.endPosition);
            }

            if (!segment.bounced) {
                segment.bounced = justBounced;
            }
        });

        this.addSegments(newSegments);
        this.removeFinishedSegments();
    }

    addSegment(segment: ISegment) {
        this._segments.push(segment);
    }

    addSegments(segments: ISegment[]) {
        this._segments.push(...segments);
    }

    removeFinishedSegments() {
        this._segments = this._segments.filter((segment: any) => !segment.finished);
    }
}

