import Constants from './constants';
import { Vector } from './classes/vector';

class Helpers {
    intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
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

    isPointOnLine(point, lineStart, lineEnd) {
        // if AC is horizontal
        if (lineStart.x === lineEnd.x) return lineStart.x == point.x;

        // if AC is vertical
        if (lineStart.y === lineEnd.y) return lineStart.y == point.y;

        // match the gradients
        return this.slopeForTwoPoints(lineStart, lineEnd) === this.slopeForTwoPoints(point, lineEnd);
    }

    distanceBetweenTwoPoints(point1, point2) {
        return Math.sqrt(Math.abs(Math.pow(point1.y - point2.y, 2) + Math.pow(point1.x - point2.x, 2)));
    }

    slopeForTwoPoints(point1, point2) {
        if (point2.x === point1.x)
            return undefined;

        var slope = (point2.y - point1.y) / (point2.x - point1.x);
        return slope;
    }

    // Outer product
    checkSideOfLine(line, point) {
        return Math.sign((point.x - line.from.x) * (line.to.y - line.from.y) - (point.y - line.from.y) * (line.to.x - line.from.x));
    }

    // Dot product
    dotProduct(vector1, vector2) {
        return (vector1.x * vector2.x) + (vector1.y * vector2.y);
    }

    radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    drawGrid(context, canvas) {
        //drawLine(context, { x: 0, y: -canvas.height / 2 }, { x: 0, y: canvas.height / 2 }, "silver", .5);

        let i;
        for (i = -canvas.width / 2; i <= canvas.width / 2; i+=50)
            this.drawLine(context, { x: i, y: -canvas.height / 2 }, { x: i, y: canvas.height / 2 }, "silver", 0.5);

        for (i = -canvas.height / 2; i <= canvas.height / 2; i+=50) {
            this.drawLine(context, { x: -canvas.width / 2, y: i }, { x: canvas.width / 2, y: i }, "silver", 0.5);
        }

        this.drawCircle(context, { x: 0, y: 0 }, 2, "silver");
    }

    drawObstacles(context, obstacles) {
        obstacles.forEach((item) => {
            this.drawLine(context, item.from, item.to, (item.selected ? "red" : "gray"), 2);
        });
    }

    drawText(context, x, y, text, font, color) {
        context.font = font;
        context.fillStyle = color;
        context.fillText(text, x, y);
    }

    drawCircle(context, point, radius, color) {
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
        context.fillStyle = color;
        context.fill();
    }

    drawRay(context, ray, color) {
        context.beginPath();
        context.moveTo(ray.startPosition.x, ray.startPosition.y);
        context.lineTo(ray.endPosition.x, ray.endPosition.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
    }

    drawLine(context, fromPoint, toPoint, color, lineWidth) {
        context.beginPath();
        context.moveTo(fromPoint.x, fromPoint.y);
        context.lineTo(toPoint.x, toPoint.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
    }

    getNormalVector(obstacle, intersectionPoint, sideOfObstacle) {
        var normalVectorSlope = this.slopeForTwoPoints(obstacle.from, obstacle.to);
        var normalVector = (normalVectorSlope === undefined)
            ? new Vector(1, 0)
            : new Vector(normalVectorSlope, -1).normalize();

        var normalVectorEndPosition = normalVector.multiplyByScalar(Constants.ray.normalLineLength).addVector(intersectionPoint);
        var normalSideOfObstacle = this.checkSideOfLine(obstacle, normalVectorEndPosition);
        if (sideOfObstacle !== normalSideOfObstacle) {
            normalVector = normalVector.multiplyByScalar(-1).normalize();
            normalVectorEndPosition = normalVector.multiplyByScalar(Constants.ray.normalLineLength).addVector(intersectionPoint);
        }

        return {
            vector: normalVector,
            endPoint: normalVectorEndPosition
        };
    }

    getReflectionVector(rayVector, normalVector, intersectionPoint) {
        // (v + 2 * n * (-v dot n))
        var dot = this.dotProduct(normalVector, rayVector.flip());
        var reflectionVector = normalVector.multiplyByScalar(dot * 2).addVector(rayVector).normalize();
        var reflectionVectorEndPosition = reflectionVector.multiplyByScalar(Constants.ray.reflactionLineLength).addVector(intersectionPoint);

        return {
            vector: reflectionVector,
            endPoint: reflectionVectorEndPosition
        };
    }

    getClosestIntersectionLine(startPosition, endPosition, obstacles) {
        var closestObstacle = null, closestIntersectionPoint = null;
        var leastDistance = null;

        obstacles.forEach((obstacle) => {
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

        if (closestObstacle)
            closestObstacle.selected = true;

        return {
            point: closestIntersectionPoint,
            obstacle: closestObstacle
        };
    }
}


export default new Helpers();