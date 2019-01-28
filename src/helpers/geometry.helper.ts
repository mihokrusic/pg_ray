import Constants from '../constants';
import { Vector, IPoint, IVector } from '../classes/vector';

class GeometryHelper {
    intersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
        // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
        // Determine the intersection point of two line segments
        // Return FALSE if the lines don't intersect

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }

        var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return false;
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }

        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);

        return {x, y};
    }

    isPointOnLine(point: IPoint, lineStart: IPoint, lineEnd: IPoint) {
        // if AC is horizontal
        if (lineStart.x === lineEnd.x) return lineStart.x == point.x;

        // if AC is vertical
        if (lineStart.y === lineEnd.y) return lineStart.y == point.y;

        // match the gradients
        return this.slopeForTwoPoints(lineStart, lineEnd) === this.slopeForTwoPoints(point, lineEnd);
    }

    distanceBetweenTwoPoints(point1: IPoint, point2: IPoint) {
        return Math.sqrt(Math.abs(Math.pow(point1.y - point2.y, 2) + Math.pow(point1.x - point2.x, 2)));
    }

    slopeForTwoPoints(point1: IPoint, point2: IPoint) {
        if (point2.x === point1.x)
            return undefined;

        var slope = (point2.y - point1.y) / (point2.x - point1.x);
        return slope;
    }

    // Outer product
    checkSideOfLine(line: any, point: IPoint) {
        return Math.sign((point.x - line.from.x) * (line.to.y - line.from.y) - (point.y - line.from.y) * (line.to.x - line.from.x));
    }

    // Dot product
    dotProduct(vector1: IPoint, vector2: IPoint) {
        return (vector1.x * vector2.x) + (vector1.y * vector2.y);
    }

    radToDeg(rad: number) {
        return rad * (180 / Math.PI);
    }

    degToRad(deg: number) {
        return deg * (Math.PI / 180);
    }

    getNormalVector(obstacle: any, intersectionPoint: IPoint, sideOfObstacle: number) {
        var normalVectorSlope = this.slopeForTwoPoints(obstacle.from, obstacle.to);
        var normalVector = (normalVectorSlope === undefined)
            ? new Vector(1, 0)
            : new Vector(normalVectorSlope, -1).normalize();

        var normalVectorEndPosition = normalVector.multiplyByScalar(Constants.ray.normalLineLength).add(intersectionPoint);
        var normalSideOfObstacle = this.checkSideOfLine(obstacle, normalVectorEndPosition);
        if (sideOfObstacle !== normalSideOfObstacle) {
            normalVector = normalVector.multiplyByScalar(-1).normalize();
            normalVectorEndPosition = normalVector.multiplyByScalar(Constants.ray.normalLineLength).add(intersectionPoint);
        }

        return {
            vector: normalVector,
            endPoint: normalVectorEndPosition
        };
    }

    getReflectionVector(rayVector: IVector, normalVector: IVector, intersectionPoint: IPoint) {
        // (v + 2 * n * (-v dot n))
        var dot = this.dotProduct(normalVector, rayVector.flip());
        var reflectionVector = normalVector.multiplyByScalar(dot * 2).add(rayVector).normalize();
        var reflectionVectorEndPosition = reflectionVector.multiplyByScalar(Constants.ray.reflectionLineLength).add(intersectionPoint);

        return {
            vector: reflectionVector,
            endPoint: reflectionVectorEndPosition
        };
    }

    getClosestIntersectionLine(startPosition: IPoint, endPosition: IPoint, obstacles: any) {
        var closestObstacle: any = null;
        var closestIntersectionPoint: IPoint = null;
        var leastDistance: number = null;

        obstacles.forEach((obstacle: any) => {
            var pointOnLine = this.isPointOnLine(startPosition, obstacle.from, obstacle.to);
            var intersectPoint = !pointOnLine && this.intersect(
                                    startPosition.x, startPosition.y, endPosition.x, endPosition.y,
                                    obstacle.from.x, obstacle.from.y, obstacle.to.x, obstacle.to.y);

            if (!pointOnLine && intersectPoint) {
                var currentDistance = this.distanceBetweenTwoPoints(startPosition, intersectPoint);
                if ((!leastDistance || leastDistance > currentDistance) && currentDistance > Constants.ray.minDistanceIntersectionTrigger) {
                    leastDistance = currentDistance;
                    closestObstacle = obstacle;
                    closestIntersectionPoint = intersectPoint;
                }
            }
            obstacle.selected = false;
        });

        if (closestObstacle) {
            closestObstacle.selected = true;
        }

        return {
            point: closestIntersectionPoint,
            obstacle: closestObstacle
        };
    }
}


export default new GeometryHelper();