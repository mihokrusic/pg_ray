class EditingState extends State {

	constructor(canvas) {
		super(canvas);

		this.firstPoint = null;
		this.lastPoint = null;
	}

	activate() {
		console.log("editing, activate!");
	}

	onMouseMove(event) {
		super.onMouseMove(event);
	}

	onMouseDown(event) {
		super.onMouseDown(event);
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
