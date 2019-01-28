export interface IPoint {
	x: number;
	y: number;
}

export interface IVector extends IPoint {
	readonly length: number;

	flip(): Vector;
	normalize(): Vector;
	add(point: IPoint): Vector;
	substract(point: IPoint): Vector;
	substractFrom(point: IPoint): Vector;
	multiplyByScalar(scalar: number): Vector;
}


export class Vector implements IVector {

	x: number;
	y: number;

	constructor(x: number, y: number) {
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

	add(point: IPoint) {
		return new Vector(this.x + point.x, this.y + point.y);
	}

	substract(point: IPoint) {
		return new Vector(this.x - point.x, this.y + point.y);
	}

	substractFrom(point: IPoint) {
		return new Vector(point.x - this.x, point.y + this.y);
	}

	multiplyByScalar(scalar: number) {
		return new Vector(this.x * scalar, this.y * scalar);
	}
}

