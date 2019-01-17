/* TODO
	- move to typescript
	- gulp to automatically transpile
	- module loader instead of including everything
	- double buffer
	- state machine for different states (running, editing, paused...)
	- cordinate system for canvas?
*/

(function(window) {

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

	}
	window.edit = function() {
		document.getElementById('runPauseButton').innerHTML = 'Run';
		document.getElementById('editButton').setAttribute("disabled","disabled");
		states.current = states.editing;
		states.current.activate();
	}

	// Create & start
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');
	context.transform(1, 0, 0, -1, canvas.width / 2, canvas.height / 2);

	canvas.addEventListener("mousemove", (event) => onMouseMove(event));
	canvas.addEventListener("mouseup", (event) => onMouseUp(event));
	canvas.addEventListener("keyup", (event) => onKeyUp(event));

	// Initialize states
	var states = {
		current: null,
		running: new RunningState(canvas),
		editing: new EditingState(canvas)
	}
	states.current = states.running;

	animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));

	window.runOrPause();


	function onMouseMove(event) {
		states.current.onMouseMove(event);
	}


	function onMouseUp(event) {
		states.current.onMouseUp(event);
	};


	function onKeyUp(event) {
		states.current.onKeyUp(event);
	};


	function onUpdate(timestamp) {
		if (!lastTimestamp)
			lastTimestamp = timestamp;

		var dt = (timestamp - lastTimestamp) / 1000;

		// update state
		states.current.onUpdate(dt);

		// render
	    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	    helpers.drawGrid(context, canvas);

	    states.current.onRender(dt);

	    // timing
	  	lastTimestamp = timestamp;
		animationHandle = window.requestAnimationFrame((timestamp) => onUpdate(timestamp));
	}

})(window);

