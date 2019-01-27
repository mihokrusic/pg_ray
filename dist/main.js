/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/classes/state.js":
/*!******************************!*\
  !*** ./src/classes/state.js ***!
  \******************************/
/*! exports provided: State */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "State", function() { return State; });
let globalObstacles = [
	// outer
	{ from: { x: -490, y: -290 }, to: { x: 490, y: -290 }, selected: false },
	{ from: { x: 490, y: -290 }, to: { x: 490, y: 290 }, selected: false },
	{ from: { x: 490, y: 290 }, to: { x: -490, y: 290 }, selected: false },
	{ from: { x: -490, y: 290 }, to: { x: -490, y: -290 }, selected: false },
	// inner
	{ from: { x: -100, y: -150 }, to: { x: -50, y: 50 }, selected: false },
	{ from: { x: -400, y: 50 }, to: { x: -100, y: 150 }, selected: false },
	{ from: { x: 150, y: 50 }, to: { x: 400, y: -150 }, selected: false },
	{ from: { x: 400, y: -130 }, to: { x: 300, y: -130 }, selected: false },
	{ from: { x: 50, y: -50 }, to: { x: 300, y: 100 }, selected: false },
];

class State {

	constructor(canvas) {
		if (new.target === State) {
	        throw new TypeError("Cannot construct State instances directly");
	    }

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.canvasOffset = canvas.getBoundingClientRect();

		this.pointerMoveEvent = null;
		this.pointerDownEvent = null;
		this.pointerUpEvent = null;

		// TODO: maybe somewhere else?
		this.rays = [];
		this.currentRay = {
			vector: {},
			position: {}
		};

		this.obstacles = globalObstacles;
	}

	/*
		Lifecycle methods
	*/
	activate() {

	}


	/*
		DOM EVENTS
	*/
	onMouseMove(event) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event);
	}
	onMouseDown(event) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event);
		//this.pointerDownEvent.button = event.button;
	}
	onMouseUp(event) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event);
		//this.pointerUpEvent.button = event.button;
	}


	onTouchStart(event) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event.touches[0]);
	}
	onTouchEnd(event) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event.changedTouches[0]);
	}
	onTouchCancel(event) {
		this.pointerDownEvent = null;
		this.pointerUpEvent = null;
	}
	onTouchMove(event) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event.touches[0]);
	}


	onKeyUp(event) {}


	onUpdate(dt) {}
	onRender(dt) {}

	/*
		Helper methods
	*/
	_getCordinatesFromEvent(event) {
		return {
			x: event.clientX - this.canvasOffset.x - this.canvas.width / 2,
			y: (event.clientY * -1) + this.canvasOffset.y + this.canvas.height / 2
		};
	}
}

/***/ }),

/***/ "./src/classes/states/state.editing.js":
/*!*********************************************!*\
  !*** ./src/classes/states/state.editing.js ***!
  \*********************************************/
/*! exports provided: EditingState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditingState", function() { return EditingState; });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../state */ "./src/classes/state.js");


class EditingState extends _state__WEBPACK_IMPORTED_MODULE_0__["State"] {

	constructor(canvas) {
		super(canvas);

		this.firstPoint = null;
		this.lastPoint = null;
	}

	activate() {
		console.log("editing, activate!");
	}

	onMouseUp(event) {
		super.onMouseUp(event);

		if (!this.firstPoint)
			this.firstPoint = this.pointerMoveEvent;
		else
			this.lastPoint = this.pointerMoveEvent;

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
		if (this.firstPoint && this.lastPoint) {
			this.obstacles.push({
				from: {
					x: this.firstPoint.x,
					y: this.firstPoint.y
				},
				to: {
					x: this.lastPoint.x,
					y: this.lastPoint.y
				},
				selected: false
			});

			this.firstPoint = null;
			this.lastPoint = null;
		}
	}

