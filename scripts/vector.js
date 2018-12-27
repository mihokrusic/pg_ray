var Vector = function(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.length = function() {
	return Math.sqrt(Math.abs(Math.pow(this.y, 2) + Math.pow(this.x, 2)));
};

Vector.prototype.flip = function() {
	return new Vector(-this.x, -this.y);
}

Vector.prototype.normalize = function() {
	var length = this.length();
	return new Vector(this.x / length, this.y / length);
}

Vector.prototype.addVector = function(vector) {
	return new Vector(this.x + vector.x, this.y + vector.y);
};

Vector.prototype.substract = function(vector) {
	return new Vector(this.x - vector.x, this.y + vector.y);
};

Vector.prototype.substractFrom = function(vector) {
	return new Vector(vector.x - this.x, vector.y + this.y);
};

Vector.prototype.multiplyByScalar = function(scalar) {
	return new Vector(this.x * scalar, this.y * scalar);
};