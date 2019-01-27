class Constants {
    constructor() {
        this.ray = {
            speed: 500,
            length: 50,
            maxBounces: 50,
            normalLineLength: 25,
            reflectionLineLength: 25,
            intersectionCheckLineLength: 10000,
            minDistanceIntersectionTrigger: 0.1
        };

        this.debugLines = false;
    }
}

export default new Constants();