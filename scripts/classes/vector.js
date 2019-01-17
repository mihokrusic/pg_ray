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
	};

	substract(vector) {
		return new Vector(this.x - vector.x, this.y + vector.y);
	};

	substractFrom(vector) {
		return new Vector(vector.x - this.x, vector.y + this.y);
	};

	multiplyByScalar(scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	};
}