	onRender(dt) {
	    helpers.drawObstacles(this.context, this.obstacles);

    	if (this.firstPoint) {
	    	helpers.drawCircle(this.context, this.firstPoint, 4, "green");
	    	helpers.drawLine(this.context, this.firstPoint, this.pointerMoveEvent, "green", 1);
	    	helpers.drawCircle(this.context, this.pointerMoveEvent, 4, "green");
    	}
	}

}


/***/ }),

/***/ "./src/classes/states/state.running.js":
/*!*********************************************!*\
  !*** ./src/classes/states/state.running.js ***!
  \*********************************************/
/*! exports provided: RunningState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RunningState", function() { return RunningState; });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../state */ "./src/classes/state.js");
/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../vector */ "./src/classes/vector.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../../constants */ "./src/constants.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../../helpers */ "./src/helpers.js");





class RunningState extends _state__WEBPACK_IMPORTED_MODULE_0__["State"] {

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
        return _.sumBy(ray.segments, function(segment) { return segment.finished ? 0 : _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].distanceBetweenTwoPoints(segment.startPosition, segment.endPosition); });
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
        this.currentRay.vector = new _vector__WEBPACK_IMPORTED_MODULE_1__["Vector"](Math.cos(angle), Math.sin(angle)).normalize(); // TODO: double creation, blah
        this.currentRay.position = this.currentRay.vector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_2__["default"].ray.length).addVector(this.pointerDownEvent);

        var interSectionCheck = this.currentRay.vector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_2__["default"].ray.intersectionCheckLineLength).addVector(this.pointerDownEvent);
        var closestIntersection = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getClosestIntersectionLine(this.pointerDownEvent, interSectionCheck, this.obstacles);

        if (!closestIntersection.obstacle) {
            console.error("Can't find next intersection!");
        }

        this.currentRay.intersectionPoint = closestIntersection.point;
        this.currentRay.nextObstacle = closestIntersection.obstacle;

        if (this.currentRay.nextObstacle) {
            this.currentRay.sideOfObstacle = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].checkSideOfLine(this.currentRay.nextObstacle, this.currentRay.position);

            // Normal vector
            var normalVector = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getNormalVector(this.currentRay.nextObstacle, this.currentRay.intersectionPoint, this.currentRay.sideOfObstacle);

            this.currentRay.normalVector = normalVector.vector;
            this.currentRay.normalVectorEndPoint = normalVector.endPoint;

            // Reflection vector
            var reflectionVector = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getReflectionVector(this.currentRay.vector, this.currentRay.normalVector, this.currentRay.intersectionPoint);
            this.currentRay.reflectionVector = reflectionVector.vector;
            this.currentRay.reflectionVectorEndPoint = reflectionVector.endPoint;
        } else {
            this.currentRay.normalVector = null;
            this.currentRay.normalVectorEndPoint = null;
            this.currentRay.reflectionVector = null;
            this.currentRay.reflectionVectorEndPoint = null;
        }

        console.log("A0");
        if (this.currentRay.intersectionPoint) {
            console.log("A1");
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
        var frameMoveAmount = dt * _constants__WEBPACK_IMPORTED_MODULE_2__["default"].ray.speed;
        var newSegments = [];
        this.rays.forEach((ray) => {

            let currentRayLength = this.getRayLength(ray);

            ray.segments.forEach((segment, index, array) => {
                let currentSegmentLength = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].distanceBetweenTwoPoints(segment.startPosition, segment.endPosition);
                let distanceToIntersection = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].distanceBetweenTwoPoints(segment.endPosition, segment.intersectionPoint);

                let maxSegmentMoveAmount = Math.min(frameMoveAmount, distanceToIntersection);
                let remainderMove = frameMoveAmount - maxSegmentMoveAmount;

                let moveStartPosition = 0;
                if (index === 0) {
                    moveStartPosition = Math.max(0, (currentRayLength + frameMoveAmount) - _constants__WEBPACK_IMPORTED_MODULE_2__["default"].ray.length);
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
                        var interSectionCheck = newSegment.vector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_2__["default"].ray.intersectionCheckLineLength).addVector(newSegment.startPosition);
                        var closestIntersection = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getClosestIntersectionLine(newSegment.startPosition, interSectionCheck, this.obstacles);

                        if (!closestIntersection.obstacle) {
                            console.error("Can't find next intersection!");
                        }

                        newSegment.intersectionPoint = closestIntersection.point;
                        newSegment.nextObstacle = closestIntersection.obstacle;
                        newSegment.sideOfObstacle = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].checkSideOfLine(closestIntersection.obstacle, newSegment.startPosition);

                        var newSegmentDistanceToIntersection = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].distanceBetweenTwoPoints(newSegment.startPosition, newSegment.intersectionPoint);
                        var newSegmentMoveAmount = Math.min(remainderMove, newSegmentDistanceToIntersection);

                        newSegment.endPosition = newSegment.vector.multiplyByScalar(newSegmentMoveAmount).addVector(newSegment.startPosition);

                        // Normal vector
                        var normalVector = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getNormalVector(newSegment.nextObstacle, newSegment.intersectionPoint, newSegment.sideOfObstacle);
                        newSegment.normalVector = normalVector.vector;
                        newSegment.normalVectorEndPoint = normalVector.endPoint;

                        // Reflection vector
                        var reflectionVector = _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].getReflectionVector(newSegment.vector, newSegment.normalVector, newSegment.intersectionPoint);
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
        _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawObstacles(this.context, this.obstacles);

        // Rays
        this.rays.forEach((ray) => {
            ray.segments.forEach((segment) => {
                _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawRay(this.context, segment, "green");

                if (_constants__WEBPACK_IMPORTED_MODULE_2__["default"].debugLines) {
                    _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawLine(this.context, segment.intersectionPoint, segment.normalVectorEndPoint, "orange", 1);
                    _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawLine(this.context, segment.intersectionPoint, segment.reflectionVectorEndPoint, "blue", 1);
                    _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawCircle(this.context, segment.intersectionPoint, 4, "#91C8FF");
                }
            });
        });

        if (this.pointerMoveEvent && this.pointerDownEvent && !this.pointerUpEvent) {
            _helpers__WEBPACK_IMPORTED_MODULE_3__["default"].drawLine(this.context, this.pointerDownEvent, this.pointerMoveEvent, "#44E500", 1);
        }
    }

}


