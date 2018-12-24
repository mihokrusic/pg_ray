var Vector = function(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.addVector = function(vector) {
	return new Vector(this.x + vector.x, this.y + vector.y);
}

Vector.prototype.substract = function(vector) {
	return new Vector(this.x - vector.x, this.y + vector.y);
}

Vector.prototype.substractFrom = function(vector) {
	return new Vector(vector.x - this.x, vector.y + this.y);
}

Vector.prototype.multiplyByScalar = function(scalar) {
	return new Vector(this.x * scalar, this.y * scalar);
}