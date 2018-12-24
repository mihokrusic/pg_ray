(function () {
    window.helpers = {
        intersect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
            // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
            // Determine the intersection point of two line segments
            // Return FALSE if the lines don't intersect

            // Check if none of the lines are of length 0
            if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
                return false
            }

            denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

            // Lines are parallel
            if (denominator === 0) {
                return false
            }

            let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
            let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

            // is the intersection along the segments
            if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
                return false
            }

            // Return a object with the x and y coordinates of the intersection
            let x = x1 + ua * (x2 - x1)
            let y = y1 + ua * (y2 - y1)

            return {x, y}
        },
        isPointOnLine: function(point, lineStart, lineEnd) {
		   // if AC is horizontal
		   if (lineStart.x === lineEnd.x) return lineStart.x == point.x;

		   // if AC is vertical
		   if (lineStart.y === lineEnd.y) return lineStart.y == point.y;

		   // match the gradients
		   return (lineStart.x - lineEnd.x) * (lineStart.y - lineEnd.y) === (lineEnd.x - point.x) * (lineEnd.y - point.y);
        },
        distanceBetweenTwoPoints: function(point1, point2) {
            return Math.sqrt(Math.abs(Math.pow(point1.y - point2.y, 2) + Math.pow(point1.x - point2.x, 2)));
        },



        drawObstacles: function(context, obstacles) {
            obstacles.forEach((item) => {
                context.beginPath();
                context.strokeStyle = (item.selected ? "red" : "gray");
                context.moveTo(item.fromX, item.fromY);
                context.lineTo(item.toX, item.toY);
                context.stroke();
            });
        },
        drawText: function(context, x, y, text, font, color) {
            context.font = font;
            context.fillStyle = color;
            context.fillText(text, x, y);
        },
        drawCircle: function(context, x, y, radius, color) {
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            context.fillStyle = color;
            context.fill();
        },
        drawRay: function(context, ray, color) {
            context.beginPath();
            context.moveTo(ray.position.x, ray.position.y);
            context.lineTo(ray.endPosition.x, ray.endPosition.y);
            context.strokeStyle = color;
            context.stroke();
        },
        drawLine: function(context, fromX, fromY, toX, toY, color) {
            context.beginPath();
            context.moveTo(fromX, fromY);
            context.lineTo(toX, toY);
            context.strokeStyle = color;
            context.stroke();
        },
        markClosestIntersectLines: function(startPosition, obstacles, pointerData, closestObstacle) {
            var closedObstacle = null, closestIntersectionPoint = null;
            var minimumDistance = null;

            obstacles.forEach((obstacle) => {
                var pointOnLine = helpers.isPointOnLine(startPosition, {x: obstacle.fromX, y: obstacle.fromY}, {x: obstacle.toX, y: obstacle.toY});
                var intersectPoint = !pointOnLine && helpers.intersect(
                                        startPosition.x, startPosition.y, pointerData.x, pointerData.y,
                                        obstacle.fromX, obstacle.fromY, obstacle.toX, obstacle.toY);

                if (!pointOnLine && intersectPoint) {
                    var currentDistance = helpers.distanceBetweenTwoPoints(startPosition, intersectPoint);
                    if (!minimumDistance || minimumDistance > currentDistance) {
                        closedObstacle = obstacle;
                        closestIntersectionPoint = intersectPoint;
                    }
                }

                obstacle.selected = false;
            });

            if (closedObstacle)
                closedObstacle.selected = true;

            return {
                point: closestIntersectionPoint,
                obstacle: closestObstacle
            }
        }
    }
}());