/***/ }),

/***/ "./src/classes/vector.js":
/*!*******************************!*\
  !*** ./src/classes/vector.js ***!
  \*******************************/
/*! exports provided: Vector */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Vector", function() { return Vector; });
class Vector {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	get length() {
		return Math.sqrt(Math.abs(Math.pow(this.y, 2) + Math.pow(this.x, 2)));
	}

	flip() {
		return new Vector(-this.x, -this.y);
	}

	normalize() {
		var length = this.length;
		return new Vector(this.x / length, this.y / length);
	}

	addVector(vector) {
		return new Vector(this.x + vector.x, this.y + vector.y);
	}

	substract(vector) {
		return new Vector(this.x - vector.x, this.y + vector.y);
	}

	substractFrom(vector) {
		return new Vector(vector.x - this.x, vector.y + this.y);
	}

	multiplyByScalar(scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	}
}



/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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

/* harmony default export */ __webpack_exports__["default"] = (new Constants());

/***/ }),

/***/ "./src/helpers.js":
/*!************************!*\
  !*** ./src/helpers.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.js");
/* harmony import */ var _classes_vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classes/vector */ "./src/classes/vector.js");



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
            ? new _classes_vector__WEBPACK_IMPORTED_MODULE_1__["Vector"](1, 0)
            : new _classes_vector__WEBPACK_IMPORTED_MODULE_1__["Vector"](normalVectorSlope, -1).normalize();

        var normalVectorEndPosition = normalVector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_0__["default"].ray.normalLineLength).addVector(intersectionPoint);
        var normalSideOfObstacle = this.checkSideOfLine(obstacle, normalVectorEndPosition);
        if (sideOfObstacle !== normalSideOfObstacle) {
            normalVector = normalVector.multiplyByScalar(-1).normalize();
            normalVectorEndPosition = normalVector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_0__["default"].ray.normalLineLength).addVector(intersectionPoint);
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
        var reflectionVectorEndPosition = reflectionVector.multiplyByScalar(_constants__WEBPACK_IMPORTED_MODULE_0__["default"].ray.reflactionLineLength).addVector(intersectionPoint);

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
                if ((!leastDistance || leastDistance > currentDistance) && currentDistance > _constants__WEBPACK_IMPORTED_MODULE_0__["default"].ray.minDistanceIntersectionTrigger) {
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


/* harmony default export */ __webpack_exports__["default"] = (new Helpers());

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _classes_states_state_running__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classes/states/state.running */ "./src/classes/states/state.running.js");
/* harmony import */ var _classes_states_state_editing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classes/states/state.editing */ "./src/classes/states/state.editing.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.js");




