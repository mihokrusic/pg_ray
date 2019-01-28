import { IPoint } from './vector'
import { IRay } from './ray'

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

export interface IState {
	activate(): void;

	onMouseMove(event: MouseEvent): void;
	onMouseDown(event: MouseEvent): void;
	onMouseUp(event: MouseEvent): void;

	onTouchStart(event: TouchEvent): void;
	onTouchEnd(event: TouchEvent): void;
	onTouchCancel(event: TouchEvent): void;
	onTouchMove(event: TouchEvent): void;

	onKeyUp(event: KeyboardEvent): void;

	onUpdate(dt: number): void;
	onRender(dt: number): void;
}

export class State implements IState {

	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	canvasOffset: ClientRect;

	pointerMoveEvent: IPoint = null;
	pointerDownEvent: IPoint = null;
	pointerUpEvent: IPoint = null;

	rays: IRay[];
	obstacles: any[];

	constructor(canvas: HTMLCanvasElement) {
		if (new.target === State) {
	        throw new TypeError("Cannot construct State instances directly");
	    }

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.canvasOffset = canvas.getBoundingClientRect();

		// TODO: maybe somewhere else?
		this.rays = [];
		this.obstacles = globalObstacles;
	}

	/*
		Lifecycle methods
	*/
	activate() {}


	/*
		DOM EVENTS
	*/
	onMouseMove(event: MouseEvent) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event);
	}
	onMouseDown(event: MouseEvent) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event);
	}
	onMouseUp(event: MouseEvent) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event);
	}


	onTouchStart(event: TouchEvent) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event.touches[0]);
	}
	onTouchEnd(event: TouchEvent) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event.changedTouches[0]);
	}
	onTouchCancel(event: TouchEvent) {
		this.pointerDownEvent = null;
		this.pointerUpEvent = null;
	}
	onTouchMove(event: TouchEvent) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event.touches[0]);
	}


	onKeyUp(event: KeyboardEvent) {}

	onUpdate(dt: number) {}
	onRender(dt: number) {}

	private _getCordinatesFromEvent(event: any): IPoint {
		return {
			x: event.clientX - this.canvasOffset.left - this.canvas.width / 2,
			y: (event.clientY * -1) + this.canvasOffset.top + this.canvas.height / 2
		};
	}
}