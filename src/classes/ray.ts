import { IVector, IPoint } from "./vector";
import geometryHelper from "../helpers/geometry.helper";

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

    private bounces: number;
    private _segments: ISegment[];

	constructor() {
        this.bounces = 0;
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