/* TODO
	- move to typescript
	- gulp to automatically transpile
	- module loader instead of including everything
	- double buffer
	- state machine for different states (running, editing, paused...)
	- cordinate system for canvas?
*/

// Move to class
var canvas, context;
var animationHandle;
var lastTimestamp;

// Events
window.runOrPause = function() {
    document.getElementById('editButton').removeAttribute("disabled");
    document.getElementById('runPauseButton').innerHTML = (states.current.running ? 'Pause' : 'Run');
    states.current = states.running;
    states.current.activate();
};

window.edit = function() {
    document.getElementById('runPauseButton').innerHTML = 'Run';
    document.getElementById('editButton').setAttribute("disabled","disabled");
    states.current = states.editing;
    states.current.activate();
};

// Create & start
canvas = document.getElementById('gameCanvas');
context = canvas.getContext('2d');
context.transform(1, 0, 0, -1, canvas.width / 2, canvas.height / 2);

canvas.addEventListener("mousemove", (event) => onMouseMove(event));
canvas.addEventListener("mouseup", (event) => onMouseUp(event));
canvas.addEventListener("mousedown", (event) => onMouseDown(event));

canvas.addEventListener("touchstart", (event) => onTouchStart(event), false);
canvas.addEventListener("touchend", (event) => onTouchEnd(event), false);
canvas.addEventListener("touchcancel", (event) => onTouchCancel(event), false);
canvas.addEventListener("touchmove", (event) => onTouchMove(event), false);

canvas.addEventListener("keyup", (event) => onKeyUp(event));

// Initialize states
var states = {
    current: null,
    running: new _classes_states_state_running__WEBPACK_IMPORTED_MODULE_0__["RunningState"](canvas),
    editing: new _classes_states_state_editing__WEBPACK_IMPORTED_MODULE_1__["EditingState"](canvas)
};
states.current = states.running;

animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));

window.runOrPause();


function onMouseMove(event) {
    states.current.onMouseMove(event);
}
function onMouseUp(event) {
    states.current.onMouseUp(event);
}
function onMouseDown(event) {
    states.current.onMouseDown(event);
}


function onTouchStart(event) {
    states.current.onTouchStart(event);
}
function onTouchEnd(event) {
    states.current.onTouchEnd(event);
}
function onTouchCancel(event) {
    states.current.onTouchCancel(event);
}
function onTouchMove(event) {
    states.current.onTouchMove(event);
}


function onKeyUp(event) {
    states.current.onKeyUp(event);
    // if (event.keyCode === 81) {
    // 	var dt = 0.015;

    // 	// update state
    // 	states.current.onUpdate(dt);

    // 	// render
    // 	context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    // 	Helpers.drawGrid(context, canvas);

    // 	states.current.onRender(dt);
    // }
}


function onUpdate(timestamp) {
    if (!lastTimestamp)
        lastTimestamp = timestamp;

    var dt = (timestamp - lastTimestamp) / 1000;

    // update state
    states.current.onUpdate(dt);

    // render
    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    _helpers__WEBPACK_IMPORTED_MODULE_2__["default"].drawGrid(context, canvas);

    states.current.onRender(dt);

    // timing
    lastTimestamp = timestamp;
    animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));
}


/***/ })

/******/ });
//# sourceMappingURL=main.js.map