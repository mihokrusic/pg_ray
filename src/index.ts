import { RunningState } from './classes/states/state.running';
import { EditingState } from './classes/states/state.editing';
import { IState } from './classes/state';
import drawingHelper from './helpers/drawing.helper';

interface IStates {
    current: IState;
    running: IState;
    editing: IState;
}

/* TODO
    - add less
    - double buffer
    - where to store obstacles
    - obstacle reaction to hit
	- state machine for different states (running, editing, paused...)
	- cordinate system for canvas?
*/
class Main {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    animationHandle: number;
    lastTimestamp: number;

    states: IStates;

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.context.transform(1, 0, 0, -1, this.canvas.width / 2, this.canvas.height / 2);

        this.canvas.addEventListener("mousemove", (event) => this.onMouseMove(event));
        this.canvas.addEventListener("mouseup", (event) => this.onMouseUp(event));
        this.canvas.addEventListener("mousedown", (event) => this.onMouseDown(event));

        this.canvas.addEventListener("touchstart", (event) => this.onTouchStart(event), false);
        this.canvas.addEventListener("touchend", (event) => this.onTouchEnd(event), false);
        this.canvas.addEventListener("touchcancel", (event) => this.onTouchCancel(event), false);
        this.canvas.addEventListener("touchmove", (event) => this.onTouchMove(event), false);

        this.canvas.addEventListener("keyup", (event) => this.onKeyUp(event));

        // TODO: bind buttons

        // Initialize states
        this.states = {
            current: null,
            running: new RunningState(this.canvas),
            editing: new EditingState(this.canvas)
        };
        this.states.current = this.states.running;

        // Create & start
        this.animationHandle = window.requestAnimationFrame((timestamp) => this.onUpdate(timestamp));
        this.runOrPause();
    }

    onMouseMove(event: MouseEvent) {
        this.states.current.onMouseMove(event);
    }

    onMouseUp(event: MouseEvent) {
        this.states.current.onMouseUp(event);
    }

    onMouseDown(event: MouseEvent) {
        this.states.current.onMouseDown(event);
    }


    onTouchStart(event: TouchEvent) {
        this.states.current.onTouchStart(event);
    }

    onTouchEnd(event: TouchEvent) {
        this.states.current.onTouchEnd(event);
    }

    onTouchCancel(event: TouchEvent) {
        this.states.current.onTouchCancel(event);
    }

    onTouchMove(event: TouchEvent) {
        this.states.current.onTouchMove(event);
    }

    onKeyUp(event: KeyboardEvent) {
        this.states.current.onKeyUp(event);
    }

    // Events
    runOrPause() {
        document.getElementById('editButton').removeAttribute("disabled");
        document.getElementById('runPauseButton').innerHTML = (this.states.current === this.states.running ? 'Pause' : 'Run');
        this.states.current = this.states.running;
        this.states.current.activate();
    }

    edit() {
        document.getElementById('runPauseButton').innerHTML = 'Run';
        document.getElementById('editButton').setAttribute("disabled","disabled");
        this.states.current = this.states.editing;
        this.states.current.activate();
    }

    onUpdate(timestamp: number) {
        if (!this.lastTimestamp)
            this.lastTimestamp = timestamp;

        var dt = (timestamp - this.lastTimestamp) / 1000;

        // update state
        this.states.current.onUpdate(dt);

        // render
        this.context.clearRect(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height);
        drawingHelper.drawGrid(this.context, this.canvas);

        this.states.current.onRender(dt);

        // timing
        this.lastTimestamp = timestamp;
        this.animationHandle = window.requestAnimationFrame((timestamp) => this.onUpdate(timestamp));
    }
}

new Main();