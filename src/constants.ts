interface IRayBounceConstants {
    bounceSpeed: number;
    time: number;
}

interface IRayConstants {
    speed: number;
    length: number;
    maxBounces: number;
    normalLineLength: number;
    reflectionLineLength: number;
    intersectionCheckLineLength: number;
    minDistanceIntersectionTrigger: number;

    bounce: IRayBounceConstants;
}

class Constants {

    ray: IRayConstants;
    debugLines: boolean = false;

    constructor() {
        this.ray = {
            speed: 500,
            length: 50,
            maxBounces: 50,
            normalLineLength: 25,
            reflectionLineLength: 25,
            intersectionCheckLineLength: 10000,
            minDistanceIntersectionTrigger: 0.1,

            bounce: {
                bounceSpeed: 1000,
                time: 0.5
            }
        };
    }
}

export default new Constants();