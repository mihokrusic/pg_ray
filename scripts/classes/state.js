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

		this.obstacles = [
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
		this.pointerMoveEvent = {
			x: event.clientX - this.canvasOffset.x - this.canvas.width / 2,
			y: (event.clientY * -1) + this.canvasOffset.y + this.canvas.height / 2
		};
	}

	onMouseDown(event) {
		this.pointerDownEvent = event;
	}

	onMouseUp(event) {
		this.pointerUpEvent = event;
	}

	onKeyUp(event) {}

	onUpdate(dt) {}

	onRender(dt) {}
}